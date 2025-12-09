// src/components/dashboard/SupervisorDashboard.tsx

import React, { useState } from 'react';
import { useWasteStore } from '../../store/wasteStore';
import {
  Truck,
  Users,
  Bell,
  Phone,
  MessageSquare,
  Send,
  Radio,
  Circle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SupervisorDashboard: React.FC = () => {
  const { tournees = [], employes = [], vehicules = [], signalements = [], addNotification } = useWasteStore();

  const [selectedTournee, setSelectedTournee] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const tourneesEnCours = tournees.filter(t => t.statut === 'EN_COURS');
  const alertesUrgentes = signalements.filter(s => s.statut === 'URGENT').length;
  const alertesNouvelles = signalements.filter(s => s.statut === 'NOUVEAU').length;
  const totalAlertes = alertesUrgentes + alertesNouvelles;

  const getVehicule = (id: string) => vehicules.find(v => v.id === id);

  const envoyerMessage = (tourneeId: string) => {
    if (!message.trim()) return;
    addNotification?.({
      titre: "Message Superviseur",
      message: message.trim(),
      destinataire: "TOUS",
      tourneeId,
    });
    setMessage('');
    setSelectedTournee(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* HEADER QUE TU AIMES – GARDE TEL QUEL */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supervision Opérationnelle</h1>
            <p className="text-sm text-gray-500">
              Sfax – {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Radio className="text-green-500" size={20} />
              <span className="text-sm font-medium text-green-600">Connexion active</span>
            </div>
            <div className="relative">
              <Bell className="text-gray-700" size={24} />
              {totalAlertes > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {totalAlertes}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3 CARTES – SOBRES MAIS AVEC UNE TOUCHE DE COULEUR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/app/routes" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow transition flex items-center gap-5">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tournées en cours</p>
              <p className="text-2xl font-bold text-gray-900">{tourneesEnCours.length}</p>
            </div>
          </Link>

          <Link to="/app/staff" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow transition flex items-center gap-5">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Agents en mission</p>
              <p className="text-2xl font-bold text-gray-900">{employes.filter(e => !e.disponible).length}</p>
            </div>
          </Link>

          <Link to="/app/reports" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow transition flex items-center gap-5 relative">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Bell size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Alertes actives</p>
              <p className="text-2xl font-bold text-red-600">{totalAlertes}</p>
            </div>
            {totalAlertes > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {totalAlertes}
              </span>
            )}
          </Link>
        </div>

        {/* TOURNÉES EN COURS – PROPRE ET DISCRET */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Tournées en cours</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {tourneesEnCours.length === 0 ? (
              <p className="text-center py-10 text-gray-400">Aucune tournée active</p>
            ) : (
              tourneesEnCours.map(t => {
                const veh = getVehicule(t.vehiculeId);
                return (
                  <div key={t.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{veh?.immatriculation || 'Camion inconnu'}</p>
                      <p className="text-sm text-gray-500">
                        {t.heureDebut} • {t.pointsCollecteIds.length} points • {t.distanceKm} km
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedTournee(t.id)}
                        className="p-2 hover:bg-gray-100 rounded transition"
                        title="Message"
                      >
                        <MessageSquare size={18} className="text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded transition" title="Appeler">
                        <Phone size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ACTIVITÉ DES AGENTS – EXACTEMENT COMME TU VEUX */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users size={20} />
              Activité des Agents
            </h3>
            <Link to="/app/staff" className="text-sm text-blue-600 hover:underline">
              Voir tout →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Agent</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Rôle</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employes.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {e.prenom} {e.nom}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{e.role}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${e.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <Circle size={8} className={e.disponible ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'} />
                        {e.disponible ? 'Disponible' : 'En mission'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL MESSAGE */}
        {selectedTournee && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Message à l'équipe</h3>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Tapez votre message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => { setSelectedTournee(null); setMessage(''); }}
                  className="px-5 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  onClick={() => envoyerMessage(selectedTournee)}
                  disabled={!message.trim()}
                  className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                >
                  <Send size={16} />
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorDashboard;
export { SupervisorDashboard };