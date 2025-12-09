// src/components/employes/StaffManagement.tsx

import React, { useState, useEffect } from 'react';
import { useWasteStore } from '../../store/wasteStore';
import {
  Plus,
  Upload,
  Download,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Employe } from '../../types/waste';

export const StaffManagement: React.FC = () => {
  const { employes, addEmploye, updateEmploye, removeEmploye, fetchEmployes, exportEmployesXML, importEmployesXML } = useWasteStore();

  useEffect(() => {
    fetchEmployes();
  }, [fetchEmployes]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmploye, setEditingEmploye] = useState<Employe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Employe>>({
    prenom: '', nom: '', role: 'EBOUEUR', telephone: '', email: '', adresse: '', dateEmbauche: '', disponible: true,
  });

  const filteredEmployes = employes.filter(e =>
    `${e.prenom} ${e.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prenom || !formData.nom) return;

    try {
      if (editingEmploye) {
        await updateEmploye(editingEmploye.id, formData);
      } else {
        await addEmploye({
          id: crypto.randomUUID(),
          prenom: formData.prenom!,
          nom: formData.nom!,
          role: formData.role!,
          disponible: formData.disponible ?? true,
          telephone: formData.telephone,
          email: formData.email,
          adresse: formData.adresse,
          dateEmbauche: formData.dateEmbauche,
        } as Employe);
      }
      setIsModalOpen(false);
      setEditingEmploye(null);
      setFormData({ prenom: '', nom: '', role: 'EBOUEUR', telephone: '', email: '', adresse: '', dateEmbauche: '', disponible: true });
    } catch (error) {
      console.error('Failed to save employee:', error);
      // Error is already handled in the store
    }
  };

  const openEdit = (emp: Employe) => {
    setEditingEmploye(emp);
    setFormData(emp);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-5 p-4">

      {/* HEADER COMPACT */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Employés</h2>
          <p className="text-xs text-gray-500">Gestion du personnel</p>
        </div>

        <div className="flex gap-2 text-xs">
          <button onClick={() => { setEditingEmploye(null); setIsModalOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm">
            <Plus size={14} /> Ajouter
          </button>
          <button onClick={exportEmployesXML}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm">
            <Download size={14} /> Export
          </button>
          <label className="cursor-pointer">
            <input type="file" accept=".xml" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => importEmployesXML(ev.target?.result as string);
                reader.readAsText(file);
              }
            }} />
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 shadow-sm">
              <Upload size={14} /> Import
            </div>
          </label>
        </div>
      </div>

      {/* RECHERCHE COMPACTE */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text" placeholder="Rechercher..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* CARTES ULTRA-COMPACTES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {filteredEmployes.length === 0 ? (
          <p className="col-span-full text-center py-10 text-gray-400 text-sm">Aucun employé</p>
        ) : (
          filteredEmployes.map(employe => (
            <div key={employe.id} className="bg-white rounded-lg border border-gray-200 p-4 text-xs flex flex-col">

              {/* Avatar + Nom + Rôle */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    employe.role === 'CHAUFFEUR' ? 'bg-indigo-600' : 'bg-orange-600'
                  }`}>
                    {employe.prenom[0]}{employe.nom[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 leading-tight">
                      {employe.prenom} {employe.nom}
                    </div>
                    <div className="text-gray-600 flex items-center gap-1">
                      <Briefcase size={11} /> {employe.role === 'CHAUFFEUR' ? 'Chauffeur' : 'Éboueur'}
                    </div>
                  </div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${employe.disponible ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>

              {/* Infos */}
              <div className="space-y-1.5 text-gray-600 flex-1">
                {employe.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone size={11} /> <span className="truncate">{employe.telephone}</span>
                  </div>
                )}
                {employe.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={11} /> <span className="truncate">{employe.email}</span>
                  </div>
                )}
                {employe.adresse && (
                  <div className="flex items-center gap-2">
                    <MapPin size={11} /> <span className="truncate">{employe.adresse}</span>
                  </div>
                )}
                {employe.dateEmbauche && (
                  <div className="flex items-center gap-2">
                    <Calendar size={11} /> Depuis {new Date(employe.dateEmbauche).getFullYear()}
                  </div>
                )}
              </div>

              {/* Statut + Actions */}
              <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                <span className={`font-medium ${employe.disponible ? 'text-green-600' : 'text-red-600'}`}>
                  {employe.disponible ? 'Disponible' : 'En mission'}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(employe)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={async () => {
                    try {
                      await removeEmploye(employe.id);
                    } catch (error) {
                      console.error('Failed to delete employee:', error);
                    }
                  }} className="p-1.5 hover:bg-red-50 text-red-600 rounded transition">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL COMPACT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5">
            <h3 className="text-lg font-bold mb-4">{editingEmploye ? 'Modifier' : 'Nouvel employé'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Prénom" required value={formData.prenom || ''} onChange={e => setFormData({...formData, prenom: e.target.value})}
                  className="px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 outline-none" />
                <input placeholder="Nom" required value={formData.nom || ''} onChange={e => setFormData({...formData, nom: e.target.value})}
                  className="px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="email" placeholder="Email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="px-3 py-2 border rounded-md" />
                <input type="tel" placeholder="Téléphone" value={formData.telephone || ''} onChange={e => setFormData({...formData, telephone: e.target.value})}
                  className="px-3 py-2 border rounded-md" />
              </div>
              <input placeholder="Adresse" value={formData.adresse || ''} onChange={e => setFormData({...formData, adresse: e.target.value})}
                className="w-full px-3 py-2 border rounded-md" />
              <div className="grid grid-cols-2 gap-3">
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}
                  className="px-3 py-2 border rounded-md">
                  <option value="EBOUEUR">Éboueur</option>
                  <option value="CHAUFFEUR">Chauffeur</option>
                </select>
                <input type="date" value={formData.dateEmbauche || ''} onChange={e => setFormData({...formData, dateEmbauche: e.target.value})}
                  className="px-3 py-2 border rounded-md" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.disponible} onChange={e => setFormData({...formData, disponible: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded" />
                <span>Disponible</span>
              </label>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 text-sm">Annuler</button>
                <button type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  {editingEmploye ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;