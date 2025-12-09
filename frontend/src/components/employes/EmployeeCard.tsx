import React from 'react';
import { Employe } from '../../types/waste';
import { Edit, Trash2 } from 'lucide-react';

interface Props {
  employe: Employe;
  onEdit: (emp: Employe) => void;
  onDelete: (id: string) => void;
}

export const EmployeeCard: React.FC<Props> = ({ employe, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-900">{employe.nom} {employe.prenom}</h3>
        <div className="flex gap-2">
          <button onClick={() => onEdit(employe)} className="text-blue-600 hover:text-blue-800">
            <Edit size={16} />
          </button>
          <button onClick={() => onDelete(employe.id)} className="text-red-600 hover:text-red-800">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <p className="text-gray-500 text-sm">Rôle: {employe.role}</p>
      <p className="text-gray-500 text-sm">Email: {employe.email}</p>
    </div>
  );
};
