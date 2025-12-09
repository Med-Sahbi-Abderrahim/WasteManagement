// src/components/ActivityReports.tsx

import React from 'react';
import { useWasteStore } from '../store/wasteStore';
import { FileText, User, Calendar, Download, Upload } from 'lucide-react';

export const ActivityReports: React.FC = () => {
  const { employes, tournees, exportActivityReportXML } = useWasteStore();

  // Fonction pour importer (temporaire – tu pourras la connecter plus tard)
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    alert('Import des rapports d’activité – fonction à implémenter plus tard');
    console.log('Fichier sélectionné :', file.name);
  };

  return (
    <div className="space-y-6">
      {/* EN-TÊTE + BOUTONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rapports d'Activité</h2>
          <p className="text-gray-500">Suivi des performances et activités des employés</p>
        </div>

        <div className="flex gap-3">
          {/* EXPORT RAPPORTS */}
          <button
            onClick={exportActivityReportXML}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Download size={18} />
            Export XML
          </button>

          {/* IMPORT RAPPORTS */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".xml"
              className="hidden"
              onChange={handleImport}
            />
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm">
              <Upload size={18} />
              Import XML
            </div>
          </label>
        </div>
      </div>

      {/* LISTE DES EMPLOYÉS */}
      <div className="grid gap-6">
        {employes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">Aucun employé enregistré.</p>
          </div>
        ) : (
          employes.map(employe => {
            const employeeTours = tournees.filter(t => t.employeIds.includes(employe.id));
            const completedTours = employeeTours.filter(t => t.statut === 'TERMINEE');

            return (
              <div key={employe.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {employe.prenom.charAt(0)}{employe.nom.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{employe.prenom} {employe.nom}</h3>
                      <p className="text-gray-500 flex items-center gap-1 text-sm">
                        <User size={14} />
                        {employe.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="text-center px-5 py-3 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-3xl font-bold text-blue-600">{employeeTours.length}</p>
                      <p className="text-xs text-blue-800 font-medium uppercase tracking-wider">Tournées</p>
                    </div>
                    <div className="text-center px-5 py-3 bg-green-50 rounded-xl border border-green-200">
                      <p className="text-3xl font-bold text-green-600">{completedTours.length}</p>
                      <p className="text-xs text-green-800 font-medium uppercase tracking-wider">Complétées</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-5">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-gray-500" />
                    Historique des tournées
                  </h4>
                  <div className="space-y-3">
                    {employeeTours.length > 0 ? (
                      employeeTours.slice(0, 5).map(t => (
                        <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                          <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-gray-500" />
                            <span className="font-medium text-gray-700">{t.date}</span>
                            <span className="text-gray-600">• {t.heureDebut} - {t.heureFin || 'en cours'}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            t.statut === 'TERMINEE' ? 'bg-green-100 text-green-800' :
                            t.statut === 'EN_COURS' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {t.statut}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic text-center py-4">Aucune tournée assignée</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityReports;