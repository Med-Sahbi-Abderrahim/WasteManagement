// src/components/dashboard/SupervisorTourDashboard.tsx
// Unified Tour Management Dashboard for Supervisors

import React, { useEffect, useState } from 'react';
import { useWasteStore } from '../../store/wasteStore';
import { Truck, Users, CheckCircle, Clock, AlertCircle, Edit2, Save, X } from 'lucide-react';
import api from '../../services/api';

type TourStatus = 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE';

interface Tour {
  id: string;
  date: string;
  heureDebut: string;
  heureFin: string | null;
  vehiculeId: string;
  employeIds: string[];
  pointsCollecteIds: string[];
  statut: TourStatus;
  distanceKm: number;
}

export const SupervisorTourDashboard: React.FC = () => {
  const { 
    tournees, 
    employes, 
    vehicules, 
    points,
    fetchTournees, 
    fetchEmployes, 
    fetchVehicules,
    updateTourneeStatut 
  } = useWasteStore();

  const [editingTour, setEditingTour] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTournees();
    fetchEmployes();
    fetchVehicules();
  }, []);

  const getVehicule = (id: string) => vehicules.find(v => String(v.id) === String(id));
  const getAgent = (id: string) => employes.find(e => String(e.id) === String(id));
  const getAgentName = (id: string) => {
    const agent = getAgent(id);
    return agent ? `${agent.prenom} ${agent.nom}` : 'Non assigné';
  };

  const availableAgents = employes.filter(e => 
    e.role === 'CHAUFFEUR' || e.role === 'EBOUEUR' || e.role === 'EMPLOYE'
  );

  const handleAssignAgent = async (tourId: string, agentId: string) => {
    if (!agentId) return;
    
    setLoading(true);
    try {
      const tour = tournees.find(t => String(t.id) === String(tourId));
      if (!tour) {
        alert('Tournée introuvable');
        return;
      }

      // Get related objects
      const vehicule = getVehicule(tour.vehiculeId);
      const agent = getAgent(agentId);
      const pointsCollecte = points
        .filter(p => tour.pointsCollecteIds?.includes(String(p.id)))
        .map(p => ({
          id: p.id,
          localisation: p.localisation,
        }));

      // Ensure we have required data - if agent is not selected, keep existing
      if (!agent) {
        alert('Veuillez sélectionner un agent');
        return;
      }
      
      if (!vehicule) {
        alert('Véhicule introuvable pour cette tournée');
        return;
      }
      
      if (!pointsCollecte || pointsCollecte.length === 0) {
        alert('Cette tournée n\'a pas de points de collecte');
        return;
      }

      const backendTournee = {
        id: Number(tourId),
        datePlanifiee: tour.date ? new Date(tour.date).toISOString() : new Date().toISOString(),
        statut: tour.statut || 'PLANIFIEE',
        employe: {
          id: Number(agent.id),
          nom: agent.nom,
          prenom: agent.prenom,
        },
        vehicle: {
          id: Number(vehicule.id),
          immatriculation: vehicule.immatriculation || '',
        },
        pointsCollecte: pointsCollecte,
        heureDebut: tour.heureDebut || '',
        heureFin: tour.heureFin || '',
        distanceKm: tour.distanceKm || 0,
      };

      await api.put(`/routes/${tourId}`, backendTournee);
      await fetchTournees();
      setEditingTour(null);
      setSelectedAgentId('');
      alert('Agent assigné avec succès');
    } catch (error: any) {
      console.error('Failed to assign agent:', error);
      alert(`Erreur: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTour = async (tourId: string) => {
    if (!updateTourneeStatut) return;
    
    setLoading(true);
    try {
      await updateTourneeStatut(tourId, 'TERMINEE');
      await fetchTournees();
      alert('Tournée vérifiée et approuvée');
    } catch (error: any) {
      console.error('Failed to verify tour:', error);
      alert(`Erreur: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut: TourStatus) => {
    const config = {
      PLANIFIEE: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock, label: 'Planifiée' },
      EN_COURS: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Truck, label: 'En cours' },
      TERMINEE: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Terminée' },
    };
    const { color, icon: Icon, label } = config[statut];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
        <Icon size={12} />
        {label}
      </span>
    );
  };

  const sortedTours = [...tournees].sort((a, b) => {
    const statusOrder = { PLANIFIEE: 1, EN_COURS: 2, TERMINEE: 3 };
    return statusOrder[a.statut] - statusOrder[b.statut];
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Tournées</h1>
          <p className="text-sm text-gray-500 mt-1">
            Coordination des agents et vérification des tournées
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{tournees.length}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600">Planifiées</p>
            <p className="text-2xl font-bold text-gray-600">
              {tournees.filter(t => t.statut === 'PLANIFIEE').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600">En cours</p>
            <p className="text-2xl font-bold text-blue-600">
              {tournees.filter(t => t.statut === 'EN_COURS').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600">Terminées</p>
            <p className="text-2xl font-bold text-green-600">
              {tournees.filter(t => t.statut === 'TERMINEE').length}
            </p>
          </div>
        </div>

        {/* Tours Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Liste des Tournées</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Véhicule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Distance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedTours.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                      Aucune tournée disponible
                    </td>
                  </tr>
                ) : (
                  sortedTours.map((tour) => {
                    const veh = getVehicule(tour.vehiculeId);
                    const primaryAgentId = tour.employeIds?.[0];
                    const isEditing = editingTour === tour.id;

                    return (
                      <tr key={tour.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{tour.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {tour.date ? new Date(tour.date).toLocaleDateString('fr-FR') : '-'}
                          {tour.heureDebut && (
                            <span className="block text-xs text-gray-500">{tour.heureDebut}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {veh?.immatriculation || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {isEditing ? (
                            <select
                              value={selectedAgentId || primaryAgentId || ''}
                              onChange={(e) => setSelectedAgentId(e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                              disabled={loading}
                            >
                              <option value="">Sélectionner un agent</option>
                              {availableAgents.map(agent => (
                                <option key={agent.id} value={agent.id}>
                                  {agent.prenom} {agent.nom} ({agent.role})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span>{getAgentName(primaryAgentId || '')}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {tour.pointsCollecteIds?.length || 0} points
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {tour.distanceKm ? `${tour.distanceKm} km` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(tour.statut)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleAssignAgent(tour.id, selectedAgentId || primaryAgentId || '')}
                                  disabled={loading || !selectedAgentId}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded hover:bg-green-100 transition disabled:opacity-50"
                                  title="Enregistrer"
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingTour(null);
                                    setSelectedAgentId('');
                                  }}
                                  disabled={loading}
                                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition"
                                  title="Annuler"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingTour(tour.id);
                                    setSelectedAgentId(primaryAgentId || '');
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                                  title="Assigner/Modifier agent"
                                >
                                  <Edit2 size={16} />
                                </button>
                                {tour.statut === 'EN_COURS' && (
                                  <button
                                    onClick={() => handleVerifyTour(tour.id)}
                                    disabled={loading}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition disabled:opacity-50"
                                    title="Vérifier/Approuver"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorTourDashboard;

