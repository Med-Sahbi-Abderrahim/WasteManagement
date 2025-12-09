import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Package, GlassWater, Newspaper, Trash2 } from 'lucide-react';

export const TriGuidePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link to="/" className="text-blue-600 hover:underline">← Retour</Link>
          <h1 className="text-2xl font-bold">Guide du Tri</h1>
          <div className="w-32"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-8">
        <h2 className="text-4xl font-bold text-center mb-12">Comment bien trier à Sfax ?</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-8 text-center">
            <Package size={64} className="text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">Emballages & Plastique</h3>
            <p className="text-gray-700">Bouteilles, barquettes, sacs, films plastique</p>
            <p className="mt-4 text-2xl font-bold text-yellow-700">Conteneur Jaune</p>
          </div>

          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-8 text-center">
            <GlassWater size={64} className="text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">Verre</h3>
            <p className="text-gray-700">Bouteilles, bocaux (sans bouchon)</p>
            <p className="mt-4 text-2xl font-bold text-green-700">Conteneur Vert</p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-8 text-center">
            <Newspaper size={64} className="text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">Papier & Carton</h3>
            <p className="text-gray-700">Journaux, cartons aplatis, briques alimentaires</p>
            <p className="mt-4 text-2xl font-bold text-blue-700">Conteneur Bleu</p>
          </div>

          <div className="bg-gray-100 border-2 border-gray-300 rounded-2xl p-8 text-center">
            <Trash2 size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">Tout-venant</h3>
            <p className="text-gray-700">Ce qui ne se recycle pas</p>
            <p className="mt-4 text-2xl font-bold text-gray-700">Conteneur Gris</p>
          </div>
        </div>
      </div>
    </div>
  );
};