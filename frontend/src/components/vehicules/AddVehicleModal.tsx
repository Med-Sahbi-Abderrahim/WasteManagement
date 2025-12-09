// src/components/vehicules/AddVehiculeModal.tsx

import React, { useState, useEffect } from 'react';
import { Vehicule, VehiculeStatut } from '../../types/waste';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Vehicule;
  onSubmit: (data: Omit<Vehicule, 'id'>) => void;
}

const AddVehiculeModal: React.FC<Props> = ({ isOpen, onClose, initialData, onSubmit }) => {
  const [immatriculation, setImmatriculation] = useState('');
  const [type, setType] = useState('');
  const [capacite, setCapacite] = useState<number>(0);

  // CORRIGÉ : on utilise le vrai type complet VehiculeStatut
  const [statut, setStatut] = useState<VehiculeStatut>('DISPONIBLE');

  useEffect(() => {
    if (initialData) {
      setImmatriculation(initialData.immatriculation);
      setType(initialData.type);
      setCapacite(initialData.capacite);
      setStatut(initialData.statut); // Maintenant accepté même si c'est 'EN_CHARGE' ou 'EN_PANNE'
    } else {
      // Reset quand on ouvre pour ajouter
      setImmatriculation('');
      setType('');
      setCapacite(0);
      setStatut('DISPONIBLE');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      immatriculation,
      type,
      capacite,
      statut,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-7 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {initialData ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Immatriculation</label>
            <input
              type="text"
              value={immatriculation}
              onChange={(e) => setImmatriculation(e.target.value.toUpperCase())}
              placeholder="Ex: 123-TUN-45"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de véhicule</label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Ex: Camion-benne, Triporteur"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacité (m³)</label>
            <input
              type="number"
              value={capacite}
              onChange={(e) => setCapacite(parseInt(e.target.value) || 0)}
              min="1"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut actuel</label>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value as VehiculeStatut)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="DISPONIBLE">Disponible</option>
              <option value="EN_MISSION">En mission</option>
              <option value="MAINTENANCE">En maintenance</option>
              <option value="EN_CHARGE">En charge</option>
              <option value="EN_PANNE">En panne</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!immatriculation || !type || capacite <= 0}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initialData ? 'Enregistrer les modifications' : 'Ajouter le véhicule'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVehiculeModal;