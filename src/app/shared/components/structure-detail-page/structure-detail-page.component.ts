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
import { CookieConsentService } from '../../services/cookie-consent.service';
import { AuthService } from '../../../auth.service';

export type DetailMode = 'public' | 'owner' | 'admin';

@Component({
    selector: 'app-structure-detail-page',
    standalone: false,
    templateUrl: './structure-detail-page.component.html',
    styleUrls: ['./structure-detail-page.component.scss']
})
export class StructureDetailPageComponent implements OnInit {

    structure!: Entreprise;
    mode: DetailMode = 'public';
    editMode = false;

    moyenneAvis = 0;
    totalAvis = 0;
    avis: Avis[] = [];
    showAvisDrawer = false;

    backendUrl = 'http://localhost:8080/';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private entrepriseService: EntreprisesService,
        private avisService: AvisService,
        private localisationState: LocalisationStateService,
        private servState: ServService,
        private horState: HorairesService,
        private photoState: PhotosService,
        private cookieConsentService: CookieConsentService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        // Determine mode from route data
        this.mode = this.route.snapshot.data['mode'] || 'public';

        const id = this.route.snapshot.paramMap.get('id');
        if (!id) return;

        this.entrepriseService.getEntreprisesById(null, id).subscribe({
            next: (struct) => {
                this.structure = struct;

                // Record view
                const visitorHash = this.cookieConsentService.getVisitorHash() || undefined;
                this.entrepriseService.recordView(struct.id!, undefined, visitorHash).subscribe();

                // Load avis stats
                this.loadAvisStats(id);

                // For owner/admin: populate state services for child edit components
                if (this.mode !== 'public') {
                    this.entrepriseService.setEntreprise(struct);
                    this.localisationState.setLocalisations(struct.localisation || []);
                    this.servState.setServices(struct.services || []);
                    this.photoState.setphotos(struct.photos || []);
                    this.horState.setHoraires(struct.horaires || []);
                }
            },
            error: (err) => {
                console.error('[StructureDetailPage] Error fetching structure:', err);
            }
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
            },
            error: (err) => {
                console.error('[StructureDetailPage] Error fetching avis:', err);
            }
        });
    }

    // --- Actions ---
    onEdit() {
        this.editMode = !this.editMode;
    }

    onCancelEdit() {
        this.editMode = false;
    }

    onStructureUpdated(updated: Entreprise) {
        this.structure = updated;
        this.entrepriseService.setEntreprise(updated);
        this.localisationState.setLocalisations(updated.localisation || []);
        this.servState.setServices(updated.services || []);
        this.horState.setHoraires(updated.horaires || []);
        this.photoState.setphotos(updated.photos || []);
        this.editMode = false;
        this.cdr.detectChanges();
    }

    donnerAvis(): void {
        this.showAvisDrawer = true;
    }

    closeAvisDrawer() {
        this.showAvisDrawer = false;
    }

    consulterAvis(): void {
        this.router.navigate(['avisList'], { relativeTo: this.route });
    }

    scrollToReviews() {
        if (isPlatformBrowser(this.platformId)) {
            const el = document.getElementById('reviews');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    }

    share() {
        if (isPlatformBrowser(this.platformId)) {
            if (navigator.share) {
                navigator.share({
                    title: this.structure.nom,
                    text: `Découvrez ${this.structure.nom} sur Douala City`,
                    url: window.location.href
                }).catch(err => console.error('Error sharing', err));
            } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Lien copié dans le presse-papiers !');
            }
        }
    }

    onActionClick(type: string, url: string, target: string = '_self', event?: Event) {
        if (event) {
            event.preventDefault();
        }

        const visitorHash = this.cookieConsentService.getVisitorHash() || undefined;
        let userId: string | undefined = this.authService.getUtilisateurId();
        if (!userId) userId = undefined;

        this.entrepriseService.recordContactClick(this.structure.id!, type, visitorHash, userId, url).subscribe({
            next: () => this.navigateAction(url, target),
            // Navigate anyway if it fails so UX is not blocked
            error: (err: any) => {
                console.error('[StructureDetailPage] Tracking error', err);
                this.navigateAction(url, target);
            }
        });
    }

    private navigateAction(url: string, target: string) {
        if (isPlatformBrowser(this.platformId)) {
            if (target === '_blank') {
                window.open(url, '_blank');
            } else {
                window.location.href = url;
            }
        }
    }

    getPhotoUrl(photo: any): string {
        if (!photo) return '/assets/images/placeholder.jpg';

        // If it has an ID, use the public image endpoint according to OAS
        if (photo.id) return `http://localhost:8080/api/photos/public/${photo.id}/image`;

        // Fallbacks for local state/legacy
        if (photo.url) return photo.url;
        if (photo.filePath) return photo.filePath; // Might be base64 from reader
        if (photo.storedFileName) return this.backendUrl + 'uploads/' + photo.storedFileName;

        return '/assets/images/placeholder.jpg';
    }
}
