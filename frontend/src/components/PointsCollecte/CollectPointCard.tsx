import React from 'react';
import { PointCollecte } from '../../types/waste';
import { Trash2, MapPin, Activity, Calendar, Box } from 'lucide-react';

interface Props {
  point: PointCollecte;
  onEdit: (point: PointCollecte) => void;
  onDelete: (id: number) => void;
}

export const CollectPointCard: React.FC<Props> = ({ point, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIF': return 'bg-green-100 text-green-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'HORS_SERVICE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PLASTIQUE': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'VERRE': return 'bg-green-50 border-green-200 text-green-700';
      case 'PAPIER': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'ORGANIQUE': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'MIXTE': return 'bg-gray-50 border-gray-200 text-gray-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getTypeColor(point.typeDechet?.nom || 'MIXTE')}`}>
          {point.typeDechet?.nom || 'MIXTE'}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(point)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Activity size={16} />
          </button>
          <button
            onClick={() => onDelete(point.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Localisation */}
        <div className="flex items-start gap-3">
          <MapPin className="text-gray-400 mt-1 shrink-0" size={18} />
          <span className="text-gray-700 font-medium text-sm line-clamp-2">{point.localisation}</span>
        </div>

        {/* Niveau de remplissage */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Niveau</span>
            <span
              className={`font-bold ${
                point.niveauRemplissage > 80 ? 'text-red-600' :
                point.niveauRemplissage > 50 ? 'text-yellow-600' : 'text-green-600'
              }`}
            >
              {point.niveauRemplissage || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                point.niveauRemplissage > 80 ? 'bg-red-500' :
                point.niveauRemplissage > 50 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${point.niveauRemplissage || 0}%` }}
            />
          </div>
        </div>

        {/* Capacite et année d'installation */}
        <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Box size={14} />
            <span>{point.capacite || '-'} L</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{point.dateDerniereCollecte ? new Date(point.dateDerniereCollecte).getFullYear() : '-'}</span>
          </div>
        </div>

        {/* État et modèle */}
        <div className="flex justify-between items-center pt-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(point.etatConteneur)}`}>
            {point.etatConteneur}
          </span>
          <span className="text-xs text-gray-400">
            {point.modele || 'Standard'}
          </span>
        </div>
      </div>
    </div>
  );
};
