import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntrepriseService } from '../services/entreprises.service';
import { AnnonceService } from '../annonces/services/annonce.service';
import { Entreprise } from '../entreprise';
import { Annonce } from '../annonces/models/annonce';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-resultats',
  standalone: false,
  templateUrl: './resultats.component.html',
  styleUrl: './resultats.component.scss'
})
export class ResultatsComponent implements OnInit {
  searchQuery: string = '';
  searchZone: string = '';

  structures: Entreprise[] = [];
  annonces: Annonce[] = [];

  loading: boolean = true;
  totalFound: number = 0;

  constructor(
    private route: ActivatedRoute,
    private entrepriseService: EntrepriseService,
    private annonceService: AnnonceService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.searchZone = params['zone'] || '';
      this.performSearch();
    });
  }

  performSearch() {
    this.loading = true;

    // Combine searches for structures and announcements
    forkJoin({
      structures: this.entrepriseService.searchEntreprises(this.searchQuery, 0, 10),
      annonces: this.annonceService.searchAnnonces(this.searchQuery, 0, 5)
    }).subscribe({
      next: (res: any) => {
        this.structures = res.structures.content || res.structures;
        this.annonces = res.annonces.content || res.annonces;
        this.totalFound = (res.structures.totalElements || this.structures.length) +
          (res.annonces.totalElements || this.annonces.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('Search error', err);
        this.loading = false;
      }
    });
  }

  getAnnonceIcon(type: string): string {
    switch (type) {
      case 'VENTE': return 'fa-shopping-cart';
      case 'PROMOTION': return 'fa-tag';
      case 'IMMOBILIER': return 'fa-home';
      case 'EVENEMENT': return 'fa-calendar-alt';
      case 'SERVICES': return 'fa-concierge-bell';
      case 'EMPLOI': return 'fa-briefcase';
      default: return 'fa-bullhorn';
    }
  }
}
