// src/components/tournees/AddTourModal.tsx
import React, { useState } from 'react';
import { X, Truck, Users, Calendar, Clock } from 'lucide-react';
import { useWasteStore } from '../../store/wasteStore';

interface AddTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTourModal: React.FC<AddTourModalProps> = ({ isOpen, onClose }) => {
  const { addTournee, vehicules, employes } = useWasteStore();
  const [formData, setFormData] = useState({
    date: '',
    heureDebut: '',
    vehiculeId: '',
    employeIds: [] as string[],
    pointsCollecteIds: [] as string[],
    distanceKm: 0,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehiculeId || formData.employeIds.length === 0) return;

    addTournee({
      date: formData.date,
      vehiculeId: formData.vehiculeId,
      employeIds: formData.employeIds,
      pointsCollecteIds: formData.pointsCollecteIds,
      statut: 'PLANIFIEE',
      distanceKm: formData.distanceKm || 15.5,
      heureDebut: formData.heureDebut,
      heureFin: '',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Nouvelle Tournée</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
              <X size={28} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={18} /> Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Clock size={18} /> Heure de début
                </label>
                <input
                  type="time"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Truck size={18} /> Véhicule
              </label>
              <select
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                onChange={(e) => setFormData({ ...formData, vehiculeId: e.target.value })}
              >
                <option value="">Sélectionner un véhicule</option>
                {vehicules.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.immatriculation} - {v.type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users size={18} /> Équipe
              </label>
              <div className="space-y-2">
                {employes.map((e) => (
                  <label key={e.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      onChange={(checked) => {
                        if (checked.target.checked) {
                          setFormData({ ...formData, employeIds: [...formData.employeIds, e.id] });
                        } else {
                          setFormData({ ...formData, employeIds: formData.employeIds.filter(id => id !== e.id) });
                        }
                      }}
                    />
                    <span className="font-medium">{e.prenom} {e.nom} - {e.role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
              >
                Créer la tournée
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};