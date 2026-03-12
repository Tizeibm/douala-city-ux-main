import { ReponseAvis } from "./reponse-avis";

export interface Avis {
    id?: string; // UUID
    note: number;
    commentaire: string;
    status?: 'EN_ATTENTE' | 'PUBLIE' | 'REJETE' | 'SIGNALE';
    anonyme?: boolean;
    dateCreation?: string | Date;
    reponses?: ReponseAvis[];

    // Request/Frontend helper fields
    structure?: string; // UUID for request
    auteur?: string;    // UUID for request

    // UI legacy fields
    date?: string;
}
