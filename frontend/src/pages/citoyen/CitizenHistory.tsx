import React from "react";
import { useWasteStore } from "../../store/wasteStore";
import { useAuthStore } from "../../store/authStore";
import { AlertTriangle, Clock, MapPin } from "lucide-react";

export const CitizenHistory: React.FC = () => {
  const { signalements, points } = useWasteStore();
  const { user } = useAuthStore();

  // Sécurité : si pas de user
  if (!user) {
    return (
      <div className="text-center py-20 text-gray-500">
        Veuillez vous connecter pour voir votre historique.
      </div>
    );
  }

  // Filtrer uniquement les signalements du citoyen
  const myReports = signalements.filter(
    (s) => s.citoyenId === user.id
  );

  // Trouver un point de collecte
  const getPointInfo = (id?: string) =>
    points.find((p) => p.id === id);

  // Couleurs du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOUVEAU":
        return "bg-red-100 text-red-800";
      case "EN_TRAITEMENT":
        return "bg-yellow-100 text-yellow-800";
      case "RESOLU":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Mon Historique
        </h2>
        <p className="text-gray-500">
          Retrouvez tous vos signalements passés.
        </p>
      </div>

      <div className="grid gap-4">
        {myReports.map((signalement) => {
          const point = getPointInfo(signalement.pointCollecteId);

          return (
            <div
              key={signalement.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex flex-col gap-3">
                
                {/* Header : statut + date + type */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        signalement.statut
                      )}`}
                    >
                      {signalement.statut}
                    </span>

                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock size={16} className="mr-1" />
                      {signalement.date}
                    </div>
                  </div>

                  <div className="flex items-center text-gray-500 text-sm">
                    <AlertTriangle size={16} className="mr-1" />
                    {signalement.type}
                  </div>
                </div>

                {/* Message */}
                <p className="text-gray-900 font-medium">
                  {signalement.message}
                </p>

                {/* Point de collecte */}
                {point && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm border-t border-gray-100 pt-3">
                    <MapPin size={16} className="text-gray-400" />
                    {point.adresse} ({point.type})
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Aucun signalement */}
        {myReports.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">
              Vous n'avez fait aucun signalement pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
