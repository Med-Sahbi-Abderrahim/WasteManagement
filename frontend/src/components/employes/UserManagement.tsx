// src/components/employes/UserManagement.tsx

import React, { useState, useEffect } from 'react';
import { useWasteStore } from '../../store/wasteStore';
import {
  Plus,
  Search,
  Phone,
  Mail,
  Briefcase,
  Edit2,
  Trash2,
} from 'lucide-react';
import { AddUserModal } from './AddUserModal';

type UserRole = 'EMPLOYE' | 'SUPERVISEUR' | 'TECHNICIEN' | 'ADMIN';
type TabType = 'employes' | 'superviseurs' | 'techniciens' | 'admins';

export const UserManagement: React.FC = () => {
  const { 
    employes, admins, superviseurs, techniciens,
    fetchEmployes, fetchAdmins, fetchSuperviseurs, fetchTechniciens,
    updateUser, deleteUser
  } = useWasteStore();

  const [activeTab, setActiveTab] = useState<TabType>('employes');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployes();
    fetchAdmins();
    fetchSuperviseurs();
    fetchTechniciens();
  }, [fetchEmployes, fetchAdmins, fetchSuperviseurs, fetchTechniciens]);

  const getCurrentUsers = () => {
    switch (activeTab) {
      case 'employes': return employes;
      case 'admins': return admins;
      case 'superviseurs': return superviseurs;
      case 'techniciens': return techniciens;
      default: return [];
    }
  };

  const getRoleLabel = () => {
    switch (activeTab) {
      case 'employes': return 'Employés';
      case 'admins': return 'Admins';
      case 'superviseurs': return 'Superviseurs';
      case 'techniciens': return 'Techniciens';
      default: return '';
    }
  };

  const getRoleForModal = (): UserRole => {
    if (editingUser && editingUser.role) {
      return editingUser.role as UserRole;
    }
    switch (activeTab) {
      case 'employes': return 'EMPLOYE';
      case 'admins': return 'ADMIN';
      case 'superviseurs': return 'SUPERVISEUR';
      case 'techniciens': return 'TECHNICIEN';
      default: return 'EMPLOYE';
    }
  };

  const getRoleFromTab = (): string => {
    switch (activeTab) {
      case 'employes': return 'EMPLOYE';
      case 'admins': return 'ADMIN';
      case 'superviseurs': return 'SUPERVISEUR';
      case 'techniciens': return 'TECHNICIEN';
      default: return 'EMPLOYE';
    }
  };

  const users = getCurrentUsers();
  const filteredUsers = users.filter((u: any) =>
    `${u.prenom || ''} ${u.nom || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.mail || u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    // Refresh the current tab
    switch (activeTab) {
      case 'employes': fetchEmployes(); break;
      case 'admins': fetchAdmins(); break;
      case 'superviseurs': fetchSuperviseurs(); break;
      case 'techniciens': fetchTechniciens(); break;
    }
  };

  return (
    <div className="space-y-5 p-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
          <p className="text-xs text-gray-500">Administration des comptes</p>
        </div>

        <button 
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm text-xs">
          <Plus size={14} /> Ajouter
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'employes' as TabType, label: 'Employés' },
          { id: 'superviseurs' as TabType, label: 'Superviseurs' },
          { id: 'techniciens' as TabType, label: 'Techniciens' },
          { id: 'admins' as TabType, label: 'Admins' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* USER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {filteredUsers.length === 0 ? (
          <p className="col-span-full text-center py-10 text-gray-400 text-sm">
            Aucun {getRoleLabel().toLowerCase()}
          </p>
        ) : (
          filteredUsers.map((user: any) => (
            <div key={user.id} className="bg-white rounded-lg border border-gray-200 p-4 text-xs flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    user.role === 'ADMIN' ? 'bg-red-600' :
                    user.role === 'SUPERVISEUR' ? 'bg-purple-600' :
                    user.role === 'TECHNICIEN' ? 'bg-orange-600' :
                    'bg-blue-600'
                  }`}>
                    {(user.prenom || 'U')[0]}{(user.nom || 'U')[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 leading-tight">
                      {user.prenom || ''} {user.nom || ''}
                    </div>
                    <div className="text-gray-600 flex items-center gap-1">
                      <Briefcase size={11} /> {user.role || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-gray-600 flex-1">
                {(user.mail || user.email) && (
                  <div className="flex items-center gap-2">
                    <Mail size={11} /> <span className="truncate">{user.mail || user.email}</span>
                  </div>
                )}
                {user.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone size={11} /> <span className="truncate">{String(user.telephone)}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end items-center text-xs">
                <div className="flex gap-1">
                  <button 
                    onClick={() => {
                      setEditingUser(user);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition">
                    <Edit2 size={13} />
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        const role = getRoleFromTab();
                        await deleteUser(String(user.id), role);
                        // Refresh the current tab
                        switch (activeTab) {
                          case 'employes': await fetchEmployes(); break;
                          case 'admins': await fetchAdmins(); break;
                          case 'superviseurs': await fetchSuperviseurs(); break;
                          case 'techniciens': await fetchTechniciens(); break;
                        }
                      } catch (error) {
                        console.error('Failed to delete user:', error);
                        alert(`Erreur: ${error instanceof Error ? error.message : 'Impossible de supprimer l\'utilisateur'}`);
                      }
                    }}
                    className="p-1.5 hover:bg-red-50 text-red-600 rounded transition">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <AddUserModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          role={getRoleForModal()}
          initialData={editingUser}
        />
      )}
    </div>
  );
};

export default UserManagement;

