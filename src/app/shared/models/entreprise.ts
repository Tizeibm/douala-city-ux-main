
export interface Horaire {
  id?: string; // UUID
  jourSemaine?: string;      // Backend enum: LUNDI..DIMANCHE
  heureDeDebut?: string;     // LocalTime format "HH:mm:ss"
  heureDeFin?: string;       // LocalTime format "HH:mm:ss"
  ouvertWeekend?: boolean;   // From HoraireResponse
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
  originalFileName?: string;
  storedFileName: string;
  filePath?: string;
  fileSize?: number;
  contentType: string;
  uploadDate?: string | Date;
  thumbnailPath?: string;
  isPrincipal?: boolean;
  url?: string;              // Constructed URL for display

  // Legacy aliases (frontend-only)
  fileName?: string;
  uploadedAt?: string;
}

export interface Entreprise {
  id?: string; // UUID
  nom: string;
  email: string;
  telephone?: string;
  website?: string;
  description?: string;
  address?: string;
  status?: 'EN_ATTENTE' | 'VALIDE' | 'REFUSEE';
  categorieNom: string;
  sousCategorie: string;
  horaires?: Horaire[];
  services?: ServiceOffert[];
  photos?: Photo[];
  localisations?: Localisation[]; // Aligned with backend StructureResponse DTO
  localisation?: Localisation[];  // Backward compatibility alias
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
