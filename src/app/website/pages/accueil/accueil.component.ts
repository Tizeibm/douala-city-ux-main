import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EntrepriseService } from '../../../core/services/entreprises.service';
import { AnnonceService } from '../../../features/annonces/annonces/services/annonce.service';
import { Entreprise } from '../../../shared/models/entreprise';
import { Annonce } from '../../../features/annonces/annonces/models/annonce';

@Component({
  selector: 'app-accueil',
  standalone: false,
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.scss'
})
export class AccueilComponent implements OnInit {
  searchQuery: string = '';
  searchZone: string = '';
  
  featuredStructures: Entreprise[] = [];
  recentAnnonces: Annonce[] = [];
  loading = true;

  constructor(
    private router: Router,
    private entrepriseService: EntrepriseService,
    private annonceService: AnnonceService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    // Fetch 4 featured structures
    this.entrepriseService.getStructures(0, 4).subscribe({
      next: (res) => {
        this.featuredStructures = res.content || [];
      },
      error: (err: any) => console.error('Error fetching structures', err)
    });

    // Fetch 3 recent announcements
    this.annonceService.getAnnonces(0, 3).subscribe({
      next: (res) => {
        this.recentAnnonces = res.content || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching annonces', err);
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.router.navigate(['/resultats'], {
      queryParams: {
        q: this.searchQuery,
        zone: this.searchZone
      }
    });
  }

  onViewStructure(structure: Entreprise) {
    this.router.navigate(['/structdet', structure.id]);
  }
}
