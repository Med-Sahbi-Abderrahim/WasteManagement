// src/components/ReportList.tsx

import React from 'react';
import { useWasteStore } from '../store/wasteStore';
import { Upload, Download, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';

export const ReportList: React.FC = () => {
  const { signalements, exportSignalementsXML, importSignalementsXML } = useWasteStore();

  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case 'NOUVEAU':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Nouveau' };
      case 'EN_COURS':
        return { color: 'bg-blue-100 text-blue-800', icon: AlertTriangle, label: 'En cours' };
      case 'TRAITE':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Traité' };
      case 'URGENT':
        return { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Urgent' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: statut };
    }
  };

  return (
    <div className="space-y-5 p-4">

      {/* EN-TÊTE + ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Signalements Citoyens</h2>
          <p className="text-xs text-gray-500">{signalements.length} signalement(s)</p>
        </div>

        <div className="flex gap-2 text-xs">
          <button
            onClick={exportSignalementsXML}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm transition"
          >
            <Download size={14} /> Export
          </button>

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
                  // CORRECTION ICI : ev.target.result (pas ev.target.target)
                  const xmlString = ev.target?.result as string;
                  if (xmlString) {
                    importSignalementsXML(xmlString);
                    alert('Signalements importés avec succès !');
                  }
                };
                reader.onerror = () => alert('Erreur lors de la lecture du fichier');
                reader.readAsText(file);
              }}
            />
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 shadow-sm transition">
              <Upload size={14} /> Import
            </div>
          </label>
        </div>
      </div>

      {/* LISTE DES SIGNALEMENTS */}
      <div className="space-y-3">
        {signalements.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">Aucun signalement pour le moment</p>
          </div>
        ) : (
          signalements.map((s) => {
            const { color, icon: StatusIcon, label } = getStatusConfig(s.statut);

            return (
              <div
                key={s.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{s.type}</span>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-1 text-gray-600 text-xs">
                        <MapPin size={12} />
                        Point {s.pointCollecteId}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 line-clamp-2">{s.message}</p>

                    <div className="flex items-center gap-3 mt-3 text-xs">
                      <span className="text-gray-500">
                        {new Date(s.date).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>

                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
                        <StatusIcon size={11} />
                        {label}
                      </span>
                    </div>
                  </div>

                  {s.statut === 'URGENT' && (
                    <AlertTriangle size={20} className="text-red-500 flex-shrink-0 animate-pulse" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReportList;