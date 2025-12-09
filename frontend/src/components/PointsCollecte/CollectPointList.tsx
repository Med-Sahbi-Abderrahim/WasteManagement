// src/components/PointsCollecte/CollectPointList.tsx

import React, { useState, useEffect } from 'react';
import { useWasteStore } from '../../store/wasteStore';
import { CollectPointCard } from './CollectPointCard';
import { AddPointModal } from './AddPointModal';
import { Plus, Upload, Download, Search } from 'lucide-react';
import { PointCollecte } from '../../types/waste';
import { generatePointsXML, parsePointsXML } from '../../utils/xml';

export const CollectPointList: React.FC = () => {
  const { points, isLoading, error, fetchPoints, addPoint, updatePoint, removePoint } = useWasteStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<PointCollecte | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch points on mount
  useEffect(() => {
    console.log('[CollectPointList] Component mounted, fetching points...');
    fetchPoints();
  }, [fetchPoints]);

  // EXPORT XML
  const handleExport = () => {
    const xml = generatePointsXML(points);
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `points_collecte_${new Date().toISOString().slice(0,10)}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // FILTRE RECHERCHE
  const filteredPoints = points.filter(p =>
    p.localisation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.typeDechet?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.modele?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des points de collecte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">Erreur lors du chargement</p>
        <p className="text-red-500 text-sm mt-2">{error}</p>
        <button
          onClick={() => fetchPoints()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER + BOUTONS COHÉRENTS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Points de Collecte</h2>
          <p className="text-gray-500">Gérez l'ensemble des conteneurs de la municipalité</p>
        </div>

        <div className="flex gap-3">
          {/* AJOUTER */}
          <button
            onClick={() => {
              setEditingPoint(undefined);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus size={18} /> Ajouter
          </button>

          {/* EXPORT */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Download size={18} /> Export XML
          </button>

          {/* IMPORT – CORRIGÉ (label + input caché) */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (ev) => {
                  try {
                    const imported = parsePointsXML(ev.target?.result as string);
                    // Imported points should be added via API, not directly to store
                    // For now, just show a message
                    alert(`${imported.length} points de collecte parsés. L'import via API sera implémenté.`);
                  } catch (err) {
                    alert("Erreur lors de l'import du fichier XML");
                  }
                };
                reader.onerror = () => alert('Erreur de lecture du fichier');
                reader.readAsText(file);
              }}
            />
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm">
              <Upload size={18} /> Import XML
            </div>
          </label>
        </div>
      </div>

      {/* RECHERCHE */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher par adresse, type ou modèle..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* GRILLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPoints.map((point) => (
          <CollectPointCard
            key={point.id}
            point={point}
            onEdit={(p) => {
              setEditingPoint(p);
              setIsModalOpen(true);
            }}
            onDelete={removePoint}
          />
        ))}
      </div>

      {/* AUCUN RÉSULTAT */}
      {filteredPoints.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">
            {points.length === 0 
              ? "Aucun point de collecte enregistré." 
              : "Aucun résultat pour cette recherche."}
          </p>
          {points.length === 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Ajouter le premier point
            </button>
          )}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <AddPointModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingPoint}
          onSubmit={async (data) => {
            try {
              if (editingPoint) {
                // UPDATE: data is Partial<PointCollecte>, which is fine for updatePoint
                await updatePoint(editingPoint.id, data);
              } else {
                // CREATE: Assert that 'data' has all required fields (except 'id') 
                // because we are in the "create" path.
                await addPoint(data as Omit<PointCollecte, 'id'>); 
              }
              setIsModalOpen(false);
              setEditingPoint(undefined);
              // Refresh points after add/update
              await fetchPoints();
            } catch (err) {
              console.error('Error saving point:', err);
              // CRITICAL: You might want to display this error to the user
              alert('Erreur lors de l\'enregistrement du point.');
            }
          }}
        />
      )}
    </div>
  );
};

export default CollectPointList;