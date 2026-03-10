
export interface Horaire {
  id?: string; // UUID
  jour?: string;
  heureOuverture?: string;
  heureFermeture?: string;

  // Legacy support
  jourSemaine?: string;
  heureDeDebut?: string;
  heureDeFin?: string;
}

export interface Categorie {
  id?: string; // UUID
  nom: string;
  sousCategorie: string;
}

export interface ServiceOffert {
  id?: string; // UUID
  nom: string;
  description: string;
  prix?: number;
}

export interface Localisation {
  id?: string; // UUID
  latitude: number;
  longitude: number;
  adresse?: string;

  // Legacy / Component support
  address?: string;
  quartier?: string;
  telephone?: string;
}

export interface Photo {
  id?: string; // UUID
  fileName?: string;
  storedFileName: string;
  contentType: string;
  uploadedAt?: string;
  filePath?: string;
  thumbnailPath?: string;
  originalFileName?: string;
  fileSize?: number;
  uploadDate?: string | Date;
}

export interface Entreprise {
  id?: string; // UUID
  nom: string;
  email: string;
  telephone?: string;
  website?: string;
  description?: string;
  address?: string;
  status?: 'EN_ATTENTE' | 'VALIDE' | 'REJETE' | 'ACTIF';
  categorieNom: string;
  sousCategorie: string;
  horaires?: Horaire[];
  services?: ServiceOffert[];
  photos?: Photo[];
  localisation?: Localisation[]; // Keeping plural for component compatibility
  user?: { id: string, nom: string, email: string };
  createdAt?: string;
  updatedAt?: string;

  // Frontend legacy fields
  photoPrincipal?: string;
  imageUrl?: string;
  noteMoyenne?: number;
  viewCount?: number;
  user_id?: string | null;
}
