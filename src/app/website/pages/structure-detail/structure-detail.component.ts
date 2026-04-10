import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Entreprise } from '../../../shared/models/entreprise';
import { EntreprisesService } from '../../../admin/services/entreprises.service';
import { EntrepriseService } from '../../../core/services/entreprises.service';
import { AvisService } from '../../../features/avis/services/avis.service';
import { Avis } from '../../../features/avis/models/avis';
import { LocalisationStateService } from '../../../core/services/localisation.service';
import { ServService } from '../../../core/services/serv.service';
import { HorairesService } from '../../../core/services/horaires.service';
import { PhotosService } from '../../../core/services/photos.service';
import { CookieConsentService } from '../../../shared/services/cookie-consent.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-structure-detail',
  standalone: false,
  templateUrl: './structure-detail.component.html',
  styleUrls: ['./structure-detail.component.scss']
})
export class StructureDetailComponent implements OnInit {
  structure!: Entreprise;
  moyenneAvis = 0;
  totalAvis = 0;
  avis: Avis[] = [];
  showAvisDrawer = false;
  apiUrl = environment.apiUrl;
  mode: 'public' | 'owner' | 'admin' = 'public';
  selectedImageUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entrepriseService: EntreprisesService,
    private coreEntrepriseService: EntrepriseService,
    private avisService: AvisService,
    private localisationStateService: LocalisationStateService,
    private servService: ServService,
    private horairesService: HorairesService,
    private photosService: PhotosService,
    private cookieConsentService: CookieConsentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.mode = this.route.snapshot.data['mode'] || 'public';
    if (!id) return;

    this.entrepriseService.getEntreprisesById(null, id).subscribe({
      next: (struct) => {
        this.structure = struct;
        const visitorHash = this.cookieConsentService.getVisitorHash() || undefined;
        this.coreEntrepriseService.recordView(struct.id!, undefined, visitorHash).subscribe();
        this.loadAvisStats(id);

        if (this.mode !== 'public') {
          this.entrepriseService.setEntreprise(struct);
          // Sync plural/singular for components
          if (struct.localisations && !struct.localisation) struct.localisation = struct.localisations;
          if (struct.localisation && !struct.localisations) struct.localisations = struct.localisation;
          
          this.localisationStateService.setLocalisations(struct.localisations || []);
          this.servService.setServices(struct.services || []);
          this.photosService.setphotos(struct.photos || []);
          this.horairesService.setHoraires(struct.horaires || []);
        }

        this.avisService.avisAdded$.subscribe(() => this.loadAvisStats(id));
      },
      error: (err: any) => console.error('[StructureDetail] Error:', err)
    });
  }

  loadAvisStats(structureId: string) {
    this.avisService.getAvisByStructure(structureId).subscribe({
      next: (data: any) => {
        this.avis = data;
        this.totalAvis = data.length;
        if (this.totalAvis > 0) {
          const sum = data.reduce((acc: any, curr: any) => acc + curr.note, 0);
          this.moyenneAvis = parseFloat((sum / this.totalAvis).toFixed(1));
        }
      }
    });
  }

  donnerAvis(): void {
    this.showAvisDrawer = true;
  }

  isAvisDirty = false;
  
  onAvisDirty(isDirty: boolean) {
    this.isAvisDirty = isDirty;
  }

  closeAvisDrawer() {
    if (this.isAvisDirty) {
      if (confirm("Vous avez un avis en cours de rédaction. Voulez-vous vraiment annuler ?")) {
        this.showAvisDrawer = false;
        this.isAvisDirty = false;
      }
    } else {
      this.showAvisDrawer = false;
    }
  }

  scrollTo(sectionId: string) {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToReviews() {
    this.scrollTo('reviews');
  }

  share() {
    if (isPlatformBrowser(this.platformId)) {
      if (navigator.share) {
        navigator.share({
          title: this.structure.nom,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Lien copié !');
      }
    }
  }

  onActionClick(type: string, url: string, target: string = '_self', event?: Event) {
    if (event) event.preventDefault();
    const visitorHash = this.cookieConsentService.getVisitorHash() || undefined;
    const userId = this.authService.getUtilisateurId() || undefined;

    this.coreEntrepriseService.recordContactClick(this.structure.id!, type, visitorHash, userId, url).subscribe({
      next: () => this.navigateAction(url, target),
      error: () => this.navigateAction(url, target)
    });
  }

  private navigateAction(url: string, target: string) {
    if (isPlatformBrowser(this.platformId)) {
      if (target === '_blank') window.open(url, '_blank');
      else window.location.href = url;
    }
  }

  goToEdit(): void {
    const prefix = this.mode === 'admin' ? '/admin/structures' : '/dashboard-user/structures';
    this.router.navigate([`${prefix}/${this.structure.id}/modifier`]);
  }

  getHeroImageUrl(): string {
    if (!this.structure?.photoPrincipal) return '/assets/images/placeholder.jpg';
    if (this.structure.photoPrincipal.startsWith('http')) return this.structure.photoPrincipal;
    // If it's a UUID (new system)
    if (this.structure.photoPrincipal.length > 20) {
      return `${this.apiUrl}/photos/public/${this.structure.photoPrincipal}/image`;
    }
    // Fallback for old system or direct filename
    return `http://localhost:8080/${this.structure.photoPrincipal}`;
  }

  getPhotoUrl(photo: any): string {
    if (!photo?.id) return '/assets/images/placeholder.jpg';
    return `${environment.apiUrl}/photos/public/${photo.id}/thumbnail`;
  }

  getFullPhotoUrl(photo: any): string {
    if (!photo?.id) return '/assets/images/placeholder.jpg';
    return `${environment.apiUrl}/photos/public/${photo.id}/image`;
  }

  openImage(url: string) {
    this.selectedImageUrl = url;
  }

  closeImage() {
    this.selectedImageUrl = null;
  }

  get otherPhotos(): any[] {
    if (!this.structure?.photos) return [];
    if (!this.structure?.photoPrincipal) return this.structure.photos;
    
    // Filter out the principal photo so it doesn't appear twice (once in hero, once in gallery)
    return this.structure.photos.filter(p => p.id !== this.structure.photoPrincipal);
  }
}
