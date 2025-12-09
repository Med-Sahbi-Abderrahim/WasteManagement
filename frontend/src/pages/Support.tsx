import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Support: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Retour
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
            <Mail size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Technique</h1>
            <p className="text-gray-500">Nous sommes là pour vous aider</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Phone size={20} className="text-blue-500" />
              <span>+216 74 123 456</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Mail size={20} className="text-blue-500" />
              <span>support@ecoville.tn</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin size={20} className="text-blue-500" />
              <span>Hôtel de Ville, Sfax</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <p className="font-bold mb-2">Horaires d'ouverture</p>
            <p>Lundi - Vendredi : 8h00 - 17h00</p>
            <p>Samedi : 8h00 - 12h00</p>
          </div>
        </div>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Message envoyé !</h3>
            <p className="text-green-700">Notre équipe vous répondra dans les plus brefs délais.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-100 pt-8">
            <h3 className="font-bold text-gray-900">Envoyez-nous un message</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input type="text" required className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea required rows={4} className="w-full p-2 border border-gray-300 rounded-lg"></textarea>
            </div>
            <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Envoyer le message
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
