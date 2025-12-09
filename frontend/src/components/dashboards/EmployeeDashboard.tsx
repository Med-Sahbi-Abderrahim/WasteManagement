// src/components/dashboard/EmployeeDashboard.tsx

import React, { useState } from 'react';
import { useWasteStore } from '../../store/wasteStore';
import {
  Wrench,
  Radio,
  Truck,
  Clock,
  AlertTriangle,
  X,
  Send,
  Check,
  Bell,
  MessageCircle,
} from 'lucide-react';

interface Point {
  id: string;
  lieu: string;
  heure: string;
  remplissage: number;
  collecte: boolean;
  incident: boolean;
}

export const EmployeeDashboard: React.FC = () => {
  const { employes, notifications, addNotification } = useWasteStore();
  const employe = employes[0]; // employé connecté

  const [points, setPoints] = useState<Point[]>([
    { id: 'P01', lieu: 'Rue Habib Bourguiba', heure: '07:45', remplissage: 85, collecte: false, incident: false },
    { id: 'P02', lieu: 'Av. Farhat Hached',   heure: '08:10', remplissage: 95, collecte: false, incident: false },
    { id: 'P03', lieu: 'Rue de Tunis',        heure: '08:35', remplissage: 45, collecte: false, incident: false },
    { id: 'P04', lieu: 'Route de Teniour',    heure: '09:00', remplissage: 70, collecte: false, incident: false },
    { id: 'P05', lieu: 'Cité El Bahri',       heure: '09:25', remplissage: 30, collecte: false, incident: false },
  ]);

  const [showIncident, setShowIncident] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);

  // Stats
  const collectes = points.filter(p => p.collecte).length;
  const incidents = points.filter(p => p.incident).length;

  // Notifications reçues par cet employé
  const mesNotifs =
    notifications?.filter(
      n => n.destinataire === 'TOUS' || n.destinataire === 'EQUIPE'
    ) || [];

  const notifsNonLues = mesNotifs.filter(n => !n.lu).length;

  // Valider un point
  const validerPoint = (id: string) => {
    setPoints(prev =>
      prev.map(p =>
        p.id === id ? { ...p, collecte: true, remplissage: 0, incident: false } : p
      )
    );
  };

  // Signaler un incident
  const signalerIncident = () => {
    if (!message.trim() || !showIncident) return;

    const point = points.find(p => p.id === showIncident);

    // Marquer le point en incident
    setPoints(prev =>
      prev.map(p => (p.id === showIncident ? { ...p, incident: true } : p))
    );

    // Envoyer au technicien
    addNotification?.({
      titre: `Panne à réparer – Point ${showIncident}`,
      message: `${message} → ${point?.lieu}`,
      destinataire: 'TECHNICIEN',
      priorite: 'URGENT',
    });

    // Réponse automatique
    setTimeout(() => {
      addNotification?.({
        titre: 'Superviseur',
        message: `Incident pris en charge au point ${point?.lieu}. Technicien en route.`,
        destinataire: 'TOUS',
        priorite: 'NORMAL',
      });
    }, 2000);

    setShowIncident(null);
    setMessage('');
  };

  return (
    <div className="bg-gray-50 min-h-screen text-xs pb-20">

      {/* HEADER + CLOCHE */}
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench size={22} /> Espace employé
          </h2>
          <p className="text-xs text-gray-500">Collecte des déchets</p>
        </div>

        <button onClick={() => setShowNotifs(true)} className="relative">
          <Bell size={20} className="text-gray-700" />
          {notifsNonLues > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {notifsNonLues}
            </span>
          )}
        </button>
      </div>

      {/* VEHICULE + STATS */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Truck size={14} className="text-gray-600" />
          <span className="font-medium">159 Tun 4567</span>
          <span className="text-green-600 text-xs font-medium">• Opérationnel</span>
        </div>

        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-xl font-bold text-green-600">{collectes}</p>
            <p className="text-gray-500 text-[10px]">Collectés</p>
          </div>
          <div>
            <p className="text-xl font-bold text-red-600">{incidents}</p>
            <p className="text-gray-500 text-[10px]">Signalements</p>
          </div>
          <div>
            <p className="text-xl font-bold text-blue-600">{notifsNonLues}</p>
            <p className="text-gray-500 text-[10px]">Notifications</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{points.length}</p>
            <p className="text-gray-500 text-[10px]">Total</p>
          </div>
        </div>
      </div>

      {/* LISTE DES POINTS */}
      <div className="divide-y bg-white">
        {points.map((p, i) => (
          <div key={p.id} className="px-4 py-3 flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{i + 1}. {p.lieu}</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={11} className="text-gray-500" />
                <span className="text-gray-500">{p.heure}</span>
              </div>

              {/* Barre remplissage */}
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Niveau</span>
                  <span className={`font-bold ${p.remplissage > 90 ? 'text-red-600' : p.remplissage > 70 ? 'text-orange-600' : 'text-green-600'}`}>
                    {p.remplissage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      p.remplissage > 90
                        ? 'bg-red-500'
                        : p.remplissage > 70
                        ? 'bg-orange-500'
                        : p.remplissage > 40
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${p.remplissage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-4">
              <button onClick={() => setShowIncident(p.id)} className="text-red-600 hover:text-red-700">
                <AlertTriangle size={18} />
              </button>

              <button onClick={() => validerPoint(p.id)}>
                {p.collecte ? (
                  <Check size={18} className="text-green-600" />
                ) : (
                  <X size={18} className="text-red-600" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FENÊTRE NOTIFICATIONS */}
      {showNotifs && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <MessageCircle size={18} /> Notifications
              </h3>
              <button onClick={() => setShowNotifs(false)}>
                <X size={22} />
              </button>
            </div>

            {mesNotifs.length === 0 ? (
              <p className="text-center text-gray-500 py-10">Aucune notification</p>
            ) : (
              <div className="space-y-3">
                {mesNotifs.map(n => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-lg border ${
                      n.lu ? 'bg-gray-50' : 'bg-blue-50 border-blue-300'
                    }`}
                  >
                    <p className="font-medium text-sm">{n.titre}</p>
                    <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{n.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FENÊTRE SIGNALEMENT */}
      {showIncident && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base">Signaler un problème</h3>
              <button onClick={() => setShowIncident(null)}>
                <X size={22} />
              </button>
            </div>

            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Bac cassé, accès bloqué, verre..."
              className="w-full p-3 border rounded-lg h-28 text-xs resize-none"
            />

            <button
              onClick={signalerIncident}
              className="w-full mt-4 py-3 bg-red-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <Send size={16} /> Envoyer au technicien
            </button>
          </div>
        </div>
      )}

      {/* TOURNÉES PRÉVUES */}
      <div className="px-4 py-3 bg-white mt-4 border-t text-xs">
        <p className="font-medium text-gray-700 mb-2">Tournées prévues</p>
        <div className="space-y-2">
          <div className="flex justify-between"><span>Aujourd’hui • 07:30</span><span className="text-green-600 font-medium">En cours</span></div>
          <div className="flex justify-between text-gray-500"><span>Demain • 07:00</span><span>Planifiée</span></div>
          <div className="flex justify-between text-gray-500"><span>Lundi • 06:45</span><span>Planifiée</span></div>
        </div>
      </div>
      
    </div>
  );
};

export default EmployeeDashboard;
