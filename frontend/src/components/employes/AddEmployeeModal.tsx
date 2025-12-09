import React, { useState, useEffect } from 'react';
import { Employe } from '../../types/waste';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Employe;
  onSubmit: (data: Omit<Employe, 'id'>) => void;
}

export const AddEmployeeModal: React.FC<Props> = ({ isOpen, onClose, initialData, onSubmit }) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [role, setRole] = useState<'CHAUFFEUR' | 'EBOUEUR'>('CHAUFFEUR'); // valeur par défaut
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (initialData) {
      setNom(initialData.nom || '');
      setPrenom(initialData.prenom || '');
      setRole(initialData.role || 'CHAUFFEUR');
      setEmail(initialData.email || '');
    } else {
      setNom('');
      setPrenom('');
      setRole('CHAUFFEUR');
      setEmail('');
    }
  }, [initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">{initialData ? 'Modifier' : 'Ajouter'} Employé</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Prénom"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'CHAUFFEUR' | 'EBOUEUR')}
            className="w-full p-2 border rounded"
          >
            <option value="CHAUFFEUR">CHAUFFEUR</option>
            <option value="EBOUEUR">EBOUEUR</option>
          </select>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Annuler
          </button>
          <button
            onClick={() =>
              onSubmit({
                nom,
                prenom,
                role,
                email: email || '',
                disponible: true, // valeur par défaut obligatoire pour le store
              })
            }
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {initialData ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
};
