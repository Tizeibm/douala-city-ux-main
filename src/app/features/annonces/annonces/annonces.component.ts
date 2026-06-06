import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AnnonceService } from './services/annonce.service';
import { Annonce } from './models/annonce';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-annonces',
  standalone: false,
  templateUrl: './annonces.component.html',
  styleUrl: './annonces.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnoncesComponent implements OnInit {
  annonces: Annonce[] = [];
  allAnnonces: Annonce[] = [];
  loading: boolean = true;
  isLoggedIn: boolean = false;
  apiUrl = environment.apiUrl;

  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 0;
  totalItems = 0;
  activeTypeFilter = '';
  searchQuery = '';

  annonceTypes = ['VENTE', 'PROMOTION', 'IMMOBILIER', 'EVENEMENT', 'SERVICES', 'EMPLOI', 'AUTRES'];

  constructor(
    private annonceService: AnnonceService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadAnnonces();
  }

  loadAnnonces() {
    this.loading = true;
    this.annonceService.getAnnonces(0, 200).subscribe({
      next: (res) => {
        this.allAnnonces = res.content || res;
        this.totalItems = this.allAnnonces.length;
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching annonces', err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.allAnnonces];

    if (this.activeTypeFilter) {
      filtered = filtered.filter(a => a.type === this.activeTypeFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        (a.titre?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q))
      );
    }

    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);

    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.annonces = filtered.slice(start, start + this.itemsPerPage);
  }

  filterByType(type: string) {
    this.activeTypeFilter = this.activeTypeFilter === type ? '' : type;
    this.currentPage = 1;
    this.applyFilters();
  }

  onSearchChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  getAnnonceIcon(type: string): string {
    switch (type) {
      case 'VENTE': return 'fa-shopping-cart';
      case 'PROMOTION': return 'fa-tag';
      case 'IMMOBILIER': return 'fa-home';
      case 'EVENEMENT': return 'fa-calendar-alt';
      case 'SERVICES': return 'fa-concierge-bell';
      case 'EMPLOI': return 'fa-briefcase';
      case 'AUTRES': return 'fa-ellipsis-h';
      default: return 'fa-bullhorn';
    }
  }

  getPhotoUrl(photo: any): string {
    if (!photo?.id) return '';
    return `${this.apiUrl}/photos/public/${photo.id}/thumbnail`;
  }
}
