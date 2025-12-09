import React from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Retour
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
            <Info size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">En savoir plus</h1>
        </div>
        <div className="prose text-gray-600">
          <p>EcoVille est une initiative municipale visant à optimiser la gestion des déchets urbains grâce à la technologie.</p>
          <h3>Nos Objectifs</h3>
          <ul>
            <li>Réduire l'empreinte carbone des collectes</li>
            <li>Améliorer la propreté de la ville</li>
            <li>Impliquer les citoyens dans la gestion locale</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
