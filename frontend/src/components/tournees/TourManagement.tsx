// src/components/tournees/TourList.tsx
// VERSION FINALE – CE QUE TU VOULAIS VRAIMENT VOIR

import React, { useState, useMemo, useEffect } from 'react';
import { useWasteStore } from '../../store/wasteStore';
import { useAuthStore } from '../../store/authStore';
import { Download, Upload, Flame, Zap, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { AddTourModal } from './AddTourModal';

export const TourList: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    tournees, 
    vehicules, 
    employes, 
    points,
    signalements,
    addTournee,
    deleteTournee,
    fetchTournees,
    fetchVehicules,
    fetchEmployes,
    fetchPoints,
    exportTourneesXML,
    importTourneesXML 
  } = useWasteStore();
  
  // Fetch data on component mount
  useEffect(() => {
    fetchTournees();
    if (vehicules.length === 0) {
      fetchVehicules();
    }
    if (employes.length === 0) {
      fetchEmployes();
    }
    if (points.length === 0) {
      fetchPoints();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [modeUrgenceActive, setModeUrgenceActive] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getVehicule = (id: string) => vehicules.find(v => v.id === id);
  const getNom = (id: string) => {
    const e = employes.find(x => x.id === id);
    return e ? `${e.prenom} ${e.nom[0]}.` : '?';
  };

  // Détecte si tournée contient un point en débordement imminent
  const aUnPointEnFeu = (tournee: any) => {
    if (!tournee.pointsCollecteIds || !Array.isArray(tournee.pointsCollecteIds)) return false;
    return points.some(p => {
      const pointIdStr = String(p.id);
      const pointIdNum = p.id;
      const hasPoint = tournee.pointsCollecteIds.includes(pointIdStr) || tournee.pointsCollecteIds.includes(pointIdNum);
      if (!hasPoint) return false;
      return p.niveauRemplissage >= 95 || signalements.some(s => String(s.pointCollecteId) === pointIdStr && s.statut === 'URGENT');
    });
  };

  const estTourneeIA = (tournee: any) => tournee.id?.includes('ia-') || tournee.id?.includes('opt-');

  const handleManualAdd = async (data: any) => {
    try {
      await addTournee(data);
      setIsAddModalOpen(false);
      // Refresh tournees list after adding
      await fetchTournees();
    } catch (error) {
      console.error('Failed to add tournee:', error);
    }
  };

  const handleDeleteTournee = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tournée ?')) {
      return;
    }
    try {
      await deleteTournee(id);
      await fetchTournees(); // Refresh list after deletion
    } catch (error: any) {
      console.error('Failed to delete tournee:', error);
      alert(`Erreur: ${error.response?.data?.error || error.message || 'Impossible de supprimer la tournée'}`);
    }
  };

  // TRI : Normal avant clic → Intelligent après clic
  const tourneesTriees = useMemo(() => {
    if (!modeUrgenceActive) {
      // Avant intervention : ordre d'ajout (aléatoire/simple)
      return [...tournees];
    }

    // Après intervention : priorité absolue + mouvement visible
    return [...tournees].sort((a, b) => {
      const feuA = aUnPointEnFeu(a);
      const feuB = aUnPointEnFeu(b);
      const iaA = estTourneeIA(a);
      const iaB = estTourneeIA(b);

      if (feuA && !feuB) return -1;
      if (!feuA && feuB) return 1;
      if (iaA && !iaB) return -1;
      if (!iaA && iaB) return 1;
      if (a.statut === 'EN_COURS') return -1;
      if (b.statut === 'EN_COURS') return 1;
      if (a.statut === 'TERMINEE') return 1;
      if (b.statut === 'TERMINEE') return -1;
      return 0;
    });
  }, [tournees, points, signalements, modeUrgenceActive]);

  const lancerOptimisation = async () => {
    setIsOptimizing(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const pointsEnFeu = points
        .filter(p => p.niveauRemplissage >= 92 || signalements.some(s => s.pointCollecteId === p.id && s.statut === 'URGENT'))
        .sort((a, b) => b.niveauRemplissage - a.niveauRemplissage);

      const vehDispo = vehicules.filter(v => v.statut === 'DISPONIBLE');
      const chauffeurs = employes.filter(e => e.role === 'CHAUFFEUR' && e.disponible);
      const eboueurs = employes.filter(e => e.role === 'EBOUEUR' && e.disponible);

      let restants = [...pointsEnFeu];
      let creees = 0;

      for (let i = 0; i < Math.min(4, vehDispo.length); i++) {
        if (restants.length < 2) break;
        const segment = restants.splice(0, Math.min(9, restants.length));
        const distance = Number((segment.length * 4.1 + 9).toFixed(1));

        const nouvelleTournee = {
          date: format(new Date(), 'yyyy-MM-dd'),
          vehiculeId: vehDispo[i]?.id || '',
          employeIds: [
            chauffeurs[i % chauffeurs.length]?.id || '',
            ...eboueurs.slice(i * 2, i * 2 + 2).map(e => e.id)
          ].filter(Boolean),
          pointsCollecteIds: segment.map(p => String(p.id)),
          statut: 'PLANIFIEE' as const,
          distanceKm: distance,
          heureDebut: ['06:15', '06:45', '07:15', '13:30'][i],
          heureFin: '',
        };

        // CRITICAL: Call addTournee for each AI-generated tour to save to backend
        await addTournee(nouvelleTournee);
        creees++;
      }

      // Refresh tournees list after AI optimization
      await fetchTournees();
      
      // ACTIVE LE MODE VISUEL + ANIMATION
      setModeUrgenceActive(true);
      setIsOptimizing(false);

      if (creees > 0) {
        alert(`${creees} tournées d'urgence créées ! Regarde le déplacement`);
      }
    } catch (error) {
      console.error('Error during AI optimization:', error);
      setIsOptimizing(false);
      alert('Erreur lors de la création des tournées optimisées');
    }
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Gestion des Tournées</h2>
          <p className="text-xs text-gray-500">
            {modeUrgenceActive ? 'Mode urgence activé — Priorités en haut' : 'Affichage classique'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 text-xs px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={14} /> Ajouter
          </button>
          
          <button onClick={exportTourneesXML} className="flex items-center gap-1 text-xs px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800">
            <Download size={14} /> Exporter XML
          </button>

          <label className="flex items-center gap-1 text-xs px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer">
            <Upload size={14} /> Importer XML
            <input
              type="file"
              accept=".xml"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                importTourneesXML(text);
                e.target.value = '';
              }}
            />
          </label>

          <button
            onClick={lancerOptimisation}
            disabled={isOptimizing}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg shadow-lg transition-all ${
              isOptimizing 
                ? 'bg-gray-500' 
                : 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700'
            }`}
          >
            {isOptimizing ? (
              <span>IA en cours...</span>
            ) : (
              <>
                <Flame size={17} className="text-yellow-300" />
                <span>Intervention d'urgence IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* LISTE AVEC MOUVEMENT RÉEL + DESIGN INTELLIGENT */}
      <div className="space-y-3">
        {tourneesTriees.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Aucune tournée disponible</p>
            <p className="text-sm mt-2">Cliquez sur "Ajouter" pour créer une nouvelle tournée</p>
          </div>
        ) : (
          tourneesTriees.map((tournee, index) => {
          const veh = getVehicule(tournee.vehiculeId);
          const enFeu = modeUrgenceActive && aUnPointEnFeu(tournee);
          const ia = estTourneeIA(tournee);
          const terminee = tournee.statut === 'TERMINEE';

          return (
            <div
              key={tournee.id}
              className={`
                p-3.5 rounded-lg border text-xs transition-all duration-1000 ease-out
                ${enFeu 
                  ? 'border-red-600 bg-red-50 shadow-2xl shadow-red-500/40 ring-2 ring-red-400 scale-105 animate-pulse' 
                  : ia && modeUrgenceActive
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                    : terminee
                      ? 'border-gray-200 bg-gray-50 opacity-45'
                      : 'border-gray-300 bg-white'
                }
                ${modeUrgenceActive ? 'animate__animated animate__fadeInUp' : ''}
              `}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {enFeu && (
                      <span className="flex items-center gap-1 bg-red-600 text-white px-2.5 py-0.5 rounded text-[10px] font-bold animate-pulse">
                        <Flame size={11} /> DÉBORDEMENT IMMINENT
                      </span>
                    )}
                    {ia && !enFeu && modeUrgenceActive && (
                      <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                        <Zap size={10} /> IA Optimisée
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full text-white text-[9px] ${
                      tournee.statut === 'EN_COURS' ? 'bg-blue-600' :
                      tournee.statut === 'TERMINEE' ? 'bg-gray-500' : 'bg-orange-600'
                    }`}>
                      {tournee.statut === 'PLANIFIEE' ? 'PLANIFIÉE' : tournee.statut}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-[11px]">
                    <div><span className="text-gray-500">Camion</span><br /><b>{veh?.immatriculation || '-'}</b></div>
                    <div><span className="text-gray-500">Équipe</span><br /><b>{(tournee.employeIds || []).map(getNom).join(', ') || '-'}</b></div>
                    <div><span className="text-gray-500">Pts</span><br /><b>{(tournee.pointsCollecteIds || []).length}</b></div>
                    <div><span className="text-gray-500">Dist</span><br /><b className="text-emerald-700">{tournee.distanceKm || '?'} km</b></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xl font-bold text-gray-700">
                    {tournee.heureDebut || '--:--'}
                  </div>
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => handleDeleteTournee(tournee.id)}
                      className="p-1.5 hover:bg-red-50 text-red-600 rounded transition"
                      title="Supprimer la tournée"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* Add Tour Modal */}
      <AddTourModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleManualAdd}
      />
    </div>
  );
};

// Export as both TourList and TourManagement for compatibility
const TourManagement = TourList;
export default TourList;
export { TourManagement };