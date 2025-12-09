// src/components/vehicules/VehicleList.tsx

import React, { useState, useEffect } from 'react';
import { useWasteStore } from '../../store/wasteStore';
import VehicleCard from './VehicleCard';
import AddVehicleModal from './AddVehicleModal';
import { Plus, Search, Download, Upload } from 'lucide-react';
import { Vehicule } from '../../types/waste';

const VehicleList: React.FC = () => {
  const { vehicules, addVehicule, updateVehicule, removeVehicule, fetchVehicules, exportVehiculesXML } = useWasteStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicule, setEditingVehicule] = useState<Vehicule | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVehicules();
  }, [fetchVehicules]);

  const filteredVehicules = vehicules.filter(v =>
    (v.immatriculation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.type || v.typeVehicule || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Véhicules</h2>
          <p className="text-gray-500">Gérez les véhicules de la flotte</p>
        </div>

        <div className="flex gap-3">
          {/* AJOUTER */}
          <button
            onClick={() => { setEditingVehicule(undefined); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus size={18} /> Ajouter
          </button>

          {/* EXPORT */}
          <button
            onClick={exportVehiculesXML}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Download size={18} /> Export XML
          </button>

          {/* IMPORT – CORRIGÉ (label + input caché) */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (ev) => {
                  const xmlString = ev.target?.result as string;
                  // Tu peux connecter un parseur plus tard, ou utiliser importVehiculesXML(xmlString)
                  alert('Import véhicules – fonction à connecter au parseur');
                  console.log('XML importé :', xmlString);
                };
                reader.onerror = () => alert('Erreur de lecture du fichier');
                reader.readAsText(file);
              }}
            />
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm">
              <Upload size={18} /> Import XML
            </div>
          </label>
        </div>
      </div>

      {/* RECHERCHE */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher par immatriculation ou type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* GRILLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicules.map(v => (
          <VehicleCard
            key={v.id}
            vehicule={v}
            onEdit={(veh) => { setEditingVehicule(veh); setIsModalOpen(true); }}
            onDelete={async (id) => {
              try {
                await removeVehicule(id);
              } catch (error) {
                console.error('Failed to delete vehicle:', error);
              }
            }}
          />
        ))}
      </div>

      {/* AUCUN RÉSULTAT */}
      {filteredVehicules.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">Aucun véhicule trouvé.</p>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <AddVehicleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingVehicule}
          onSubmit={async (data) => {
            try {
              if (editingVehicule) {
                await updateVehicule(editingVehicule.id, data);
              } else {
                await addVehicule({ ...data, id: crypto.randomUUID() } as Vehicule);
              }
              setIsModalOpen(false);
            } catch (error) {
              console.error('Failed to save vehicle:', error);
              // Error is already handled in the store
            }
          }}
        />
      )}
    </div>
  );
};

export default VehicleList;