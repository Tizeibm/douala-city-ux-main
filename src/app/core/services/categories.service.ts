import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface CategorieConfig {
  nom: string;
  titre: string;
  icone: string;
  sousCategories: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private apiUrl = `${environment.apiUrl}/categories/public`;

  private categories: CategorieConfig[] = [
    {
      nom: 'Commerce',
      titre: 'Commerces',
      icone: 'fas fa-shopping-bag',
      sousCategories: ['Alimentation', 'Vêtements', 'Électronique', 'Meubles', 'Livres', 'Tous', 'Autres']
    },
    {
      nom: 'Restauration',
      titre: 'Restauration',
      icone: 'fas fa-utensils',
      sousCategories: ['Restaurant', 'Café', 'Fast-food', 'Boulangerie']
    },
    {
      nom: 'Santé',
      titre: 'Santé & Bien-être',
      icone: 'fas fa-heartbeat',
      sousCategories: ['Pharmacie', 'Clinique', 'Hôpital', 'Laboratoire']
    },
    {
      nom: 'Education',
      titre: 'Écoles & Universités',
      icone: 'fas fa-graduation-cap',
      sousCategories: ['École', 'Université', 'Centre de formation']
    },
    {
      nom: 'Hébergement',
      titre: 'Hébergement',
      icone: 'fas fa-bed',
      sousCategories: ['Hôtel', 'Auberge', "Chambre d'hôtes", 'Camping']
    },
    {
      nom: 'Loisirs',
      titre: 'Loisirs & Divertissement',
      icone: 'fas fa-smile',
      sousCategories: ['Cinéma', 'Salle de sport', "Parc d'attractions", 'Musée', 'Autres']
    },
    {
      nom: 'Transport',
      titre: 'Transport',
      icone: 'fas fa-bus',
      sousCategories: ['Agence de voyage', 'Location de voitures', 'Taxi', 'Transport en commun']
    },
    {
      nom: 'Services',
      titre: 'Services de Proximité',
      icone: 'fas fa-tools',
      sousCategories: ['Coiffure', 'Mécanique', 'Plomberie', 'Électricité', 'Nettoyage', 'Informatique']
    },
    {
      nom: 'Institutions',
      titre: 'Institutions & Services Publics',
      icone: 'fas fa-landmark',
      sousCategories: ['Mairie', 'Poste', 'Commissariat', 'Sapeurs-pompiers', 'Préfecture']
    },
    {
      nom: 'Autres',
      titre: 'Autres',
      icone: 'fas fa-ellipsis-h',
      sousCategories: ['Autre']
    }
  ];

  constructor(private http: HttpClient) {
    this.loadCategoriesFromBackend();
  }

  private loadCategoriesFromBackend(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (backendCategories) => {
        // Group backend categories
        const backendMap = new Map<string, string[]>();
        backendCategories.forEach(cat => {
          if (!backendMap.has(cat.nom)) {
            backendMap.set(cat.nom, []);
          }
          if (cat.sousCategorie && !backendMap.get(cat.nom)?.includes(cat.sousCategorie)) {
            backendMap.get(cat.nom)?.push(cat.sousCategorie);
          }
        });

        // Merge with existing
        backendMap.forEach((sousCats, nom) => {
          const existing = this.categories.find(c => c.nom.toLowerCase() === nom.toLowerCase());
          if (existing) {
            sousCats.forEach(sc => {
              if (!existing.sousCategories.includes(sc)) {
                existing.sousCategories.push(sc);
              }
            });
          } else {
            this.categories.push({
              nom: nom,
              titre: nom,
              icone: 'fas fa-tag', // Default icon
              sousCategories: sousCats
            });
          }
        });
      },
      error: (err) => console.error('Erreur chargement des catégories', err)
    });
  }

  getCategories(): CategorieConfig[] {
    return this.categories;
  }

  getNomsCategories(): string[] {
    return this.categories.map(c => c.nom);
  }

  getSousCategories(categorieNom: string): string[] {
    const cat = this.categories.find(c => c.nom === categorieNom);
    return cat ? cat.sousCategories : [];
  }

  getCategorieConfig(nom: string): CategorieConfig | undefined {
    return this.categories.find(c => c.nom.toLowerCase() === nom.toLowerCase());
  }

  // Mapping par clé URL (pour les routes /categories/:key)
  getCategorieConfigParCle(cle: string): CategorieConfig | undefined {
    const mapping: { [key: string]: string } = {
      'education': 'Education',
      'sante': 'Santé',
      'loisirs': 'Loisirs',
      'restauration': 'Restauration',
      'commerces': 'Commerce',
      'transport': 'Transport',
      'hebergement': 'Hébergement',
      'institutions': 'Institutions',
      'services': 'Services',
      'autres': 'Autres'
    };
    const mappedNom = mapping[cle.toLowerCase()];
    if (mappedNom) return this.getCategorieConfig(mappedNom);
    // If not mapped, maybe it's a direct dynamic category
    return this.getCategorieConfig(cle);
  }
}
