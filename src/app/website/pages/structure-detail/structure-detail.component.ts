import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Entreprise } from '../../../entreprise';
import { EntreprisesService } from '../../../admin/services/entreprises.service';
import { AvisService } from '../../../avis/services/avis.service';
import { Avis } from '../../../avis/models/avis';
import { LocalisationStateService } from '../../../admin/localisation.service';
import { ServService } from '../../../admin/serv.service';
import { HorairesService } from '../../../admin/horaires.service';
import { PhotosService } from '../../../admin/photos.service';
import { CookieConsentService } from '../../../shared/services/cookie-consent.service';
import { AuthService } from '../../../auth.service';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entrepriseService: EntreprisesService,
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
        this.entrepriseService.recordView(struct.id!, undefined, visitorHash).subscribe();
        this.loadAvisStats(id);

        if (this.mode !== 'public') {
          this.entrepriseService.setEntreprise(struct);
          this.localisationStateService.setLocalisations(struct.localisation || []);
          this.servService.setServices(struct.services || []);
          this.photosService.setphotos(struct.photos || []);
          this.horairesService.setHoraires(struct.horaires || []);
        }

        this.avisService.avisAdded$.subscribe(() => this.loadAvisStats(id));
      },
      error: (err) => console.error('[StructureDetail] Error:', err)
    });
  }

  loadAvisStats(structureId: string) {
    this.avisService.getAvisByStructure(structureId).subscribe({
      next: (data) => {
        this.avis = data;
        this.totalAvis = data.length;
        if (this.totalAvis > 0) {
          const sum = data.reduce((acc, curr) => acc + curr.note, 0);
          this.moyenneAvis = parseFloat((sum / this.totalAvis).toFixed(1));
        }
      }
    });
  }

  donnerAvis(): void {
    this.showAvisDrawer = true;
  }

  closeAvisDrawer() {
    this.showAvisDrawer = false;
  }

  scrollToReviews() {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
    }
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

    this.entrepriseService.recordContactClick(this.structure.id!, type, visitorHash, userId, url).subscribe({
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

  getPhotoUrl(photo: any): string {
    if (!photo?.id) return '/assets/images/placeholder.jpg';
    return `${environment.apiUrl}/photos/public/${photo.id}/thumbnail`;
  }
}
