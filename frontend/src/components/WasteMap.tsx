import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PointCollecte } from '../types/waste';
import { Truck } from 'lucide-react';
import { createTruckMarkerIcon } from './TruckMarkerIcon';

// Fix for default icons
// Fix for default icons using images from public folder
const DefaultIcon = L.icon({
    iconUrl: '/images/leaflet/marker-icon.png',
    iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
    shadowUrl: '/images/leaflet/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Apply default icon to all markers
L.Marker.prototype.options.icon = DefaultIcon;


// Custom Icons Generators
const createWasteIcon = (type: string, fillLevel: number) => {
  let color = '#6b7280'; // Gray/Mixte
  if (type === 'PLASTIQUE') color = '#eab308'; // Yellow
  if (type === 'VERRE') color = '#22c55e'; // Green
  if (type === 'PAPIER') color = '#3b82f6'; // Blue
  if (type === 'ORGANIQUE') color = '#854d0e'; // Brown

  const isCritical = fillLevel > 80;
  const pulseClass = isCritical ? 'animate-pulse' : '';
  const borderColor = isCritical ? '#ef4444' : 'white';
  const borderWidth = isCritical ? '3px' : '2px';

  const html = `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: ${borderWidth} solid ${borderColor};
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      position: relative;
    " class="${pulseClass}">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
      <div style="
        position: absolute;
        bottom: -4px;
        right: -4px;
        background-color: white;
        border-radius: 50%;
        padding: 2px;
        font-size: 10px;
        font-weight: bold;
        color: ${fillLevel > 80 ? '#ef4444' : '#374151'};
        border: 1px solid #e5e7eb;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">${fillLevel}%</div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-waste-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20]
  });
};

interface Props {
  points: PointCollecte[];
  height?: string;
}

interface Vehicle {
  id: string;
  lat: number;
  lng: number;
  name: string;
  type: 'Benne' | 'Recyclage';
  target: [number, number];
}

export const WasteMap: React.FC<Props> = ({ points, height = '400px' }) => {
  // Sfax Center
  const center: [number, number] = [34.7406, 10.7603];
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: 'v1', lat: 34.7450, lng: 10.7650, name: 'Camion 101', type: 'Benne', target: [34.7350, 10.7500] },
    { id: 'v2', lat: 34.7300, lng: 10.7500, name: 'Camion 102', type: 'Recyclage', target: [34.7600, 10.7550] },
    { id: 'v3', lat: 34.7550, lng: 10.7700, name: 'Camion 103', type: 'Benne', target: [34.7400, 10.7600] },
    { id: 'v4', lat: 34.7200, lng: 10.7400, name: 'Camion 104', type: 'Benne', target: [34.7500, 10.7300] },
    { id: 'v5', lat: 34.7600, lng: 10.7300, name: 'Camion 105', type: 'Recyclage', target: [34.7250, 10.7450] },
    { id: 'v6', lat: 34.7350, lng: 10.7800, name: 'Camion 106', type: 'Benne', target: [34.7550, 10.7650] },
    { id: 'v7', lat: 34.7420, lng: 10.7520, name: 'Camion 107', type: 'Recyclage', target: [34.7480, 10.7620] },
    { id: 'v8', lat: 34.7280, lng: 10.7680, name: 'Camion 108', type: 'Benne', target: [34.7320, 10.7580] },
    { id: 'v9', lat: 34.7520, lng: 10.7380, name: 'Camion 109', type: 'Benne', target: [34.7450, 10.7480] },
    { id: 'v10', lat: 34.7380, lng: 10.7720, name: 'Camion 110', type: 'Recyclage', target: [34.7280, 10.7620] },
  ]);

  // Simulate vehicle movement
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        const speed = 0.0003; // Slightly slower for realism
        const dx = v.target[0] - v.lat;
        const dy = v.target[1] - v.lng;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < speed) {
          // Reached target, pick new random target near Sfax
          const newTarget: [number, number] = [
            34.72 + Math.random() * 0.06,
            10.73 + Math.random() * 0.06
          ];
          return { ...v, target: newTarget };
        }

        return {
          ...v,
          lat: v.lat + (dx / distance) * speed,
          lng: v.lng + (dy / distance) * speed
        };
      }));
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <MapContainer center={center} zoom={13} style={{ height, width: '100%', borderRadius: '0.75rem' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Collection Points */}
      {points.map(point => (
        <Marker 
          key={point.id} 
          position={[point.latitude, point.longitude]}
          icon={createWasteIcon(point.type, point.niveauRemplissage)}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900">{point.type}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  point.etat === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {point.etat}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{point.adresse}</p>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Remplissage</span>
                  <span className="font-bold">{point.niveauRemplissage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      point.niveauRemplissage > 80 ? 'bg-red-500' : 
                      point.niveauRemplissage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${point.niveauRemplissage}%` }}
                  />
                </div>
              </div>
              
              {point.derniereCollecte && (
                <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
                  Dernière collecte : {point.derniereCollecte}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Moving Vehicles */}
      {vehicles.map(vehicle => (
        <Marker 
          key={vehicle.id} 
          position={[vehicle.lat, vehicle.lng]}
          icon={createTruckMarkerIcon(vehicle.type)}
          zIndexOffset={1000}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-blue-600 flex items-center gap-2">
                <Truck size={16} />
                {vehicle.name}
              </h3>
              <p className="text-xs text-gray-600 font-medium">{vehicle.type}</p>
              <p className="text-xs text-gray-500">En déplacement...</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
export default WasteMap;