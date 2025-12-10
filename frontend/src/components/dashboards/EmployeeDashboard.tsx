// src/components/dashboard/EmployeeDashboard.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { useWasteStore } from '../../store/wasteStore';
import { useAuthStore } from '../../store/authStore';
import { Flame, AlertTriangle, MapPin, Check, Play, StopCircle } from 'lucide-react';
import api from '../../services/api';

export const EmployeeDashboard: React.FC = () => {
  const {
    tournees,
    points,
    fetchTournees,
    fetchPoints,
    updatePoint,
    updateTourneeStatut,
  } = useWasteStore();
  const { user } = useAuthStore();

  const [selectedTour, setSelectedTour] = useState<any | null>(null);
  const [showIncident, setShowIncident] = useState<boolean>(false);
  const [incidentMsg, setIncidentMsg] = useState('');
  const [incidentType, setIncidentType] = useState('DEBORDEMENT');

  useEffect(() => {
    fetchTournees();
    if (points.length === 0) fetchPoints();
  }, []);

  const myTours = useMemo(() => {
    if (!user) return [];
    return tournees.filter(t => (t.employeIds || []).includes(String(user.id)));
  }, [tournees, user]);

  const sortedTours = useMemo(() => {
    const enCours = myTours.filter(t => t.statut === 'EN_COURS');
    const others = myTours.filter(t => t.statut !== 'EN_COURS');
    return [...enCours, ...others];
  }, [myTours]);

  const missionPoints = useMemo(() => {
    if (!selectedTour) return [];
    return (selectedTour.pointsCollecteIds || [])
      .map((id: any) => points.find(p => String(p.id) === String(id)))
      .filter(Boolean);
  }, [selectedTour, points]);

  const handleDemarrer = async (tour: any) => {
    if (!updateTourneeStatut) return;
    await updateTourneeStatut(tour.id, 'EN_COURS');
    await fetchTournees();
  };

  const handleTerminer = async (tour: any) => {
    if (!updateTourneeStatut) return;
    await updateTourneeStatut(tour.id, 'TERMINEE');
    await fetchTournees();
  };

  const handleVider = async (pointId: string | number) => {
    try {
      await updatePoint(Number(pointId), { niveauRemplissage: 0 });
      await fetchPoints();
    } catch (e) {
      console.error('Failed to vider point', e);
    }
  };

  const handleIncident = async () => {
    if (!selectedTour || !user) return;
    try {
      await api.post('/signalements', {
        type: incidentType,
        description: incidentMsg || 'Incident signalé',
        pointCollecteId: selectedTour.pointsCollecteIds?.[0] ? Number(selectedTour.pointsCollecteIds[0]) : null,
        employeId: user.id,
      });
      setIncidentMsg('');
      setShowIncident(false);
      alert('Incident signalé');
    } catch (e) {
      console.error('Signalement error', e);
      alert('Erreur lors du signalement');
    }
  };

  const renderStatusBadge = (statut: string) => {
    const map: Record<string, string> = {
      PLANIFIEE: 'bg-orange-500',
      EN_COURS: 'bg-blue-600',
      TERMINEE: 'bg-gray-500',
    };
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-semibold ${map[statut] || 'bg-gray-400'}`}>
        {statut}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Mon planning</p>
            <h2 className="text-lg font-bold text-gray-900">Missions assignées</h2>
          </div>
          {user && (
            <div className="text-sm text-gray-600">
              Chauffeur / Éboueur · ID {user.id}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {sortedTours.length === 0 && (
          <div className="bg-white border rounded-xl p-4 text-sm text-gray-500">
            Aucune mission assignée pour l’instant.
          </div>
        )}

        {sortedTours.map((tour) => {
          const isCurrent = tour.statut === 'EN_COURS';
          return (
            <div
              key={tour.id}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                isCurrent
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:shadow'
              }`}
              onClick={() => setSelectedTour(tour)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {renderStatusBadge(tour.statut)}
                    {isCurrent && (
                      <span className="text-xs text-blue-700 font-semibold flex items-center gap-1">
                        <Flame size={12} /> Mission en cours
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-800 font-semibold">Départ {tour.heureDebut || '--:--'}</div>
                  <div className="text-xs text-gray-600">
                    Véhicule: {tour.vehiculeId || '-'} · Points: {(tour.pointsCollecteIds || []).length} · Dist: {tour.distanceKm || '?'} km
                  </div>
                </div>
                <div className="flex gap-2">
                  {tour.statut === 'PLANIFIEE' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDemarrer(tour); }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                    >
                      <Play size={14} /> Démarrer
                    </button>
                  )}
                  {tour.statut === 'EN_COURS' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleTerminer(tour); }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1"
                    >
                      <StopCircle size={14} /> Terminer
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedTour(tour); setShowIncident(true); }}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 flex items-center gap-1"
                  >
                    <AlertTriangle size={14} /> Signaler
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedTour && (
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500">Mission</p>
              <h3 className="text-base font-semibold text-gray-900">Points à collecter</h3>
            </div>
            <span className="text-xs text-gray-500">Tournée #{selectedTour.id}</span>
          </div>

          <div className="space-y-2">
            {missionPoints.length === 0 && (
              <p className="text-sm text-gray-500">Aucun point associé.</p>
            )}
            {missionPoints.map((p: any, i: number) => (
              <div key={p.id || i} className="border rounded-lg px-3 py-2 flex justify-between items-center">
                <div>
                  <div className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                    <MapPin size={14} className="text-emerald-600" /> {p.localisation || `Point ${p.id}`}
                  </div>
                  <div className="text-xs text-gray-500">Niveau: {p.niveauRemplissage}%</div>
                </div>
                <button
                  onClick={() => handleVider(p.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                >
                  <Check size={14} /> Vider
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showIncident && selectedTour && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-gray-900">Signaler un incident</h3>
              <button onClick={() => setShowIncident(false)} className="text-gray-500">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Type</label>
                <select
                  value={incidentType}
                  onChange={e => setIncidentType(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="DEBORDEMENT">Débordement</option>
                  <option value="DEGRADATION">Dégradation</option>
                  <option value="ACCIDENT">Accident</option>
                  <option value="PANNE_CAMION">Panne camion</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Description</label>
                <textarea
                  value={incidentMsg}
                  onChange={e => setIncidentMsg(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none"
                  placeholder="Décrivez le problème..."
                />
              </div>
              <button
                onClick={handleIncident}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <AlertTriangle size={16} /> Envoyer le signalement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
