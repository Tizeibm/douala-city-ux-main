import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnonceService } from '../annonces/services/annonce.service';
import { Annonce } from '../annonces/models/annonce';
import { HapticService } from '../core/services/haptic.service';
import { Location, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-annonce-details',
  standalone: false,
  templateUrl: './annonce-details.component.html',
  styleUrls: ['./annonce-details.component.scss']
})
export class AnnonceDetailsComponent implements OnInit {
  annonce: Annonce | null = null;
  loading: boolean = true;
  error: string | null = null;
  backendUrl = 'http://localhost:8080/api/annonce';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private annonceService: AnnonceService,
    private haptic: HapticService,
    private location: Location,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadAnnonceDetail(id);
      } else {
        this.error = "ID d'annonce invalide.";
        this.loading = false;
      }
    });
  }

  loadAnnonceDetail(id: string): void {
    this.loading = true;
    this.annonceService.getAnnonceById(id).subscribe({
      next: (data: Annonce) => {
        this.annonce = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur de chargement:', err);
        this.error = "Impossible de charger l'annonce. Elle a peut-être été supprimée.";
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.haptic.tap();
    this.location.back();
  }

  getAnnonceIcon(type?: string): string {
    if (!type) {
      return 'fas fa-bullhorn text-gray-500 bg-gray-100';
    }
    const t = type.toLowerCase();
    switch (t) {
      case 'evenement':
        return 'fas fa-calendar-alt text-purple-600 bg-purple-100';
      case 'promotion':
        return 'fas fa-tags text-rose-600 bg-rose-100';
      case 'emploi':
        return 'fas fa-briefcase text-blue-600 bg-blue-100';
      case 'immobilier':
        return 'fas fa-home text-emerald-600 bg-emerald-100';
      case 'vente':
        return 'fas fa-shopping-cart text-amber-600 bg-amber-100';
      case 'services':
        return 'fas fa-concierge-bell text-indigo-600 bg-indigo-100';
      default:
        return 'fas fa-bullhorn text-gray-600 bg-gray-100';
    }
  }

  share(): void {
    this.haptic.tap();
    if (isPlatformBrowser(this.platformId)) {
      if (navigator.share) {
        navigator.share({
          title: this.annonce?.titre || 'Annonce sur Douala City',
          text: this.annonce?.description || 'Découvrez cette annonce.',
          url: window.location.href
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Lien recopié !');
      }
    }
  }

  contactAuthor(): void {
    this.haptic.tap();
    // In a real app, this might open a mailto:, a chat, or reveal a phone number
    if (this.annonce?.user?.email) {
      window.location.href = `mailto:${this.annonce.user.email}?subject=Suite à votre annonce "${this.annonce.titre}" sur Douala City`;
    } else {
      alert("Les informations de contact ne sont pas disponibles pour le moment.");
    }
  }
}
