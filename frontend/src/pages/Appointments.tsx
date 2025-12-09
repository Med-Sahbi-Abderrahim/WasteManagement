import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Truck, Upload, CheckCircle } from 'lucide-react';

export const AppointmentPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link to="/" className="text-blue-600 hover:underline">← Retour</Link>
          <h1 className="text-2xl font-bold">Encombrants</h1>
          <div className="w-32"></div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-8">
        {submitted ? (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-12 text-center">
            <CheckCircle size={80} className="text-green-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-green-800 mb-4">Demande enregistrée !</h2>
            <p className="text-lg text-green-700">Nous vous contacterons dans les 48h pour confirmer le passage.</p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-center mb-4">Prendre rendez-vous pour les encombrants</h2>
            <p className="text-center text-gray-600 mb-10">Service gratuit pour tous les habitants de la commune</p>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input type="text" placeholder="Nom complet" required className="px-6 py-4 border rounded-xl text-lg" />
                <input type="tel" placeholder="Téléphone" required className="px-6 py-4 border rounded-xl text-lg" />
              </div>
              <input type="text" placeholder="Adresse complète" required className="w-full px-6 py-4 border rounded-xl text-lg" />
              <textarea placeholder="Description des objets (ex: canapé, frigo, matelas...)" rows={4} required className="w-full px-6 py-4 border rounded-xl text-lg"></textarea>

              <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-dashed">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Ajoutez des photos (optionnel)</p>
              </div>

              <button type="submit" className="w-full py-5 bg-blue-600 text-white text-xl font-bold rounded-xl hover:bg-blue-700 transition">
                Demander l'enlèvement
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};