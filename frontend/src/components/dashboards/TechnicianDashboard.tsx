// src/components/dashboard/TechnicianDashboard.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useWasteStore } from '../../store/wasteStore';
import { Truck, Wrench, AlertTriangle, CheckCircle, History, Radio, Bell, X } from 'lucide-react';
import api from '../../services/api';

type VehicleStatus = 'BON' | 'A_VERIFIER' | 'EN_PANNE';

interface VehicleCheck {
  vehiculeId: string;
  immatriculation: string;
  statut: VehicleStatus;
  commentaire?: string;
  date: string;
}

interface Notification {
  id: number;
  titre: string;
  message: string;
  type: string;
  vehiculeId?: number;
  lue: boolean;
  dateCreation: string;
}

export const TechnicianDashboard: React.FC = () => {
  const { vehicules, fetchVehicules } = useWasteStore();

  const [selectedVehicule, setSelectedVehicule] = useState<string | null>(null);
  const [status, setStatus] = useState<VehicleStatus>('BON');
  const [commentaire, setCommentaire] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch vehicles and notifications on mount
  useEffect(() => {
    fetchVehicules();
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - only run on mount

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/technicien/notifications', {
        params: { unreadOnly: false }
      });
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await api.put(`/technicien/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, lue: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleNotificationAction = async (notification: Notification) => {
    if (notification.vehiculeId) {
      // Open the vehicle control modal for this vehicle
      setSelectedVehicule(String(notification.vehiculeId));
      setShowModal(true);
      // Mark notification as read
      if (!notification.lue) {
        await markNotificationAsRead(notification.id);
      }
    }
  };

  const mapStatusToBackend = (status: VehicleStatus): string => {
    switch (status) {
      case 'BON': return 'DISPONIBLE';
      case 'A_VERIFIER': return 'EN_REPARATION';
      case 'EN_PANNE': return 'EN_PANNE';
      default: return 'DISPONIBLE';
    }
  };

  const mapStatusFromBackend = (status: string): VehicleStatus => {
    switch (status) {
      case 'DISPONIBLE': return 'BON';
      case 'EN_REPARATION': return 'A_VERIFIER';
      case 'EN_PANNE': return 'EN_PANNE';
      default: return 'BON';
    }
  };

  const handleVehicleCheck = async () => {
    if (!selectedVehicule) return;

    const veh = vehicules.find(v => String(v.id) === String(selectedVehicule));
    if (!veh) return;

    setLoading(true);
    try {
      // Map frontend status to backend status
      const backendStatus = mapStatusToBackend(status);
      
      // Call the API endpoint to save to XML
      await api.put(`/technicien/vehicules/${selectedVehicule}/status`, {
        status: backendStatus
      });

      // Close modal and reset state BEFORE fetching to avoid DOM conflicts
      const immatriculation = veh.immatriculation;
      const statusDisplay = status; // Save status before resetting
      setShowModal(false);
      setCommentaire('');
      setStatus('BON');
      setSelectedVehicule(null);
      setLoading(false); // Reset loading immediately after closing modal

      // Use setTimeout to defer state updates until after modal is unmounted
      // Use requestAnimationFrame to ensure DOM is stable before updating
      requestAnimationFrame(() => {
        setTimeout(async () => {
          try {
            // Refresh vehicles list to get updated state from XML
            await fetchVehicules();

            // Refresh notifications in case a new one was created
            await fetchNotifications();

            alert(`État du véhicule ${immatriculation} enregistré : ${statusDisplay}`);
          } catch (error) {
            console.error('Failed to refresh data:', error);
          }
        }, 150);
      });
    } catch (error: any) {
      console.error('Failed to update vehicle status:', error);
      alert(`Erreur lors de la mise à jour : ${error.response?.data?.error || error.message}`);
      setLoading(false);
    }
  };

  const getStatusColor = (s: VehicleStatus) => {
    switch (s) {
      case 'BON': return 'bg-green-100 text-green-800 border-green-200';
      case 'A_VERIFIER': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EN_PANNE': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusIcon = (s: VehicleStatus) => {
    switch (s) {
      case 'BON': return <CheckCircle size={14} />;
      case 'A_VERIFIER': return <AlertTriangle size={14} />;
      case 'EN_PANNE': return <AlertTriangle size={14} />;
    }
  };

  const getBackendStatusDisplay = (statut: string) => {
    const mapped = mapStatusFromBackend(statut);
    switch (mapped) {
      case 'BON': return 'Bon';
      case 'A_VERIFIER': return 'À vérifier';
      case 'EN_PANNE': return 'En panne';
    }
  };

  const unreadNotifications = notifications.filter(n => !n.lue);
  const vehicleNotifications = notifications.filter(n => n.type === 'VEHICULE_PANNE' && !n.lue);

  return (
    <div className="space-y-6 p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench size={22} /> Espace Technicien
          </h2>
          <p className="text-xs text-gray-500">Contrôle et maintenance des véhicules</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Radio className="text-green-500" size={16} />
          <span className="text-green-600 font-medium">Connecté</span>
        </div>
      </div>

      {/* NOTIFICATIONS SECTION */}
      {unreadNotifications.length > 0 && (
        <div className="bg-white rounded-lg border border-yellow-200 shadow-sm">
          <div className="px-4 py-3 border-b flex justify-between items-center bg-yellow-50">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-yellow-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                Notifications ({unreadNotifications.length})
              </h3>
            </div>
          </div>
          <div className="divide-y">
            {unreadNotifications.map((notif, index) => (
              <div 
                key={`notif-${notif.id}-${index}`} 
                className={`p-4 hover:bg-gray-50 ${notif.lue ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={16} className="text-red-500" />
                      <h4 className="text-sm font-medium text-gray-900">{notif.titre}</h4>
                      {!notif.lue && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{notif.message}</p>
                    {notif.vehiculeId && (
                      <button
                        onClick={() => handleNotificationAction(notif)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        → Vérifier le véhicule
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!notif.lue && (
                      <button
                        onClick={() => markNotificationAsRead(notif.id)}
                        className="p-1 hover:bg-gray-200 rounded transition"
                        title="Marquer comme lu"
                      >
                        <X size={14} className="text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CARTES RAPIDES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border p-4 text-center">
          <Truck size={20} className="text-blue-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{vehicules.length}</p>
          <p className="text-xs text-gray-500">Véhicules</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <CheckCircle size={20} className="text-green-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-green-600">
            {vehicules.filter(v => v.statut === 'DISPONIBLE' || v.etat === 'DISPONIBLE').length}
          </p>
          <p className="text-xs text-gray-500">Opérationnels</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <AlertTriangle size={20} className="text-yellow-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-yellow-600">
            {vehicules.filter(v => v.statut === 'EN_REPARATION' || v.etat === 'EN_REPARATION').length}
          </p>
          <p className="text-xs text-gray-500">À vérifier</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <AlertTriangle size={20} className="text-red-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-red-600">
            {vehicules.filter(v => v.statut === 'EN_PANNE' || v.etat === 'EN_PANNE').length}
          </p>
          <p className="text-xs text-gray-500">En panne</p>
        </div>
      </div>

      {/* LISTE DES VÉHICULES + CONTRÔLE */}
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-900">État des véhicules</h3>
          <span className="text-xs text-gray-500">{vehicules.length} véhicule(s)</span>
        </div>

        <div className="divide-y">
          {vehicules.map((veh) => {
            const mappedStatus = mapStatusFromBackend(veh.statut || veh.etat || 'DISPONIBLE');
            const statusIcon = getStatusIcon(mappedStatus);
            const statusText = getBackendStatusDisplay(veh.statut || veh.etat || 'DISPONIBLE');
            return (
              <div key={`veh-${veh.id}`} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Truck size={18} className="text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{veh.immatriculation}</p>
                    <p className="text-xs text-gray-500">{veh.type || veh.typeVehicule} • {veh.capacite} m³</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(mappedStatus)}`}>
                    <span className="flex-shrink-0">{statusIcon}</span>
                    <span>{statusText}</span>
                  </span>

                  <button
                    onClick={() => {
                      setSelectedVehicule(String(veh.id));
                      setStatus(mappedStatus);
                      setShowModal(true);
                    }}
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Contrôler
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HISTORIQUE RÉCENT (optionnel) */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-3">
          <History size={16} className="text-gray-600" />
          <h4 className="text-sm font-semibold text-gray-900">Derniers contrôles</h4>
        </div>
        <div className="text-xs text-gray-500 space-y-2">
          <div className="flex justify-between">
            <span>159 Tun 1234 • Bon état</span>
            <span>Aujourd'hui 08:15</span>
          </div>
          <div className="flex justify-between">
            <span>200 Tun 5678 • Freins à vérifier</span>
            <span>Hier 14:30</span>
          </div>
        </div>
      </div>

      {/* MODAL DE CONTRÔLE */}
      {showModal && selectedVehicule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Contrôle véhicule</h3>
            <p className="text-sm text-gray-600 mb-4">
              {vehicules.find(v => String(v.id) === String(selectedVehicule))?.immatriculation}
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">État du véhicule</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    onClick={() => setStatus('BON')}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition ${status === 'BON' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'}`}
                  >
                    Bon état
                  </button>
                  <button
                    onClick={() => setStatus('A_VERIFIER')}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition ${status === 'A_VERIFIER' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-200'}`}
                  >
                    À vérifier
                  </button>
                  <button
                    onClick={() => setStatus('EN_PANNE')}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition ${status === 'EN_PANNE' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200'}`}
                  >
                    En panne
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Commentaire (optionnel)</label>
                <textarea
                  value={commentaire}
                  onChange={e => setCommentaire(e.target.value)}
                  placeholder="Ex: freins usés, fuite d'huile..."
                  className="w-full mt-2 p-3 border rounded-lg text-sm resize-none h-20 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setCommentaire('');
                  setStatus('BON');
                }}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleVehicleCheck}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enregistrement...' : 'Valider le contrôle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
