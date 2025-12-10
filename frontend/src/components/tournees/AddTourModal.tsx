// src/components/tournees/AddTourModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Truck, Users, Calendar, Clock, MapPin } from 'lucide-react';
import { useWasteStore } from '../../store/wasteStore';

interface AddTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => Promise<void>;
}

export const AddTourModal: React.FC<AddTourModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { vehicules, employes, points, fetchVehicules, fetchEmployes, fetchPoints } = useWasteStore();
  
  // Fetch data when modal opens if not already loaded
  useEffect(() => {
    if (isOpen) {
      if (vehicules.length === 0) {
        fetchVehicules();
      }
      if (employes.length === 0) {
        fetchEmployes();
      }
      if (points.length === 0) {
        fetchPoints();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  const [formData, setFormData] = useState({
    date: '',
    heureDebut: '',
    vehiculeId: '',
    employeIds: [] as string[],
    pointsCollecteIds: [] as string[],
    distanceKm: 0,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehiculeId || formData.employeIds.length === 0) {
      alert('Veuillez sélectionner un véhicule et au moins un employé');
      return;
    }

    const tourneeData = {
      date: formData.date || new Date().toISOString().split('T')[0],
      vehiculeId: formData.vehiculeId,
      employeIds: formData.employeIds,
      pointsCollecteIds: formData.pointsCollecteIds,
      statut: 'PLANIFIEE',
      distanceKm: formData.distanceKm || 15.5,
      heureDebut: formData.heureDebut,
      heureFin: '',
    };

    try {
      if (onSubmit) {
        await onSubmit(tourneeData);
      }
      // Reset form
      setFormData({
        date: '',
        heureDebut: '',
        vehiculeId: '',
        employeIds: [],
        pointsCollecteIds: [],
        distanceKm: 0,
      });
      onClose();
    } catch (error) {
      console.error('Error submitting tournee:', error);
      // Don't close modal on error so user can retry
    }
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
                  value={formData.date}
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
                  value={formData.heureDebut}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Truck size={18} /> Véhicule
              </label>
              {vehicules.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">Chargement des véhicules...</p>
              ) : (
                <select
                  required
                  value={formData.vehiculeId}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  onChange={(e) => setFormData({ ...formData, vehiculeId: e.target.value })}
                >
                  <option value="">Sélectionner un véhicule</option>
                  {vehicules.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.immatriculation} - {v.typeVehicule || v.type}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users size={18} /> Équipe
              </label>
              {employes.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">Chargement des employés...</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {employes.map((emp) => (
                    <label key={emp.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.employeIds.includes(emp.id)}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, employeIds: [...formData.employeIds, emp.id] });
                          } else {
                            setFormData({ ...formData, employeIds: formData.employeIds.filter(id => id !== emp.id) });
                          }
                        }}
                      />
                      <span className="font-medium">{emp.prenom} {emp.nom} - {emp.role}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin size={18} /> Points de collecte
              </label>
              {points.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">Chargement des points...</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {points.map((p) => (
                    <label key={p.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.pointsCollecteIds.includes(String(p.id))}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                        onChange={(e) => {
                          const pointId = String(p.id);
                          if (e.target.checked) {
                            setFormData({ ...formData, pointsCollecteIds: [...formData.pointsCollecteIds, pointId] });
                          } else {
                            setFormData({ ...formData, pointsCollecteIds: formData.pointsCollecteIds.filter(id => id !== pointId) });
                          }
                        }}
                      />
                      <span className="font-medium">{p.localisation} ({p.niveauRemplissage}%)</span>
                    </label>
                  ))}
                </div>
              )}
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