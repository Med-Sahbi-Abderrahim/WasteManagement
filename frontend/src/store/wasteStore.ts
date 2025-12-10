import { create } from 'zustand';
import { pointsService } from '../services/pointsService';
import { employeesService } from '../services/employeesService';
import { vehiclesService } from '../services/vehiclesService';
import { Employe, Vehicule } from '../types/waste';
import { generateEmployesXML, parseEmployesXML, generateVehiculesXML, parseVehiculesXML } from '../utils/xml';
import api from '../services/api';

interface PointCollecte {
  id: number;
  localisation: string;
  niveauRemplissage: number;
  etatConteneur: string;
  typeDechet: { id: number; nom: string };
  latitude?: number;
  longitude?: number;
  capacite?: number;
  modele?: string;
}

interface WasteStore {
  points: PointCollecte[];
  isLoading: boolean;
  error: string | null;
  
  // Additional data
  tournees: any[];
  vehicules: Vehicule[];
  employes: Employe[];
  signalements: any[];
  notifications: any[];
  
  // Additional actions
  addNotification?: (notification: any) => void;
  
  // Points Actions
  fetchPoints: () => Promise<void>;
  addPoint: (point: Omit<PointCollecte, 'id'>) => Promise<void>;
  updatePoint: (id: number, point: Partial<PointCollecte>) => Promise<void>;
  removePoint: (id: number) => Promise<void>;
  
  // Employees Actions
  fetchEmployes: () => Promise<void>;
  addEmploye: (employe: Employe) => Promise<void>;
  updateEmploye: (id: string, updates: Partial<Employe>) => Promise<void>;
  removeEmploye: (id: string) => Promise<void>;
  exportEmployesXML: () => void;
  importEmployesXML: (xmlString: string) => void;
  
  // Vehicles Actions
  fetchVehicules: () => Promise<void>;
  addVehicule: (vehicule: Vehicule) => Promise<void>;
  updateVehicule: (id: string | number, updates: Partial<Vehicule>) => Promise<void>;
  removeVehicule: (id: string | number) => Promise<void>;
  exportVehiculesXML: () => void;
  
  // Tournees Actions
  fetchTournees: () => Promise<void>;
  addTournee: (tournee: any) => Promise<void>;
  updateTourneeStatut?: (id: string, statut: 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | string) => Promise<void>;
}

export const useWasteStore = create<WasteStore>((set, get) => ({
  points: [],
  isLoading: false,
  error: null,
  tournees: [],
  vehicules: [],
  employes: [],
  signalements: [],
  notifications: [],
  addNotification: undefined,
  
  // Points Actions
  fetchPoints: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('[WasteStore] Fetching points from /api/points...');
      const points = await pointsService.getAll();
      console.log('[WasteStore] Points fetched successfully:', points);
      set({ points, isLoading: false });
    } catch (error: any) {
      console.error('[WasteStore] Fetch Points API Error:', error);
      console.error('[WasteStore] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      set({ 
        error: error.response?.data?.error || error.message || 'Failed to fetch points', 
        isLoading: false 
      });
    }
  },
  
  addPoint: async (point) => {
    set({ isLoading: true, error: null });
    try {
      const newPoint = await pointsService.create(point);
      set(state => ({ 
        points: [...state.points, newPoint], 
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to create point', 
        isLoading: false 
      });
    }
  },
  
  updatePoint: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await pointsService.update(id, updates);
      set(state => ({ 
        points: state.points.map(p => p.id === id ? updated : p), 
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to update point', 
        isLoading: false 
      });
    }
  },
  
  removePoint: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await pointsService.delete(id);
      set(state => ({ 
        points: state.points.filter(p => p.id !== id), 
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to delete point', 
        isLoading: false 
      });
    }
  },
  
  // Employees Actions
  fetchEmployes: async () => {
    set({ isLoading: true, error: null });
    try {
      const employees = await employeesService.getAll();
      // Convert backend Employee format to frontend Employe format
      const employes: Employe[] = employees.map((emp: any) => ({
        id: String(emp.id),
        prenom: emp.prenom || '',
        nom: emp.nom || '',
        role: emp.role === 'CHAUFFEUR' ? 'CHAUFFEUR' : emp.role === 'SUPERVISEUR' ? 'SUPERVISEUR' : 'EBOUEUR',
        telephone: String(emp.telephone || ''),
        email: emp.mail || emp.email,
        adresse: emp.adresse,
        dateEmbauche: emp.dateEmbauche,
        disponible: emp.disponible ?? true,
      }));
      set({ employes, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch employees', 
        isLoading: false 
      });
    }
  },
  
  addEmploye: async (employe) => {
    set({ isLoading: true, error: null });
    
    // Validate required fields
    if (!employe.nom || !employe.prenom) {
      set({ 
        error: 'Nom and prenom are required', 
        isLoading: false 
      });
      throw new Error('Nom and prenom are required');
    }
    
    // Convert frontend Employe format to backend Utilisateur format
    // Note: id must be 0 (backend will assign the actual ID)
    // Note: disponible is not in Utilisateur base class, only in Employee subclass
    const backendEmployee = {
      id: 0, // Required field - backend will set the actual ID
      mail: employe.email || `${employe.prenom.toLowerCase()}.${employe.nom.toLowerCase()}@wastemanagement.com`,
      nom: employe.nom.trim(),
      prenom: employe.prenom.trim(),
      telephone: employe.telephone ? parseInt(employe.telephone.replace(/\D/g, '')) || 0 : 0,
      role: employe.role === 'CHAUFFEUR' ? 'CHAUFFEUR' : employe.role === 'SUPERVISEUR' ? 'SUPERVISEUR' : 'EMPLOYE',
      // Don't send disponible - it's not in Utilisateur, only in Employee subclass
      // The backend will handle it if needed
    };
    
    // Ensure telephone is not 0 (required field)
    if (backendEmployee.telephone === 0) {
      backendEmployee.telephone = 1000000000; // Default placeholder
    }
    
    // Ensure mail is not empty (required field)
    if (!backendEmployee.mail || backendEmployee.mail.trim() === '') {
      backendEmployee.mail = `${backendEmployee.prenom.toLowerCase()}.${backendEmployee.nom.toLowerCase()}@wastemanagement.com`;
    }
    
    try {
      console.log('Sending employee data to backend:', backendEmployee);
      const created = await employeesService.create(backendEmployee);
      console.log('Employee created successfully:', created);
      
      // Convert backend response back to frontend format and update store
      const frontendEmploye: Employe = {
        id: String(created.id),
        prenom: created.prenom || '',
        nom: created.nom || '',
        role: created.role === 'CHAUFFEUR' ? 'CHAUFFEUR' : created.role === 'SUPERVISEUR' ? 'SUPERVISEUR' : 'EBOUEUR',
        telephone: String(created.telephone || ''),
        email: created.mail || employe.email,
        adresse: employe.adresse,
        dateEmbauche: employe.dateEmbauche,
        disponible: (created as any).disponible ?? employe.disponible ?? true,
      };
      
      set(state => ({ 
        employes: [...state.employes, frontendEmploye],
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Failed to create employee:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Request data that failed:', backendEmployee);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to create employee';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },
  
  updateEmploye: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const existing = get().employes.find(e => e.id === id);
      if (!existing) {
        throw new Error('Employee not found');
      }
      
      const updated = { ...existing, ...updates };
      
      // Validate required fields
      if (!updated.nom || !updated.prenom) {
        throw new Error('Nom and prenom are required');
      }
      
      // Convert to backend format
      const backendEmployee = {
        id: Number(id), // Use the existing ID for updates
        mail: updated.email || `${updated.prenom.toLowerCase()}.${updated.nom.toLowerCase()}@wastemanagement.com`,
        nom: updated.nom.trim(),
        prenom: updated.prenom.trim(),
        telephone: updated.telephone ? parseInt(updated.telephone.replace(/\D/g, '')) || 0 : 0,
        role: updated.role === 'CHAUFFEUR' ? 'CHAUFFEUR' : updated.role === 'SUPERVISEUR' ? 'SUPERVISEUR' : 'EMPLOYE',
        // Don't send disponible - it's not in Utilisateur base class
      };
      
      // Ensure telephone is not 0 (required field)
      if (backendEmployee.telephone === 0) {
        backendEmployee.telephone = 1000000000; // Default placeholder
      }
      
      // Ensure mail is not empty (required field)
      if (!backendEmployee.mail || backendEmployee.mail.trim() === '') {
        backendEmployee.mail = `${backendEmployee.prenom.toLowerCase()}.${backendEmployee.nom.toLowerCase()}@wastemanagement.com`;
      }
      
      const result = await employeesService.update(Number(id), backendEmployee);
      
      // Convert back to frontend format
      const frontendEmploye: Employe = {
        id: String(result.id),
        prenom: result.prenom || '',
        nom: result.nom || '',
        role: result.role === 'CHAUFFEUR' ? 'CHAUFFEUR' : result.role === 'SUPERVISEUR' ? 'SUPERVISEUR' : 'EBOUEUR',
        telephone: String(result.telephone || ''),
        email: result.mail || updated.email,
        adresse: updated.adresse,
        dateEmbauche: updated.dateEmbauche,
        disponible: (result as any).disponible ?? updated.disponible ?? true,
      };
      
      set(state => ({
        employes: state.employes.map(e => e.id === id ? frontendEmploye : e),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Failed to update employee:', error);
      set({ 
        error: error.response?.data?.error || 'Failed to update employee', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  removeEmploye: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await employeesService.delete(Number(id));
      set(state => ({
        employes: state.employes.filter(e => e.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Failed to delete employee:', error);
      set({ 
        error: error.response?.data?.error || 'Failed to delete employee', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  exportEmployesXML: () => {
    const { employes } = get();
    const xml = generateEmployesXML(employes);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employes.xml';
    a.click();
    URL.revokeObjectURL(url);
  },
  
  importEmployesXML: (xmlString: string) => {
    try {
      const parsed = parseEmployesXML(xmlString);
      set({ employes: parsed });
    } catch (error) {
      console.error('Failed to parse employees XML:', error);
      set({ error: 'Failed to import employees XML' });
    }
  },
  
  // Vehicles Actions
  fetchVehicules: async () => {
    set({ isLoading: true, error: null });
    try {
      const vehicles = await vehiclesService.getAll();
      // Convert backend Vehicule format to frontend Vehicule format
      const vehicules: Vehicule[] = vehicles.map((v: any) => {
        const typeValue = v.typeVehicule || v.type || '';
        return {
          id: v.id,
          immatriculation: v.immatriculation || '',
          typeVehicule: typeValue,
          type: typeValue, // Alias for compatibility
          capacite: v.capacite || 0,
          disponibilite: v.disponibilite ?? true,
          statut: v.statut || v.etat || 'DISPONIBLE',
          etat: v.etat || v.statut || 'DISPONIBLE',
          conducteur: v.conducteur,
        };
      });
      set({ vehicules, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch vehicles', 
        isLoading: false 
      });
    }
  },
  
  addVehicule: async (vehicule) => {
    set({ isLoading: true, error: null });
    try {
      // Validate required fields
      if (!vehicule.typeVehicule && !vehicule.type) {
        throw new Error('Type de véhicule is required');
      }
      if (!vehicule.capacite || vehicule.capacite <= 0) {
        throw new Error('Capacité must be greater than 0');
      }
      
      // Convert frontend format to backend format
      const backendVehicle = {
        id: 0, // Required field - backend will set the actual ID
        typeVehicule: vehicule.typeVehicule || vehicule.type || '',
        capacite: vehicule.capacite || 0,
        disponibilite: vehicule.disponibilite ?? true,
        immatriculation: vehicule.immatriculation || '',
        statut: vehicule.statut || vehicule.etat || 'DISPONIBLE',
        etat: vehicule.etat || vehicule.statut || 'DISPONIBLE',
        conducteur: vehicule.conducteur || null, // Optional field
      };
      
      console.log('Sending vehicle data to backend:', backendVehicle);
      const created = await vehiclesService.create(backendVehicle);
      console.log('Vehicle created successfully:', created);
      
      // Convert backend response back to frontend format
      const frontendVehicule: Vehicule = {
        id: created.id,
        immatriculation: created.immatriculation || '',
        typeVehicule: created.typeVehicule || '',
        type: created.typeVehicule || '', // Alias
        capacite: created.capacite || 0,
        disponibilite: created.disponibilite ?? true,
        statut: created.statut || created.etat || 'DISPONIBLE',
        etat: created.etat || created.statut || 'DISPONIBLE',
        conducteur: created.conducteur,
      };
      
      set(state => ({ 
        vehicules: [...state.vehicules, frontendVehicule],
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Failed to create vehicle:', error);
      set({ 
        error: error.response?.data?.error || 'Failed to create vehicle', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  updateVehicule: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const existing = get().vehicules.find(v => String(v.id) === String(id));
      if (!existing) {
        throw new Error('Vehicle not found');
      }
      
      const updated = { ...existing, ...updates };
      
      // Convert to backend format
      const backendVehicle = {
        typeVehicule: updated.typeVehicule || updated.type || '',
        capacite: updated.capacite || 0,
        disponibilite: updated.disponibilite ?? true,
        immatriculation: updated.immatriculation || '',
        statut: updated.statut || updated.etat || 'DISPONIBLE',
        etat: updated.etat || updated.statut || 'DISPONIBLE',
        conducteur: updated.conducteur || null,
      };
      
      const result = await vehiclesService.update(Number(id), backendVehicle);
      
      // Convert back to frontend format
      const frontendVehicule: Vehicule = {
        id: result.id,
        immatriculation: result.immatriculation || '',
        typeVehicule: result.typeVehicule || '',
        type: result.typeVehicule || '', // Alias
        capacite: result.capacite || 0,
        disponibilite: result.disponibilite ?? true,
        statut: result.statut || result.etat || 'DISPONIBLE',
        etat: result.etat || result.statut || 'DISPONIBLE',
        conducteur: result.conducteur,
      };
      
      set(state => ({
        vehicules: state.vehicules.map(v => 
          String(v.id) === String(id) ? frontendVehicule : v
        ),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Failed to update vehicle:', error);
      set({ 
        error: error.response?.data?.error || 'Failed to update vehicle', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  removeVehicule: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await vehiclesService.delete(Number(id));
      set(state => ({
        vehicules: state.vehicules.filter(v => String(v.id) !== String(id)),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Failed to delete vehicle:', error);
      set({ 
        error: error.response?.data?.error || 'Failed to delete vehicle', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  exportVehiculesXML: () => {
    const { vehicules } = get();
    const xml = generateVehiculesXML(vehicules);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vehicules.xml';
    a.click();
    URL.revokeObjectURL(url);
  },
  
  // Tournees Actions
  fetchTournees: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('[WasteStore] Fetching tournees from /api/routes...');
      const response = await api.get('/routes');
      const backendTournees = response.data || [];
      
      // Transform backend format to frontend format
      const tournees = backendTournees.map((t: any) => ({
        id: String(t.id),
        date: t.datePlanifiee ? new Date(t.datePlanifiee).toISOString().split('T')[0] : '',
        heureDebut: t.heureDebut || '',
        heureFin: t.heureFin || '',
        vehiculeId: t.vehicle ? String(t.vehicle.id) : '',
        employeIds: t.employe ? [String(t.employe.id)] : [],
        pointsCollecteIds: t.pointsCollecte ? t.pointsCollecte.map((p: any) => String(p.id)) : [],
        statut: t.statut || 'PLANIFIEE',
        distanceKm: t.distanceKm || 0,
      }));
      
      console.log('[WasteStore] Tournees fetched successfully:', tournees);
      set({ tournees, isLoading: false });
    } catch (error: any) {
      console.error('[WasteStore] Fetch Tournees API Error:', error);
      set({ 
        error: error.response?.data?.error || error.message || 'Failed to fetch tournees', 
        isLoading: false 
      });
    }
  },
  
  addTournee: async (tournee) => {
    // Get current state to access vehicules and employes
    const state = get();
    
    // Find the vehicle and employee objects
    const vehicle = state.vehicules.find(v => String(v.id) === String(tournee.vehiculeId));
    const firstEmployeeId = tournee.employeIds && tournee.employeIds.length > 0 ? tournee.employeIds[0] : null;
    const employee = firstEmployeeId ? state.employes.find(e => String(e.id) === String(firstEmployeeId)) : null;
    const points = state.points.filter(p => {
      const pointIdStr = String(p.id);
      const pointIdNum = p.id;
      return tournee.pointsCollecteIds && (
        tournee.pointsCollecteIds.includes(pointIdStr) || 
        tournee.pointsCollecteIds.includes(pointIdNum)
      );
    });
    
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    // Transform frontend format to backend format
    const backendTournee = {
      id: 0, // Backend will assign
      datePlanifiee: tournee.date ? new Date(tournee.date).toISOString() : new Date().toISOString(),
      statut: tournee.statut || 'PLANIFIEE',
      employe: {
        id: Number(employee.id),
        nom: employee.nom,
        prenom: employee.prenom,
      },
      vehicle: {
        id: Number(vehicle.id),
        immatriculation: vehicle.immatriculation || '',
      },
      pointsCollecte: points.map(p => ({
        id: p.id,
        localisation: p.localisation,
      })),
      heureDebut: tournee.heureDebut || '',
      heureFin: tournee.heureFin || '',
      distanceKm: tournee.distanceKm || 0,
    };
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticTournee = { ...tournee, id: tempId };
    set(state => ({ 
      tournees: [...state.tournees, optimisticTournee], 
      isLoading: true 
    }));
    
    try {
      console.log('[WasteStore] Creating tournee:', backendTournee);
      const response = await api.post('/routes', backendTournee);
      const createdBackendTournee = response.data;
      console.log('[WasteStore] Tournee created successfully:', createdBackendTournee);
      
      // Transform backend response to frontend format
      const createdTournee = {
        id: String(createdBackendTournee.id),
        date: createdBackendTournee.datePlanifiee ? new Date(createdBackendTournee.datePlanifiee).toISOString().split('T')[0] : tournee.date,
        heureDebut: createdBackendTournee.heureDebut || tournee.heureDebut,
        heureFin: createdBackendTournee.heureFin || tournee.heureFin,
        vehiculeId: createdBackendTournee.vehicle ? String(createdBackendTournee.vehicle.id) : tournee.vehiculeId,
        employeIds: createdBackendTournee.employe ? [String(createdBackendTournee.employe.id)] : tournee.employeIds,
        pointsCollecteIds: createdBackendTournee.pointsCollecte ? createdBackendTournee.pointsCollecte.map((p: any) => String(p.id)) : tournee.pointsCollecteIds,
        statut: createdBackendTournee.statut || tournee.statut,
        distanceKm: createdBackendTournee.distanceKm || tournee.distanceKm,
      };
      
      // Replace optimistic update with actual response
      set(state => ({ 
        tournees: state.tournees.map(t => t.id === tempId ? createdTournee : t), 
        isLoading: false 
      }));
    } catch (error: any) {
      console.error('[WasteStore] Create Tournee API Error:', error);
      // Rollback optimistic update
      set(state => ({ 
        tournees: state.tournees.filter(t => t.id !== tempId),
        error: error.response?.data?.error || error.message || 'Failed to create tournee', 
        isLoading: false 
      }));
      throw error;
    }
  },

  updateTourneeStatut: async (id, statut) => {
    set({ isLoading: true, error: null });
    try {
      const state = get();
      const existing = state.tournees.find(t => String(t.id) === String(id));
      if (!existing) {
        throw new Error('Tournee not found');
      }

      // Resolve related objects
      const vehicule = state.vehicules.find(v => String(v.id) === String(existing.vehiculeId));
      const employeId = (existing.employeIds || [])[0];
      const employe = employeId ? state.employes.find(e => String(e.id) === String(employeId)) : null;
      const pointsCollecte = state.points
        .filter(p => existing.pointsCollecteIds?.includes(String(p.id)))
        .map(p => ({
          id: p.id,
          localisation: p.localisation,
        }));

      const backendTournee = {
        id: Number(id),
        datePlanifiee: existing.date ? new Date(existing.date).toISOString() : new Date().toISOString(),
        statut: statut,
        employe: employe
          ? {
              id: Number(employe.id),
              nom: employe.nom,
              prenom: employe.prenom,
            }
          : null,
        vehicle: vehicule
          ? {
              id: Number(vehicule.id),
              immatriculation: vehicule.immatriculation || '',
            }
          : null,
        pointsCollecte: pointsCollecte,
        heureDebut: existing.heureDebut || '',
        heureFin: existing.heureFin || '',
        distanceKm: existing.distanceKm || 0,
      };

      const response = await api.put(`/routes/${id}`, backendTournee);
      const updated = response.data || {};
      set(state => ({
        tournees: state.tournees.map(t =>
          String(t.id) === String(id)
            ? {
                ...t,
                statut: updated.statut || statut,
                heureDebut: updated.heureDebut || t.heureDebut,
                heureFin: updated.heureFin || t.heureFin,
                employeIds: updated.employe ? [String(updated.employe.id)] : t.employeIds,
                pointsCollecteIds: updated.pointsCollecte ? updated.pointsCollecte.map((p: any) => String(p.id)) : t.pointsCollecteIds,
              }
            : t
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('[WasteStore] Update Tournee Statut Error:', error);
      set({
        error: error.response?.data?.error || error.message || 'Failed to update tournee statut',
        isLoading: false,
      });
      throw error;
    }
  },
}));