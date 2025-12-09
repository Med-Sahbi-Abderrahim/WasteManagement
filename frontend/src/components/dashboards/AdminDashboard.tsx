// src/components/dashboard/AdminDashboard.tsx

import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useWasteStore } from '../../store/wasteStore';
import { 
  MapPin, Truck, Users, AlertTriangle, Activity, Calendar, Target, ShieldCheck,
  Brain, Download, Upload, XCircle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const getMarkerIcon = (fill: number) => {
  const color = fill >= 85 ? '#dc2626' : fill >= 65 ? '#f97316' : '#16a34a';
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${color}">
             <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
           </svg>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
};

const BarChart = ({ data, labels, title, color }: { data: number[]; labels: string[]; title: string; color: string }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="text-xs">
      <p className="font-bold text-gray-800 mb-1">{title}</p>
      <div className="flex items-end justify-between h-20 gap-1">
        {data.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div 
              className={`${color} w-full rounded-t transition-all duration-700`}
              style={{ height: `${(val / max) * 100}%`, minHeight: '6px' }}
            />
            <span className="text-[9px] text-gray-600 mt-1">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const { points, tournees, vehicules, employes, signalements, fetchPoints } = useWasteStore();
  const today = format(new Date(), 'EEEE dd MMMM yyyy', { locale: fr });

  // Fetch points on mount
  useEffect(() => {
    console.log('[AdminDashboard] Component mounted, fetching points...');
    fetchPoints();
  }, [fetchPoints]);

  const stats = {
    remplissageMoyen: points.length > 0 ? Math.round(points.reduce((a, p) => a + p.niveauRemplissage, 0) / points.length) : 0,
    tauxRecyclage: 42.5,
    tourneesAuj: tournees.filter(t => t.statut === 'EN_COURS' || t.statut === 'PLANIFIEE').length,
    tourneesTotal: 32,
    co2Economise: 8.5,
    xmlImportOk: 127,
    xmlImportKo: 3,
    xmlExportOk: 89,
    xmlExportKo: 1,
    iqtMoyen: 87.4,
    predictionsHautRisque: points.filter(p => (p as any).predictionRisque === 'HAUT').length || 8,
  };

  return (
    <>
      {/* HEADER VERT PUR UNI */}
      <div className="bg-emerald-700 text-white px-4 py-3 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold">SIGDU – Municipalité de Sfax</h1>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{today}</span>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-4 bg-gray-50 min-h-screen text-xs">

        {/* 4 CHIFFRES CLÉS EN HAUT */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white rounded border p-2 text-center shadow-sm">
            <Users className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
            <p className="text-lg font-black">{employes.length}</p>
            <p className="text-[10px]">Agents</p>
          </div>
          <div className="bg-white rounded border p-2 text-center shadow-sm">
            <Truck className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-lg font-black">{vehicules.length}</p>
            <p className="text-[10px]">Véhicules</p>
          </div>
          <div className="bg-white rounded border p-2 text-center shadow-sm">
            <Activity className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-black">{stats.tourneesAuj}/{stats.tourneesTotal}</p>
            <p className="text-[10px]">Tournées jour</p>
          </div>
          <div className="bg-white rounded border p-2 text-center shadow-sm">
            <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-black text-red-600">{signalements.filter(s => s.statut === 'URGENT').length}</p>
            <p className="text-[10px]">Urgents</p>
          </div>
        </div>

        {/* CARTE JUSTE APRÈS LES CHIFFRES */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="bg-gray-900 text-white px-3 py-2 text-xs font-bold">
            Suivi en Temps Réel – Points & Tournées
          </div>
          <div className="h-80">
            <MapContainer center={[34.7406, 10.7603]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {points.map(p => (
                <Marker key={p.id} position={[p.latitude || 34.7406, p.longitude || 10.7603]} icon={getMarkerIcon(p.niveauRemplissage)}>
                  <Popup className="text-xs">
                    <strong>{p.localisation}</strong><br />
                    {p.typeDechet?.nom || 'MIXTE'} • {p.niveauRemplissage}%
                  </Popup>
                </Marker>
              ))}
              {tournees
                .filter(t => t.statut === 'EN_COURS')
                .map(tournee => {
                  const path: [number, number][] = tournee.pointsCollecteIds
                    .map(id => points.find(p => p.id === id))
                    .filter((p): p is NonNullable<typeof p> => p !== undefined)
                    .map(p => [p.latitude, p.longitude] as [number, number]);
                  return path.length >= 2 ? (
                    <Polyline key={tournee.id} positions={path} color="#10b981" weight={5} opacity={0.8} />
                  ) : null;
                })}
            </MapContainer>
          </div>
          <div className="flex justify-center gap-6 py-2 text-[10px] bg-gray-50">
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-600 rounded-full"></div>&lt;65%</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded-full"></div>65–85%</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-600 rounded-full"></div>&gt;85%</span>
          </div>
        </div>

        {/* IQT – SIMPLE, BLANC, SANS VERT */}
        <div className="bg-white rounded-lg border shadow-sm p-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-6 h-6 text-gray-700" />
            <h3 className="font-bold text-gray-800 text-sm">Indice Qualité Tri (IQT)</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.iqtMoyen}</p>
          <p className="text-xs text-gray-600 mt-1 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-gray-600" /> Traçabilité complète activée
          </p>
        </div>

        {/* TOUT LE RESTE... */}

        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white rounded-lg p-3">
          <h3 className="font-bold flex items-center gap-2 text-sm">
            <Brain className="w-5 h-5" /> Analyse Prédictive Active
          </h3>
          <p className="text-xs mt-1 opacity-90">
            {stats.predictionsHautRisque} points à haut risque de débordement dans 24/48h
          </p>
        </div>

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="text-left px-3 py-2 font-bold">Indicateur</th>
                <th className="text-center px-3 py-2 font-bold">Valeur</th>
                <th className="text-center px-3 py-2 font-bold">Tendance</th>
                <th className="text-center px-3 py-2 font-bold">Seuil</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2">Remplissage moyen</td>
                <td className="text-center font-bold">{stats.remplissageMoyen}%</td>
                <td className="text-center text-green-600">+2%</td>
                <td className="text-center text-orange-600">85%</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2">Recyclage</td>
                <td className="text-center font-bold text-emerald-700">{stats.tauxRecyclage}%</td>
                <td className="text-center text-green-600">+1.1%</td>
                <td className="text-center">50%</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2">CO₂ économisé</td>
                <td className="text-center font-bold text-emerald-800">{stats.co2Economise} T</td>
                <td className="text-center text-green-600">+0.5</td>
                <td className="text-center text-gray-500">N/A</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg border p-3 shadow-sm">
            <BarChart title="CO₂ (T)" data={[3.2, 5.8, 6.9, 7.7, 8.5]} labels={['A', 'S', 'O', 'N', 'D']} color="bg-emerald-600" />
          </div>
          <div className="bg-white rounded-lg border p-3 shadow-sm">
            <BarChart title="Recyclage (%)" data={[32, 38, 40, 41.5, 42.5]} labels={['A', 'S', 'O', 'N', 'D']} color="bg-blue-600" />
          </div>
        </div>

        {/* SIGNALEMENTS */}
        <div className="bg-white rounded-lg border shadow-sm p-3">
          <h3 className="font-bold text-gray-900 text-xs mb-2">Signalements récents</h3>
          <div className="space-y-1 text-xs">
            {signalements.slice(0, 4).map(s => (
              <div key={s.id} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded">
                <span>{s.type}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.statut === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {s.statut}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TOURNÉES DU JOUR – APRÈS SIGNALEMENTS, EN GROS ET CLAIR */}
        <div className="bg-white rounded-lg border shadow-sm p-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Activity className="w-7 h-7 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-800">Tournées du jour</h3>
          </div>
          <p className="text-4xl font-black text-blue-700">{stats.tourneesAuj}<span className="text-2xl text-gray-600">/{stats.tourneesTotal}</span></p>
          <p className="text-xs text-gray-600 mt-1">Tournées actives / planifiées aujourd’hui</p>
        </div>

        {/* XML / XSD */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="bg-emerald-50 border border-emerald-300 rounded p-2 text-center">
            <Upload className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <div className="font-black text-emerald-700">{stats.xmlImportOk}</div>
            <div>Import OK</div>
          </div>
          <div className="bg-red-50 border border-red-300 rounded p-2 text-center">
            <XCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
            <div className="font-black text-red-700">{stats.xmlImportKo}</div>
            <div>XSD KO</div>
          </div>
          <div className="bg-blue-50 border border-blue-300 rounded p-2 text-center">
            <Download className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="font-black text-blue-700">{stats.xmlExportOk}</div>
            <div>Export OK</div>
          </div>
          <div className="bg-orange-50 border border-orange-300 rounded p-2 text-center">
            <XCircle className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <div className="font-black text-orange-700">{stats.xmlExportKo}</div>
            <div>Export KO</div>
          </div>
        </div>

      </div>
    </>
  );
};

export default AdminDashboard;