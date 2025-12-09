import React from 'react';
import { Vehicule } from '../../types/waste';
import { Edit, Trash2 } from 'lucide-react';

interface Props {
  vehicule: Vehicule;
  onEdit: (vehicule: Vehicule) => void;
  onDelete: (id: string | number) => void;
}

const VehiculeCard: React.FC<Props> = ({ vehicule, onEdit, onDelete }) => {
  return (
    <div className="p-4 bg-white rounded-xl shadow hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900">{vehicule.type || vehicule.typeVehicule || 'N/A'}</h3>
      <p className="text-gray-500 text-sm">Immatriculation: {vehicule.immatriculation || 'N/A'}</p>
      <p className="text-gray-500 text-sm">Capacité: {vehicule.capacite} L</p>
      <p className="text-gray-500 text-sm">Statut: {vehicule.statut || vehicule.etat || 'N/A'}</p>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onEdit(vehicule)}
          className="flex-1 flex items-center justify-center gap-2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
        >
          <Edit size={16} /> Modifier
        </button>
        <button
          onClick={() => onDelete(vehicule.id)}
          className="flex-1 flex items-center justify-center gap-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
        >
          <Trash2 size={16} /> Supprimer
        </button>
      </div>
    </div>
  );
};

export default VehiculeCard;
