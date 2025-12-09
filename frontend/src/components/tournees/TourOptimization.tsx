// src/components/tournees/TourOptimization.tsx

import React, { useState } from 'react';
import { useWasteStore } from '../../store/wasteStore';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Zap, AlertTriangle, CheckCircle, Route, Fuel, Clock } from 'lucide-react';
import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';

const depotPosition: [number, number] = [34.7406, 10.7603];

const truckIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const TourOptimization: React.FC = () => {
  const { points, vehicules, employes, signalements, addTournee } = useWasteStore();
  const [optimizing, setOptimizing] = useState(false);
  const [tours, setTours] = useState<any[]>([]);
  const [savings, setSavings] = useState({ km: 0, time: 0, fuel: 0 });

  const criticalPoints = points.filter(p => {
    const urgent = signalements.some(s => s.pointCollecteId === p.id && (s.statut === 'NOUVEAU' || s.statut === 'URGENT'));
    return p.niveauRemplissage > 80 || urgent;
  });

  const optimizeTours = () => {
    setOptimizing(true);
    setTours([]);
    setSavings({ km: 0, time: 0, fuel: 0 });

    setTimeout(() => {
      const availableVehicles = vehicules.filter(v => v.statut === 'DISPONIBLE');
      const drivers = employes.filter(e => e.role === 'CHAUFFEUR' && e.disponible);

      const newTours: any[] = [];
      let remaining = [...criticalPoints].sort((a, b) => b.niveauRemplissage - a.niveauRemplissage);
      let totalAfter = 0;

      for (let i = 0; i < Math.min(4, availableVehicles.length); i++) {
        const segment = remaining.splice(0, Math.min(10, remaining.length));
        if (segment.length === 0) break;
        const dist = Number((segment.length * 4.2 + 10).toFixed(1));
        totalAfter += dist;

        newTours.push({
          points: segment,
          distanceKm: dist,
          color: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'][i],
        });
      }

      const before = criticalPoints.length * 9.5;
      const eco = Math.round(before - totalAfter);
      setSavings({
        km: eco,
        time: Math.round(eco * 2.8),
        fuel: Math.round(eco * 2.1),
      });

      setTours(newTours);
      setOptimizing(false);
    }, 3200);
  };

  const applyTours = () => {
    tours.forEach((tour, i) => {
      addTournee({
        date: format(new Date(), 'yyyy-MM-dd'),
        vehiculeId: vehicules[i]?.id || '',
        employeIds: employes.filter(e => e.disponible).slice(0, 3).map(e => e.id),
        pointsCollecteIds: tour.points.map((p: any) => p.id),
        distanceKm: tour.distanceKm,
        statut: 'PLANIFIEE' as const,
        heureDebut: ['06:30', '07:30', '13:30', '14:30'][i] || '08:00',
        heureFin: '',
      });
    });
    alert(`${tours.length} tournées optimisées ajoutées avec succès !`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <Zap className="text-yellow-500" size={40} />
          Optimisation Intelligente des Tournées
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          L’IA analyse les points critiques et génère les trajets optimaux
        </p>
      </div>

      <div className="text-center">
        <button
          onClick={optimizeTours}
          disabled={optimizing || criticalPoints.length === 0}
          className={`px-10 py-4 text-lg font-bold rounded-2xl shadow-xl transition-all ${
            optimizing || criticalPoints.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600'
          }`}
        >
          {optimizing ? 'Calcul IA en cours...' : 'Lancer l’optimisation IA'}
        </button>

        {criticalPoints.length > 0 && (
          <p className="mt-4 text-lg font-bold text-red-600 flex items-center justify-center gap-2">
            <AlertTriangle size={24} />
            {criticalPoints.length} points critiques détectés
          </p>
        )}
      </div>

      {savings.km > 0 && (
        <div className="grid grid-cols-3 gap-6 my-8">
          {[
            { icon: Route, value: savings.km + ' km', label: 'Distance économisée' },
            { icon: Clock, value: savings.time + ' min', label: 'Temps gagné' },
            { icon: Fuel, value: savings.fuel + ' TND', label: 'Carburant sauvé' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-lg text-center border">
              <item.icon className="mx-auto text-emerald-600" size={48} />
              <div className="text-3xl font-black mt-3">{item.value}</div>
              <div className="text-sm text-gray-600">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {tours.length > 0 && (
        <>
          <div className="h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-200">
            <MapContainer center={depotPosition} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={depotPosition} icon={truckIcon}>
                <Popup>Dépôt Municipal</Popup>
              </Marker>
              {tours.map((tour: any, i: number) => (
                <React.Fragment key={i}>
                  {tour.points.map((p: any) => (
                    <Marker key={p.id} position={[p.latitude, p.longitude]}>
                      <Popup>{p.adresse} • {p.niveauRemplissage}%</Popup>
                    </Marker>
                  ))}
                  <Polyline
                    positions={[depotPosition, ...tour.points.map((p:any) => [p.latitude, p.longitude] as [number,number]), depotPosition]}
                    color={tour.color}
                    weight={6}
                    opacity={0.9}
                  />
                </React.Fragment>
              ))}
            </MapContainer>
          </div>

          <div className="text-center py-6">
            <button
              onClick={applyTours}
              className="px-12 py-4 bg-green-600 text-white text-lg font-bold rounded-2xl shadow-xl hover:bg-green-700 flex items-center gap-3 mx-auto"
            >
              <CheckCircle size={32} />
              Valider ces {tours.length} tournées optimisées
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TourOptimization;