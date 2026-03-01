export interface ReponseAvis {
    id?: string; // UUID
    contenu: string;
    visible?: boolean;
    dateCreation?: string | Date;
    typeRepondant?: 'USER' | 'STRUCTURE' | 'ADMIN';

    // Helper fields
    avisId?: string;
    auteur?: string; // UI name or UUID
}
