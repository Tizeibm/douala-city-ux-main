import { ReponseAvis } from "./reponse-avis";

export interface Avis {
    id?: string; // UUID
    note: number;
    commentaire: string;
    status?: 'EN_ATTENTE' | 'PUBLIE' | 'REJETE' | 'SIGNALE';
    anonyme?: boolean;
    signalements?: number;          // From AvisStructureResponse
    dateCreation?: string | Date;
    dateModification?: string | Date; // From AvisStructureResponse
    reponses?: ReponseAvis[];

    // IDs from backend response
    structureId?: string;   // UUID — from AvisStructureResponse
    auteurId?: string;      // UUID — from AvisStructureResponse

    // Request/Frontend helper fields
    structure?: string; // UUID for request
    auteur?: string;    // Display name or UUID for request

    // UI legacy fields
    date?: string;
}
