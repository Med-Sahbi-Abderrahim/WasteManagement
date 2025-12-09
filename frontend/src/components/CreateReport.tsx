import React, { useState } from 'react';
import { useWasteStore } from '../store/wasteStore';
import { useAuthStore } from '../store/authStore';
import { AlertTriangle, MapPin, Send } from 'lucide-react';
import { Signalement } from '../types/waste';

export const CreateReport: React.FC = () => {
  const { addSignalement, points } = useWasteStore();
  const { user } = useAuthStore();
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Signalement>>({
    type: 'DEBORDEMENT',
    message: '',
    pointCollecteId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type && formData.message) {
      addSignalement({
        id: crypto.randomUUID(),
        type: formData.type,
        message: formData.message,
        date: new Date().toISOString().split('T')[0],
        statut: 'NOUVEAU',
        pointCollecteId: formData.pointCollecteId || undefined,
        citoyenId: user?.id
      } as Signalement);
      setSubmitted(true);
      setFormData({
        type: 'DEBORDEMENT',
        message: '',
        pointCollecteId: ''
      });
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Signaler un problème</h2>
        <p className="text-gray-500">Aidez-nous à garder la ville propre en signalant les incidents</p>
      </div>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-green-900 mb-2">Signalement envoyé !</h3>
          <p className="text-green-700">Merci de votre contribution. Nos équipes ont été notifiées.</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type d'incident</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'DEBORDEMENT', label: 'Débordement', icon: AlertTriangle },
                  { id: 'DEGRADATION', label: 'Dégradation', icon: AlertTriangle },
                  { id: 'AUTRE', label: 'Autre', icon: AlertTriangle },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.id as any })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      formData.type === type.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <type.icon size={24} />
                    <span className="font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Point de collecte concerné (Optionnel)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={formData.pointCollecteId}
                  onChange={(e) => setFormData({ ...formData, pointCollecteId: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un point...</option>
                  {points.map((point) => (
                    <option key={point.id} value={point.id}>
                      {point.adresse} ({point.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description détaillée</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Décrivez le problème rencontré..."
                className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-200"
            >
              <Send size={20} />
              Envoyer le signalement
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
