import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Truck, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CalendarPage: React.FC = () => {
  const [location, setLocation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [quartier, setQuartier] = useState<string | null>(null);

  const quartiersData: Record<string, { plastique: string; verre: string; organique: string; papier: string }> = {
    "Sfax Ville": { plastique: "Lundi & Jeudi", verre: "Mardi", organique: "Tous les jours", papier: "Mercredi" },
    "Sakiet Ezzit": { plastique: "Mardi & Vendredi", verre: "Jeudi", organique: "Tous les jours", papier: "Lundi" },
    "Thyna": { plastique: "Mercredi & Samedi", verre: "Vendredi", organique: "Tous les jours", papier: "Mardi" },
    "El Ain": { plastique: "Lundi & Vendredi", verre: "Mercredi", organique: "Tous les jours", papier: "Jeudi" },
    "Gremda": { plastique: "Jeudi & Dimanche", verre: "Samedi", organique: "Tous les jours", papier: "Lundi" }
  };

  const getLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Simulation : on prend un quartier aléatoire pour la démo
          const quartiers = Object.keys(quartiersData);
          const randomQuartier = quartiers[Math.floor(Math.random() * quartiers.length)];
          setQuartier(randomQuartier);
          setLocation(`Votre position : ${randomQuartier}`);
          setLoading(false);
        },
        () => {
          alert("Localisation refusée. Entrez votre quartier manuellement.");
          setLoading(false);
        }
      );
    } else {
      alert("Géolocalisation non supportée");
      setLoading(false);
    }
  };

  const selectedData = quartier ? quartiersData[quartier] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link to="/" className="text-blue-600 hover:underline">← Retour à l'accueil</Link>
          <h1 className="text-2xl font-bold">Calendrier des Collectes</h1>
          <div className="w-32"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Trouvez les jours de passage dans votre quartier</h2>
          <p className="text-gray-600">Activez la localisation ou choisissez votre quartier</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {!quartier ? (
            <div className="space-y-6">
              <button
                onClick={getLocation}
                disabled={loading}
                className="px-8 py-4 bg-green-600 text-white rounded-full font-bold text-lg hover:bg-green-700 transition flex items-center gap-3 mx-auto"
              >
                <MapPin size={24} />
                {loading ? "Localisation en cours..." : "Me localiser automatiquement"}
              </button>

              <div className="text-center text-gray-500">ou</div>

              <select
                onChange={(e) => setQuartier(e.target.value)}
                className="w-full max-w-md mx-auto px-6 py-4 border-2 border-gray-300 rounded-xl text-lg"
              >
                <option value="">Choisir mon quartier</option>
                {Object.keys(quartiersData).map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-center gap-3 text-green-600">
                <MapPin size={32} />
                <h3 className="text-2xl font-bold">{quartier}</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                  <h4 className="font-bold text-yellow-800 mb-2">Emballages & Plastique</h4>
                  <p className="text-2xl font-bold text-yellow-900">{selectedData!.plastique}</p>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <h4 className="font-bold text-green-800 mb-2">Verre</h4>
                  <p className="text-2xl font-bold text-green-900">{selectedData!.verre}</p>
                </div>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h4 className="font-bold text-blue-800 mb-2">Papier & Carton</h4>
                  <p className="text-2xl font-bold text-blue-900">{selectedData!.papier}</p>
                </div>
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                  <h4 className="font-bold text-orange-800 mb-2">Déchets organiques</h4>
                  <p className="text-2xl font-bold text-orange-900">{selectedData!.organique}</p>
                </div>
              </div>

              <button
                onClick={() => { setQuartier(null); setLocation(''); }}
                className="text-blue-600 hover:underline"
              >
                Changer de quartier
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <AlertCircle className="inline mr-2" />
          Les horaires peuvent être modifiés en cas d'aléas (fêtes, intempéries). Suivez les alertes sur la page d'accueil.
        </div>
      </div>
    </div>
  );
};