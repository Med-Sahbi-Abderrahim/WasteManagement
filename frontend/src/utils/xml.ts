import { PointCollecte, Vehicule, Employe, Tournee, Signalement } from '../types/waste';

// -----------------------------
// Points de collecte
// -----------------------------
export const generatePointsXML = (points: PointCollecte[]): string => {
  const items = points.map(p => `
    <point>
      <id>${p.id}</id>
      <latitude>${p.latitude}</latitude>
      <longitude>${p.longitude}</longitude>
      <adresse>${p.localisation}</adresse>
      <type>${p.typeDechet}</type>
      <niveauRemplissage>${p.niveauRemplissage}</niveauRemplissage>
      <etat>${p.etatConteneur}</etat>
      <derniereCollecte>${p.dateDerniereCollecte || ''}</derniereCollecte>
      <capacite>${p.capacite || ''}</capacite>
      <modele>${p.modele || ''}</modele>
    </point>
  `).join('');

  return `<points>${items}</points>`;
};

export const parsePointsXML = (xmlString: string): PointCollecte[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  const nodes = Array.from(doc.getElementsByTagName('point'));

  return nodes.map(n => ({
    id: n.getElementsByTagName('id')[0]?.textContent || crypto.randomUUID(),
    latitude: parseFloat(n.getElementsByTagName('latitude')[0]?.textContent || '0'),
    longitude: parseFloat(n.getElementsByTagName('longitude')[0]?.textContent || '0'),
    adresse: n.getElementsByTagName('adresse')[0]?.textContent || '',
    type: (n.getElementsByTagName('type')[0]?.textContent || 'PLASTIQUE') as any,
    niveauRemplissage: parseInt(n.getElementsByTagName('niveauRemplissage')[0]?.textContent || '0', 10),
    etat: (n.getElementsByTagName('etat')[0]?.textContent || 'ACTIF') as any,
    derniereCollecte: n.getElementsByTagName('derniereCollecte')[0]?.textContent || undefined,
    capacite: n.getElementsByTagName('capacite')[0]?.textContent ? parseInt(n.getElementsByTagName('capacite')[0]?.textContent || '0', 10) : undefined,
    dateInstallation: n.getElementsByTagName('dateInstallation')[0]?.textContent || undefined,
    modele: n.getElementsByTagName('modele')[0]?.textContent || undefined,
  }));
};

// -----------------------------
// Vehicules
// -----------------------------
export const generateVehiculesXML = (vehicules: Vehicule[]): string => {
  const items = vehicules.map(v => `
    <vehicule>
      <id>${v.id}</id>
      <immatriculation>${v.immatriculation || ''}</immatriculation>
      <capacite>${v.capacite}</capacite>
      <type>${v.type || v.typeVehicule || ''}</type>
      <statut>${v.statut || v.etat || 'DISPONIBLE'}</statut>
    </vehicule>
  `).join('');
  return `<vehicules>${items}</vehicules>`;
};

export const parseVehiculesXML = (xmlString: string): Vehicule[] => {
  const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
  const nodes = Array.from(doc.getElementsByTagName('vehicule'));
  return nodes.map(n => {
    const typeValue = n.getElementsByTagName('type')[0]?.textContent || '';
    return {
      id: Number(n.getElementsByTagName('id')[0]?.textContent) || 0,
      immatriculation: n.getElementsByTagName('immatriculation')[0]?.textContent || '',
      capacite: parseInt(n.getElementsByTagName('capacite')[0]?.textContent || '0', 10),
      type: typeValue,
      typeVehicule: typeValue,
      statut: n.getElementsByTagName('statut')[0]?.textContent as any || 'DISPONIBLE',
      disponibilite: true,
    };
  });
};

// -----------------------------
// Employes
// -----------------------------
export const generateEmployesXML = (employes: Employe[]): string => {
  const items = employes.map(e => `
    <employe>
      <id>${e.id}</id>
      <nom>${e.nom}</nom>
      <prenom>${e.prenom}</prenom>
      <role>${e.role}</role>
      <disponible>${e.disponible}</disponible>
      <telephone>${e.telephone || ''}</telephone>
      <email>${e.email || ''}</email>
      <dateEmbauche>${e.dateEmbauche || ''}</dateEmbauche>
      <adresse>${e.adresse || ''}</adresse>
    </employe>
  `).join('');
  return `<employes>${items}</employes>`;
};

export const parseEmployesXML = (xmlString: string): Employe[] => {
  const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
  const nodes = Array.from(doc.getElementsByTagName('employe'));
  return nodes.map(n => ({
    id: n.getElementsByTagName('id')[0]?.textContent || crypto.randomUUID(),
    nom: n.getElementsByTagName('nom')[0]?.textContent || '',
    prenom: n.getElementsByTagName('prenom')[0]?.textContent || '',
    role: n.getElementsByTagName('role')[0]?.textContent as any || 'EBOUEUR',
    disponible: n.getElementsByTagName('disponible')[0]?.textContent === 'true',
    telephone: n.getElementsByTagName('telephone')[0]?.textContent || undefined,
    email: n.getElementsByTagName('email')[0]?.textContent || undefined,
    dateEmbauche: n.getElementsByTagName('dateEmbauche')[0]?.textContent || undefined,
    adresse: n.getElementsByTagName('adresse')[0]?.textContent || undefined,
  }));
};

// -----------------------------
// Signalements
// -----------------------------
export const generateSignalementsXML = (signalements: Signalement[]): string => {
  const items = signalements.map(s => `
    <signalement>
      <id>${s.id}</id>
      <date>${s.date}</date>
      <type>${s.type}</type>
      <message>${s.message}</message>
      <statut>${s.statut}</statut>
      <citoyenId>${s.citoyenId || ''}</citoyenId>
      <employeId>${s.employeId || ''}</employeId>
      <pointCollecteId>${s.pointCollecteId || ''}</pointCollecteId>
    </signalement>
  `).join('');
  return `<signalements>${items}</signalements>`;
};

export const parseSignalementsXML = (xmlString: string): Signalement[] => {
  const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
  const nodes = Array.from(doc.getElementsByTagName('signalement'));
  return nodes.map(n => ({
    id: n.getElementsByTagName('id')[0]?.textContent || crypto.randomUUID(),
    date: n.getElementsByTagName('date')[0]?.textContent || '',
    type: n.getElementsByTagName('type')[0]?.textContent || '',
    message: n.getElementsByTagName('message')[0]?.textContent || '',
    statut: n.getElementsByTagName('statut')[0]?.textContent as any || 'NOUVEAU',
    citoyenId: n.getElementsByTagName('citoyenId')[0]?.textContent || undefined,
    employeId: n.getElementsByTagName('employeId')[0]?.textContent || undefined,
    pointCollecteId: n.getElementsByTagName('pointCollecteId')[0]?.textContent || undefined,
  }));
};

// -----------------------------
// Tournées
// -----------------------------
export const generateTourneesXML = (tournees: Tournee[]): string => {
  const items = tournees.map(t => `
    <tournee>
      <id>${t.id}</id>
      <date>${t.date}</date>
      <vehiculeId>${t.vehiculeId}</vehiculeId>
      <employeIds>${t.employeIds.join(',')}</employeIds>
      <pointsCollecteIds>${t.pointsCollecteIds.join(',')}</pointsCollecteIds>
      <statut>${t.statut}</statut>
      <distanceKm>${t.distanceKm || ''}</distanceKm>
      <heureDebut>${t.heureDebut || ''}</heureDebut>
      <heureFin>${t.heureFin || ''}</heureFin>
    </tournee>
  `).join('');
  return `<tournees>${items}</tournees>`;
};

export const parseTourneesXML = (xmlString: string): Tournee[] => {
  const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
  const nodes = Array.from(doc.getElementsByTagName('tournee'));
  return nodes.map(n => ({
    id: n.getElementsByTagName('id')[0]?.textContent || crypto.randomUUID(),
    date: n.getElementsByTagName('date')[0]?.textContent || '',
    vehiculeId: n.getElementsByTagName('vehiculeId')[0]?.textContent || '',
    employeIds: n.getElementsByTagName('employeIds')[0]?.textContent?.split(',') || [],
    pointsCollecteIds: n.getElementsByTagName('pointsCollecteIds')[0]?.textContent?.split(',') || [],
    statut: n.getElementsByTagName('statut')[0]?.textContent as any || 'PLANIFIEE',
    distanceKm: n.getElementsByTagName('distanceKm')[0]?.textContent ? parseFloat(n.getElementsByTagName('distanceKm')[0]?.textContent || '0') : undefined,
    heureDebut: n.getElementsByTagName('heureDebut')[0]?.textContent || undefined,
    heureFin: n.getElementsByTagName('heureFin')[0]?.textContent || undefined,
  }));
};
