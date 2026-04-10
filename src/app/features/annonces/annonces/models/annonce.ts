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
    type: AnnonceType | string;
    description: string;
    creationDate?: string;       // Backend field name (AnnonceReponse)
    structureId?: string;
    user?: any;
    photos?: any[];

    /** @deprecated Frontend-only display field — NOT persisted by backend. Derive from type/description. */
    titre?: string;
    /** @deprecated Use creationDate instead */
    dateCreation?: string;
}
