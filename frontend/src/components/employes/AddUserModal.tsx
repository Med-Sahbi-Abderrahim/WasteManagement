import React, { useState, useEffect } from 'react';
import { useWasteStore } from '../../store/wasteStore';

type UserRole = 'EMPLOYE' | 'SUPERVISEUR' | 'TECHNICIEN' | 'ADMIN';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  initialData?: any;
}

export const AddUserModal: React.FC<Props> = ({ isOpen, onClose, role, initialData, onUpdate }) => {
  const { addEmploye, addAdmin, addSuperviseur, addTechnicien, updateUser } = useWasteStore();
  
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [mail, setMail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(role);

  useEffect(() => {
    if (initialData) {
      setNom(initialData.nom || '');
      setPrenom(initialData.prenom || '');
      setMail(initialData.mail || initialData.email || '');
      setTelephone(String(initialData.telephone || ''));
      setMotDePasse(initialData.motDePasse || initialData.password || '');
      setSelectedRole(initialData.role || role);
    } else {
      setNom('');
      setPrenom('');
      setMail('');
      setTelephone('');
      setMotDePasse('');
      setSelectedRole(role);
    }
  }, [initialData, role, isOpen]);

  const getRoleLabel = () => {
    switch (selectedRole) {
      case 'ADMIN': return 'Admin';
      case 'SUPERVISEUR': return 'Superviseur';
      case 'TECHNICIEN': return 'Technicien';
      case 'EMPLOYE': return 'Employé';
      default: return 'Utilisateur';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nom || !prenom || !mail || !telephone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Password is required for new users, optional for updates
    if (!initialData && !motDePasse) {
      alert('Le mot de passe est obligatoire pour les nouveaux utilisateurs');
      return;
    }

    try {
      const userData = {
        nom,
        prenom,
        mail,
        telephone,
        motDePasse: motDePasse || (initialData?.motDePasse || initialData?.password || '1234'),
      };

      // If editing, use updateUser
      if (initialData && initialData.id) {
        const roleToUse = initialData.role || selectedRole;
        if (onUpdate) {
          await onUpdate(userData);
        } else {
          await updateUser(initialData.id, userData, roleToUse);
        }
      } else {
        // Creating new user
        switch (selectedRole) {
          case 'ADMIN':
            await addAdmin(userData);
            break;
          case 'SUPERVISEUR':
            await addSuperviseur(userData);
            break;
          case 'TECHNICIEN':
            await addTechnicien(userData);
            break;
          case 'EMPLOYE':
            await addEmploye({
              id: crypto.randomUUID(),
              nom,
              prenom,
              role: 'EBOUEUR',
              email: mail,
              telephone,
              disponible: true,
              motDePasse: userData.motDePasse,
            } as any);
            break;
        }
      }

      onClose();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Erreur lors de l\'enregistrement de l\'utilisateur');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? 'Modifier' : 'Ajouter'} {getRoleLabel()}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {!initialData && (
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full p-2 border rounded"
            >
              <option value="EMPLOYE">Employé</option>
              <option value="SUPERVISEUR">Superviseur</option>
              <option value="TECHNICIEN">Technicien</option>
              <option value="ADMIN">Admin</option>
            </select>
          )}
          
          <input
            type="text"
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Prénom"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="tel"
            placeholder="Téléphone"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder={initialData ? "Mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required={!initialData}
            className="w-full p-2 border rounded"
          />
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {initialData ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

