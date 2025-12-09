// src/components/dashboard/TechnicianDashboard.tsx

import React, { useState } from 'react';
import { useWasteStore } from '../../store/wasteStore';
import { Truck, Wrench, AlertTriangle, CheckCircle, History, Calendar, Radio } from 'lucide-react';

type VehicleStatus = 'BON' | 'A_VERIFIER' | 'EN_PANNE';

interface VehicleCheck {
  vehiculeId: string;
  immatriculation: string;
  statut: VehicleStatus;
  commentaire?: string;
  date: string;
}

export const TechnicianDashboard: React.FC = () => {
  const { vehicules, addNotification } = useWasteStore();

  const [selectedVehicule, setSelectedVehicule] = useState<string | null>(null);
  const [status, setStatus] = useState<VehicleStatus>('BON');
  const [commentaire, setCommentaire] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Simulons que le technicien a accès à tous les véhicules (ou filtre par assignment plus tard)
  const mesVehicules = vehicules;

  const handleVehicleCheck = () => {
    if (!selectedVehicule) return;

    const veh = mesVehicules.find(v => v.id === selectedVehicule);
    if (!veh) return;

    const check: VehicleCheck = {
      vehiculeId: veh.id,
      immatriculation: veh.immatriculation,
      statut: status,
      commentaire: commentaire || undefined,
      date: new Date().toISOString(),
    };

    // Notification automatique si problème
    if (status === 'EN_PANNE' || status === 'A_VERIFIER') {
      addNotification?.({
        titre: `Maintenance requise – ${veh.immatriculation}`,
        message: `${status === 'EN_PANNE' ? 'Véhicule en panne' : 'Vérification urgente'} signalée par le technicien. ${commentaire ? `Note : ${commentaire}` : ''}`,
        destinataire: 'SUPERVISEUR',
        type: 'MAINTENANCE',
        priorite: status === 'EN_PANNE' ? 'URGENT' : 'MOYENNE',
      });
    }

    alert(`État du véhicule ${veh.immatriculation} enregistré : ${status}`);
    setShowModal(false);
    setCommentaire('');
    setStatus('BON');
    setSelectedVehicule(null);
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

      {/* CARTES RAPIDES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border p-4 text-center">
          <Truck size={20} className="text-blue-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{mesVehicules.length}</p>
          <p className="text-xs text-gray-500">Véhicules</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <CheckCircle size={20} className="text-green-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-green-600">
            {mesVehicules.filter(v => v.statut === 'MAINTENANCE').length}
          </p>
          <p className="text-xs text-gray-500">Opérationnels</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <AlertTriangle size={20} className="text-yellow-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-yellow-600">
            {mesVehicules.filter(v => v.statut === 'EN_CHARGE').length}
          </p>
          <p className="text-xs text-gray-500">À vérifier</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <AlertTriangle size={20} className="text-red-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-red-600">
            {mesVehicules.filter(v => v.statut === 'EN_PANNE').length}
          </p>
          <p className="text-xs text-gray-500">En panne</p>
        </div>
      </div>

      {/* LISTE DES VÉHICULES + CONTRÔLE */}
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-900">État des véhicules</h3>
          <span className="text-xs text-gray-500">{mesVehicules.length} véhicule(s)</span>
        </div>

        <div className="divide-y">
          {mesVehicules.map(veh => (
            <div key={veh.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{veh.immatriculation}</p>
                  <p className="text-xs text-gray-500">{veh.type} • {veh.capacite} m³</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(veh.statut as VehicleStatus)}`}>
                  {getStatusIcon(veh.statut as VehicleStatus)}
                  {veh.statut === 'MAINTENANCE' ? 'Bon' : veh.statut === 'EN_CHARGE' ? 'À vérifier' : 'En panne'}
                </span>

                <button
                  onClick={() => {
                    setSelectedVehicule(veh.id);
                    setShowModal(true);
                  }}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Contrôler
                </button>
              </div>
            </div>
          ))}
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
            <span>Aujourd’hui 08:15</span>
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
              {mesVehicules.find(v => v.id === selectedVehicule)?.immatriculation}
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
                onClick={() => setShowModal(false)}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleVehicleCheck}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Valider le contrôle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;