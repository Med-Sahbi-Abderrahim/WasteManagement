// src/components/tournees/TourCard.tsx
import React from 'react';
import { Truck, Users, MapPin, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tournee } from '../../types/waste';

interface TourCardProps {
  tournee: Tournee;
  vehiculeImmat?: string;
  equipeNoms: string;
  pointsCount: number;
}

export const TourCard: React.FC<TourCardProps> = ({
  tournee,
  vehiculeImmat = 'Non assigné',
  equipeNoms,
  pointsCount,
}) => {
  const statutColors = {
    PLANIFIEE: 'bg-blue-100 text-blue-800',
    EN_COURS: 'bg-orange-100 text-orange-800',
    TERMINEE: 'bg-green-100 text-green-800',
    ANNULEE: 'bg-red-100 text-red-800',
    RETARDEE: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">
              {format(new Date(tournee.date), 'EEEE dd MMMM yyyy', { locale: fr })}
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
              <Clock size={20} />
              {tournee.heureDebut} {tournee.heureFin && `→ ${tournee.heureFin}`}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${statutColors[tournee.statut] || 'bg-gray-100 text-gray-800'}`}>
            {tournee.statut.replace('_', ' ')}
          </span>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Truck className="text-blue-600" size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Véhicule</p>
              <p className="font-semibold text-gray-900">{vehiculeImmat}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Users className="text-purple-600" size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Équipe</p>
              <p className="font-semibold text-gray-900">{equipeNoms}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin size={18} />
              <span className="font-medium">{pointsCount} points</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{tournee.distanceKm}</p>
              <p className="text-xs text-gray-500">km estimés</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};