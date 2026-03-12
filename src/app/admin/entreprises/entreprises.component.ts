import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { EntreprisesService } from '../services/entreprises.service';
import { Entreprise } from '../../shared/models/entreprise';
import { Router } from '@angular/router';
import { HapticService } from '../../core/services/haptic.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-entreprises',
  standalone: false,
  templateUrl: './entreprises.component.html',
  styleUrl: './entreprises.component.scss'
})
export class EntreprisesComponent implements OnInit {

  private token: string | null = null;
  entreprises: Entreprise[] = [];
  loading = true;
  search: string = '';
  filtered: Entreprise[] = [];
  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 0;

  constructor(
    private entrepriseService: EntreprisesService,
    private router: Router,
    private haptic: HapticService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.token = localStorage.getItem('token');
    }
    this.loadEntreprises();
  }

  loadEntreprises() {
    this.loading = true;
    this.entrepriseService.getAllEntreprisesValid().subscribe({
      next: (data: any) => {
        // Handle both direct array and paginated object (API likely returns Page object)
        this.entreprises = data.content || data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des entreprises', err);
        this.loading = false;
      }
    });
  }

  get filteredStructures(): Entreprise[] {
    const searchFiltered = this.entreprises.filter(s =>
      s.nom.toLowerCase().includes(this.search.toLowerCase())
    );
    this.totalPages = Math.ceil(searchFiltered.length / this.itemsPerPage);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filtered = searchFiltered.slice(startIndex, endIndex);
    return this.filtered;
  }

  updatePaginatedStructures(): void {
    // Handled by the getter
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  valider(id: string) {
    this.entrepriseService.validerEntreprise(id).subscribe(() => {
      this.loadEntreprises();
    });
  }

  rejeter(id: string) {
    this.entrepriseService.rejeterEntreprise(id).subscribe(() => {
      this.loadEntreprises();
    });
  }

  consulter(structure: Entreprise): void {
    this.haptic.navigation();
    this.router.navigate(['/admin/structures', structure.id]);
  }
}
