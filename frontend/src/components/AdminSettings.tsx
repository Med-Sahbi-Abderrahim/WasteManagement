import React, { useState } from 'react';
import { Bell, Shield, Globe, Save } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
        <p className="text-gray-500">Configuration globale de la plateforme</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${
              activeTab === 'general' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Globe size={18} />
            Général
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${
              activeTab === 'notifications' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Bell size={18} />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${
              activeTab === 'security' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Shield size={18} />
            Sécurité
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de la Municipalité</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la ville</label>
                    <input type="text" defaultValue="Sfax" className="w-full p-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
                    <input type="text" defaultValue="3000" className="w-full p-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                    <input type="email" defaultValue="contact@sfax.tn" className="w-full p-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input type="tel" defaultValue="+216 74 000 000" className="w-full p-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Préférences Système</h3>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="maintenance" className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                  <label htmlFor="maintenance" className="text-sm text-gray-700">Activer le mode maintenance</label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration des Alertes</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Alertes de débordement</p>
                    <p className="text-sm text-gray-500">Notifier quand un conteneur dépasse 90%</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Rapports quotidiens</p>
                    <p className="text-sm text-gray-500">Envoyer un résumé chaque matin à 8h</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Gestion des Accès</h3>
              <p className="text-gray-500 text-sm">Configuration des politiques de mot de passe et accès API.</p>
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                Cette section nécessite des privilèges super-admin.
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm">
              <Save size={18} />
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
