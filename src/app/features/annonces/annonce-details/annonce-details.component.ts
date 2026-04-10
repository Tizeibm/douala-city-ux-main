import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnonceService } from '../annonces/services/annonce.service';
import { Annonce } from '../annonces/models/annonce';
import { HapticService } from '../../../core/services/haptic.service';
import { Location, isPlatformBrowser } from '@angular/common';
import { EntrepriseService } from '../../../core/services/entreprises.service';
import { environment } from '../../../../environments/environment';
import { Title } from '@angular/platform-browser';

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
  backendUrl = `${environment.apiUrl}/annonce`;
  apiUrl = environment.apiUrl;

  // Lightbox
  selectedImageUrl: string | null = null;

  // Structure liée
  linkedStructure: any = null;
  loadingStructure: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private annonceService: AnnonceService,
    private entrepriseService: EntrepriseService,
    private haptic: HapticService,
    private location: Location,
    private titleService: Title,
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
        // Dynamic page title
        this.titleService.setTitle(
          `${data.titre || this.getTypeLabel(data.type)} — Douala-city`
        );
        if (!this.annonce.photos || this.annonce.photos.length === 0) {
          this.loadAnnoncePhotos(id);
        }
        // Load linked structure if applicable
        if (this.annonce.structureId) {
          this.loadLinkedStructure(this.annonce.structureId);
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur de chargement:', err);
        this.error = "Impossible de charger l'annonce. Elle a peut-être été supprimée.";
        this.loading = false;
      }
    });
  }

  loadAnnoncePhotos(id: string): void {
    this.annonceService.getAnnoncePhotos(id).subscribe({
      next: (photos) => {
        if (this.annonce) {
          this.annonce.photos = photos;
        }
      },
      error: (err) => console.error('Erreur chargement photos annonce:', err)
    });
  }

  loadLinkedStructure(structureId: string): void {
    this.loadingStructure = true;
    this.entrepriseService.getStructureById(null, structureId).subscribe({
      next: (struct) => {
        this.linkedStructure = struct;
        this.loadingStructure = false;
      },
      error: () => {
        this.loadingStructure = false;
      }
    });
  }

  goBack(): void {
    this.haptic.tap();
    this.location.back();
  }

  getAnnonceIcon(type?: string): string {
    if (!type) return 'fas fa-bullhorn';
    const t = type.toLowerCase();
    switch (t) {
      case 'evenement': return 'fas fa-calendar-star';
      case 'promotion': return 'fas fa-tags';
      case 'emploi': return 'fas fa-briefcase';
      case 'immobilier': return 'fas fa-home';
      case 'vente': return 'fas fa-shopping-cart';
      case 'services': return 'fas fa-concierge-bell';
      default: return 'fas fa-bullhorn';
    }
  }

  getTypeLabel(type?: string): string {
    if (!type) return 'Annonce';
    const t = type.toLowerCase();
    switch (t) {
      case 'evenement': return 'Événement';
      case 'promotion': return 'Promotion';
      case 'emploi': return 'Offre d\'emploi';
      case 'immobilier': return 'Immobilier';
      case 'vente': return 'Vente';
      case 'services': return 'Service';
      default: return 'Annonce';
    }
  }

  getHeroGradient(type?: string): string {
    if (!type) return 'linear-gradient(135deg, #64748b 0%, #334155 100%)';
    const t = type.toLowerCase();
    switch (t) {
      case 'evenement': return 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)';
      case 'promotion': return 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)';
      case 'emploi': return 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)';
      case 'immobilier': return 'linear-gradient(135deg, #059669 0%, #064e3b 100%)';
      case 'vente': return 'linear-gradient(135deg, #d97706 0%, #92400e 100%)';
      case 'services': return 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)';
      default: return 'linear-gradient(135deg, #64748b 0%, #334155 100%)';
    }
  }

  getHeroImageUrl(): string | null {
    if (this.annonce?.photos && this.annonce.photos.length > 0) {
      return `${this.apiUrl}/photos/public/${this.annonce.photos[0].id}/thumbnail`;
    }
    return null;
  }

  getPhotoUrl(photo: any): string {
    return `${this.apiUrl}/photos/public/${photo.id}/thumbnail`;
  }

  getFullPhotoUrl(photo: any): string {
    return `${this.apiUrl}/photos/public/${photo.id}`;
  }

  get otherPhotos(): any[] {
    if (!this.annonce?.photos || this.annonce.photos.length <= 1) return [];
    return this.annonce.photos.slice(1);
  }

  // Lightbox
  openImage(url: string): void {
    this.haptic.tap();
    this.selectedImageUrl = url;
  }

  closeImage(): void {
    this.selectedImageUrl = null;
  }

  openPhoto(photo: any): void {
    this.openImage(this.getFullPhotoUrl(photo));
  }

  // Navigation
  goToStructure(): void {
    if (this.annonce?.structureId) {
      this.haptic.tap();
      this.router.navigate(['/structdet', this.annonce.structureId]);
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
        alert('Lien copié !');
      }
    }
  }

  contactAuthor(): void {
    this.haptic.tap();
    if (!this.annonce) return;

    const user = this.annonce.user;
    const role = user?.role || 'USER';

    if (role === 'USER') {
      if (user?.telephone) {
        window.location.href = `tel:${user.telephone}`;
      } else if (user?.email) {
        window.location.href = `mailto:${user.email}?subject=Suite à votre annonce "${this.annonce.titre}"`;
      } else {
        alert("Aucun moyen de contact disponible pour cet auteur.");
      }
    } else {
      if (this.annonce.structureId) {
        this.loading = true;
        this.entrepriseService.getStructureById(null, this.annonce.structureId).subscribe({
          next: (struct) => {
            this.loading = false;
            const tel = struct.localisation?.[0]?.telephone || struct.telephone;
            if (tel) {
              window.location.href = `tel:${tel}`;
            } else if (struct.email) {
              window.location.href = `mailto:${struct.email}?subject=Suite à votre annonce "${this.annonce!.titre}"`;
            } else {
              alert("Aucun numéro de téléphone disponible pour cette structure.");
            }
          },
          error: (err: any) => {
            this.loading = false;
            console.error('Error fetching structure for contact:', err);
            if (user?.email) {
              window.location.href = `mailto:${user.email}?subject=Suite à votre annonce "${this.annonce!.titre}"`;
            } else {
              alert("Impossible de contacter l'auteur.");
            }
          }
        });
      } else if (user?.telephone) {
        window.location.href = `tel:${user.telephone}`;
      } else if (user?.email) {
        window.location.href = `mailto:${user.email}?subject=Suite à votre annonce "${this.annonce.titre}"`;
      } else {
        alert("Aucun moyen de contact disponible.");
      }
    }
  }
}
