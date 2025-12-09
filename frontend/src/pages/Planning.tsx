import React from 'react';
import { ArrowLeft, Map } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Planning: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Retour
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
            <Map size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Planning Général</h1>
        </div>
        <p className="text-gray-600 mb-4">Vue d'ensemble des opérations municipales.</p>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center text-gray-500">
          [Planning interactif à venir]
        </div>
      </div>
    </div>
  );
};
