import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Entreprise, Localisation } from '../../../shared/models/entreprise';
import { EntrepriseService } from '../../../core/services/entreprises.service';
import { HapticService } from '../../../core/services/haptic.service';
import { CategoriesService, CategorieConfig } from '../../../core/services/categories.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-category-listing',
    standalone: false,
    templateUrl: './category-listing.component.html',
    styleUrl: './category-listing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryListingComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    currentPage = 1;
    itemsPerPage = 12;
    totalPages = 0;
    totalItems = 0;
    loading: boolean = false;

    filters = {
        nom: '',
        categorie: '',
        sousCategorie: '',
        quartier: ''
    };

    openNowOnly = false;
    sortBy: 'pertinence' | 'note' | 'recent' = 'pertinence';

    categoryConfig: CategorieConfig | null = null;



    allStructures: Entreprise[] = [];
    filteredStructures: Entreprise[] = [];

    viewMode: 'list' | 'map' = 'list';

    constructor(
        private entrepriseService: EntrepriseService,
        private router: Router,
        private route: ActivatedRoute,
        private haptic: HapticService,
        private categoriesService: CategoriesService
    ) {}

    ngOnInit(): void {
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
            const catKey = params['category'];
            const config = this.categoriesService.getCategorieConfigParCle(catKey);
            if (config) {
                this.categoryConfig = config;
                this.filters.categorie = config.nom;
                this.reset();
                this.loadStructures();
            } else {
                this.router.navigate(['/accueil']);
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadStructures() {
        if (!this.categoryConfig) return;

        this.loading = true;
        this.entrepriseService.getByCategorie(this.categoryConfig.nom, this.currentPage - 1, this.itemsPerPage).subscribe({
            next: (data: any) => {
                this.allStructures = data.content || data;
                this.totalItems = data.totalElements || this.allStructures.length;
                this.totalPages = data.totalPages || Math.ceil(this.allStructures.length / this.itemsPerPage);
                this.filteredStructures = this.allStructures;
                this.loading = false;
                this.applyFilters();
            },
            error: (err: Error) => {
                console.error(`Erreur lors du chargement de la catégorie ${this.categoryConfig?.nom}`, err);
                this.loading = false;
            }
        });
    }

    applyFilters(): void {
        this.haptic.tap();
        let results = this.allStructures.filter(s => {
            return (
                s.nom.toLowerCase().includes(this.filters.nom.toLowerCase()) &&
                (this.filters.categorie ? s.categorieNom === this.filters.categorie : true) &&
                (this.filters.sousCategorie ? s.sousCategorie === this.filters.sousCategorie : true) &&
                (this.filters.quartier ? s.localisation ? s.localisation.some((l: Localisation) => l.quartier?.toLowerCase().includes(this.filters.quartier.toLowerCase())) : false : true)
            );
        });

        // Open Now filter
        if (this.openNowOnly) {
            results = results.filter(s => this.isStructureOpenNow(s));
        }

        // Sort
        if (this.sortBy === 'note') {
            results.sort((a, b) => (b.noteMoyenne || 0) - (a.noteMoyenne || 0));
        } else if (this.sortBy === 'recent') {
            results.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
        }

        this.filteredStructures = results;
        this.entrepriseService.setEntreprises(this.filteredStructures);
        this.totalPages = this.filteredStructures.length ? Math.ceil(this.filteredStructures.length / this.itemsPerPage) : 0;
        this.currentPage = 1;
        this.entrepriseService.setPage(this.currentPage);
        this.updatePaginatedStructures();
        this.loading = false;
    }

    toggleOpenNow(): void {
        this.openNowOnly = !this.openNowOnly;
        this.applyFilters();
    }

    onSortChange(sort: 'pertinence' | 'note' | 'recent'): void {
        this.sortBy = sort;
        this.applyFilters();
    }

    private isStructureOpenNow(s: Entreprise): boolean {
        if (!s.horaires || s.horaires.length === 0) return false;
        const now = new Date();
        const days = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
        const todayName = days[now.getDay()];
        const todayHoraire = s.horaires.find(h => h.jourSemaine?.toUpperCase() === todayName);
        if (!todayHoraire || !todayHoraire.heureDeDebut || !todayHoraire.heureDeFin) return false;
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [startH, startM] = todayHoraire.heureDeDebut.split(':').map(Number);
        const [endH, endM] = todayHoraire.heureDeFin.split(':').map(Number);
        return currentMinutes >= (startH * 60 + startM) && currentMinutes <= (endH * 60 + endM);
    }

    filterBySubCategorie(subCat: string): void {
        this.filters.sousCategorie = subCat;
        this.applyFilters();
    }

    updatePaginatedStructures(): void {
        this.entrepriseService.page$.pipe(takeUntil(this.destroy$)).subscribe((page: number) => {
            this.currentPage = page || 1;
        });
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.entrepriseService.ent$.pipe(takeUntil(this.destroy$)).subscribe((data: Entreprise[]) => {
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
