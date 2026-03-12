import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Entreprise } from '../../../shared/models/entreprise';
import { EntrepriseService } from '../../../core/services/entreprises.service';
import { HapticService } from '../../../core/services/haptic.service';

interface CategoryConfig {
    name: string;
    title: string;
    icon: string;
    subCategories: string[];
}

@Component({
    selector: 'app-category-listing',
    standalone: false,
    templateUrl: './category-listing.component.html',
    styleUrl: './category-listing.component.scss'
})
export class CategoryListingComponent implements OnInit {

    currentPage = 1;
    itemsPerPage = 12;
    totalPages = 0;
    totalItems = 0;
    loading: boolean = false;
    isBrowser: boolean;

    filters = {
        nom: '',
        categorie: '',
        sousCategorie: '',
        quartier: ''
    };

    categoryConfig: CategoryConfig | null = null;

    configs: { [key: string]: CategoryConfig } = {
        'education': {
            name: 'Education',
            title: 'Écoles & Universités',
            icon: 'fas fa-graduation-cap',
            subCategories: ["École", "Université", "Centre de formation"]
        },
        'sante': {
            name: 'Santé',
            title: 'Santé & Bien-être',
            icon: 'fas fa-heartbeat',
            subCategories: ["Pharmacie", "Clinique", "Hôpital", "Laboratoire"]
        },
        'loisirs': {
            name: 'Loisirs',
            title: 'Loisirs & Divertissement',
            icon: 'fas fa-smile',
            subCategories: ["Cinéma", "Salle de sport", "Parc d'attractions", "Musée", "autres"]
        },
        'restauration': {
            name: 'Restauration',
            title: 'Restauration',
            icon: 'fas fa-utensils',
            subCategories: ["Restaurant", "Café", "Fast-food", "Boulangerie"]
        },
        'commerces': {
            name: 'Commerce',
            title: 'Commerces',
            icon: 'fas fa-shopping-bag',
            subCategories: ["Alimentation", "Vêtements", "Électronique", "Meubles", "Livres", "autres"]
        },
        'transport': {
            name: 'transport',
            title: 'Transport',
            icon: 'fas fa-bus',
            subCategories: ["Agence de voyage", "Location de voitures", "Taxi", "Transport en commun"]
        },
        'hebergement': {
            name: 'Hébergement',
            title: 'Hébergement',
            icon: 'fas fa-bed',
            subCategories: ["Hôtel", "Auberge", "Chambre d'hôtes", "Camping"]
        },
        'institutions': {
            name: 'institutions',
            title: 'Institutions & Services Publics',
            icon: 'fas fa-landmark',
            subCategories: ["mairie", "poste", "commissariat", "Sapeurs-pompiers", "préfecture"]
        },
        'services': {
            name: 'services',
            title: 'Services de Proximité',
            icon: 'fas fa-tools',
            subCategories: ["coiffure", "Mécanique", "Plomberie", "électricité", "nettoyage", "informatique"]
        }
    };

    allStructures: Entreprise[] = [];
    filteredStructures: Entreprise[] = [];

    constructor(
        private entrepriseService: EntrepriseService,
        private router: Router,
        private route: ActivatedRoute,
        private haptic: HapticService,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const catKey = params['category'];
            if (this.configs[catKey]) {
                this.categoryConfig = this.configs[catKey];
                this.filters.categorie = this.categoryConfig.name;
                this.reset();
                this.loadStructures();
            } else {
                // Fallback or redirect if category not found
                this.router.navigate(['/accueil']);
            }
        });
    }

    loadStructures() {
        if (!this.categoryConfig) return;

        this.loading = true;
        this.entrepriseService.getByCategorie(this.categoryConfig.name, this.currentPage - 1, this.itemsPerPage).subscribe({
            next: (data: any) => {
                this.allStructures = data.content || data;
                this.totalItems = data.totalElements || this.allStructures.length;
                this.totalPages = data.totalPages || Math.ceil(this.allStructures.length / this.itemsPerPage);
                this.filteredStructures = this.allStructures;
                this.loading = false;
                this.applyFilters();
            },
            error: (err: any) => {
                console.error(`Erreur lors du chargement de la catégorie ${this.categoryConfig?.name}`, err);
                this.loading = false;
            }
        });
    }

    applyFilters(): void {
        this.haptic.tap();
        this.filteredStructures = this.allStructures.filter(s => {
            return (
                s.nom.toLowerCase().includes(this.filters.nom.toLowerCase()) &&
                (this.filters.categorie ? s.categorieNom === this.filters.categorie : true) &&
                (this.filters.sousCategorie ? s.sousCategorie === this.filters.sousCategorie : true) &&
                (this.filters.quartier ? s.localisation ? s.localisation.some((l: any) => l.quartier?.toLowerCase().includes(this.filters.quartier.toLowerCase())) : false : true)
            );
        });

        this.entrepriseService.setEntreprises(this.filteredStructures);
        this.totalPages = this.filteredStructures.length ? Math.ceil(this.filteredStructures.length / this.itemsPerPage) : 0;
        this.currentPage = 1;
        this.entrepriseService.setPage(this.currentPage);
        this.updatePaginatedStructures();
        this.loading = false;
    }

    filterBySubCategorie(subCat: string): void {
        this.filters.sousCategorie = subCat;
        this.applyFilters();
    }

    updatePaginatedStructures(): void {
        this.entrepriseService.page$.subscribe((page: any) => {
            this.currentPage = page || 1;
        });
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.entrepriseService.ent$.subscribe((data: any) => {
            if (data) {
                this.filteredStructures = data;
                this.filteredStructures = this.filteredStructures.slice(startIndex, endIndex);
            }
        });
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.entrepriseService.setPage(this.currentPage);
            this.updatePaginatedStructures();
        }
    }

    previousPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.entrepriseService.setPage(this.currentPage);
            this.updatePaginatedStructures();
        }
    }

    consulter(structure: Entreprise): void {
        this.haptic.navigation();
        this.router.navigate(['structdet', structure.id]);
    }

    reset() {
        this.filters.sousCategorie = '';
        this.filters.nom = '';
        this.filters.quartier = '';
        if (this.allStructures.length > 0) {
            this.applyFilters();
        }
    }
}
