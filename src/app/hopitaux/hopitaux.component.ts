import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Entreprise } from '../entreprise';
import { EntrepriseService } from '../services/entreprises.service';
import { Router } from '@angular/router';
import { HapticService } from '../core/services/haptic.service';

@Component({
  selector: 'app-hopitaux',
  standalone: false,
  templateUrl: './hopitaux.component.html',
  styleUrl: './hopitaux.component.scss'
})
export class HopitauxComponent implements OnInit {

  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 0;
  totalItems = 0;
  loading: boolean = false;
  moyenneAvis = 3;
  totalAvis = 5;

  filters = {
    nom: '',
    categorie: 'Santé',
    sousCategorie: '',
    quartier: ''
  };

  categories: { nom: string; sousCategories: string[] }[] = [
    { nom: 'Santé', sousCategories: ["Pharmacie", "Clinique", "Hôpital", "Laboratoire"] }
  ];

  get currentSubCat(): string {
    return this.filters.sousCategorie;
  }

  getSousCategories(): string[] {
    const cat = this.categories.find(c => c.nom === 'Santé');
    return cat ? cat.sousCategories : [];
  }

  allStructures: Entreprise[] = [];
  filteredStructures: Entreprise[] = [];

  constructor(
    private entrepriseService: EntrepriseService,
    private router: Router,
    private haptic: HapticService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.loadStructures();
  }

  loadStructures() {
    this.loading = true;
    this.entrepriseService.getByCategorie('Santé', this.currentPage - 1, this.itemsPerPage).subscribe({
      next: data => {
        this.allStructures = data.content || data;
        this.totalItems = data.totalElements || this.allStructures.length;
        this.totalPages = data.totalPages || Math.ceil(this.allStructures.length / this.itemsPerPage);
        this.filteredStructures = this.allStructures;
        this.loading = false;
        this.applyFilters();
      },
      error: err => {
        console.error('Erreur lors du chargement des structures de santé', err);
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
    // Reset to first page after filtering
    this.updatePaginatedStructures();
    this.loading = false;
  }

  filterByCategorie(c: any): void {
    this.filters.sousCategorie = c;
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
    this.applyFilters();
  }
}
