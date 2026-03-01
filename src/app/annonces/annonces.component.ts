import { Component, OnInit } from '@angular/core';
import { AnnonceService } from './services/annonce.service';
import { Annonce } from './models/annonce';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-annonces',
  standalone: false,
  templateUrl: './annonces.component.html',
  styleUrl: './annonces.component.scss'
})
export class AnnoncesComponent implements OnInit {
  annonces: Annonce[] = [];
  loading: boolean = true;
  isLoggedIn: boolean = false;

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
    this.annonceService.getAnnonces(0, 50).subscribe({
      next: (res) => {
        this.annonces = res.content || res; // Handle different API shapes
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching annonces', err);
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
      case 'AUTRES': return 'fa-ellipsis-h';
      default: return 'fa-bullhorn';
    }
  }
}
