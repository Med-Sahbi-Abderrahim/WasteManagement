// src/types/waste.ts
export type PointType = 'PLASTIQUE' | 'VERRE' | 'PAPIER' | 'ORGANIQUE' | 'MIXTE';
export type PointEtat = 'ACTIF' | 'MAINTENANCE';
export type VehiculeStatut = 'DISPONIBLE' | 'EN_MISSION' | 'MAINTENANCE'| 'EN_CHARGE' | 'EN_PANNE';
type RoleEmploye = 'CHAUFFEUR' | 'EBOUEUR' | 'SUPERVISEUR';
type TourneeStatut = 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE'|'RETARDEE';
type SignalementType = 'DEBORDEMENT' | 'DEGRADATION' | 'ODEUR' | 'INCENDIE' | 'MAUVAIS_TRI' | 'ANIMAUX' |'AUTRE' ;
type SignalementStatut = 'NOUVEAU' | 'EN_TRAITEMENT' | 'RESOLU' | 'URGENT';

export interface PointCollecte {
  id: number;
  latitude?: number;
  longitude?: number;
  localisation: string; // Backend uses 'localisation' not 'adresse'
  typeDechet: { id: number; nom: string }; // Backend uses object, not string
  niveauRemplissage: number;
  etatConteneur: string; // Backend uses 'etatConteneur' not 'etat' (ACTIF, MAINTENANCE, HORS_SERVICE)
  capacite?: number;
  modele?: string;
  dateDerniereCollecte?: string; // Backend uses 'DateDerniereCollecte'
}

export interface Vehicule {
  id: number | string;
  immatriculation?: string;
  typeVehicule?: string; // Backend uses 'typeVehicule' not 'type'
  type?: string; // Frontend alias for typeVehicule
  capacite: number;
  disponibilite?: boolean; // Backend uses 'disponibilite' boolean
  etat?: string; // Backend uses 'etat' (DISPONIBLE, EN_MISSION, MAINTENANCE)
  statut?: string; // Backend also has 'statut' field (alias for etat)
  conducteur?: Employee; // Backend uses 'conducteur' of type Employee
}

// Backend uses 'Employee' class (English) but XML uses 'employe' (French)
export interface Employee {
  id: number;
  mail: string;
  nom: string;
  prenom: string;
  telephone: number;
  role: string; // ADMIN, EMPLOYE, TECHNICIEN, SUPERVISEUR
  disponible?: boolean;
}

export interface Employe {
  id: string;
  prenom: string;
  nom: string;
  role: RoleEmploye;
  telephone: string;
  email?: string;
  adresse?:string;
  dateEmbauche?: string;
  disponible: boolean;
}

export interface Tournee {
  id: string;
  date: string;
  heureDebut: string;
  heureFin: string | null;
  vehiculeId: string;
  employeIds: string[];
  pointsCollecteIds: string[];
  statut: TourneeStatut;
  distanceKm: number;
  trajetOptimise?: string[]; // ordre optimisé des points
}

export interface Signalement {
  id: string;
  type: SignalementType;
  message: string;
  date: string;
  statut: SignalementStatut;
  adresse?: string;
  pointCollecteId: string;
  citoyenNom?: string;
  citoyenTel?: string;
}