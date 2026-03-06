export enum AnnonceType {
    VENTE = 'VENTE',
    PROMOTION = 'PROMOTION',
    IMMOBILIER = 'IMMOBILIER',
    EVENEMENT = 'EVENEMENT',
    SERVICES = 'SERVICES',
    EMPLOI = 'EMPLOI',
    AUTRES = 'AUTRES'
}

export interface Annonce {
    id?: string;
    titre?: string;
    type: AnnonceType | string;
    description: string;
    dateCreation?: string;
    structureId?: string;
    user?: any;
    photos?: any[];
}
