import React, { useState, useEffect } from 'react';
import { PointCollecte, PointType, PointEtat } from '../../types/waste';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<PointCollecte>) => void;
  initialData?: PointCollecte;
}

export const AddPointModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<PointCollecte>>({
    adresse: '',
    latitude: 0,
    longitude: 0,
    type: 'MIXTE',
    niveauRemplissage: 0,
    etat: 'ACTIF'
  });

  // Charger les données si édition
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        adresse: '',
        latitude: 0,
        longitude: 0,
        type: 'MIXTE',
        niveauRemplissage: 0,
        etat: 'ACTIF'
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {initialData ? 'Modifier le point' : 'Nouveau point de collecte'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* FORMULAIRE */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
          }}
          className="p-6 space-y-4"
        >
          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              required
              value={formData.adresse || ''}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Latitude / Longitude */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude || 0}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude || 0}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Type et État */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de déchet</label>
              <select
                value={formData.type || 'MIXTE'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as PointType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="MIXTE">Mixte</option>
                <option value="PLASTIQUE">Plastique</option>
                <option value="VERRE">Verre</option>
                <option value="ORGANIQUE">Organique</option>
                <option value="PAPIER">Papier</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
              <select
                value={formData.etat || 'ACTIF'}
                onChange={(e) => setFormData({ ...formData, etat: e.target.value as PointEtat })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="ACTIF">Actif</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="HORS_SERVICE">Hors Service</option>
              </select>
            </div>
          </div>

          {/* Niveau de remplissage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau de remplissage ({formData.niveauRemplissage || 0}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.niveauRemplissage || 0}
              onChange={(e) => setFormData({ ...formData, niveauRemplissage: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* BOUTONS */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {initialData ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
