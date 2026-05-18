import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Entreprise } from '../../../shared/models/entreprise';
import { environment } from '../../../../environments/environment';
import { FavorisService } from '../../../core/services/favoris.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-structure-card',
    standalone: false,
    templateUrl: './structure-card.component.html',
    styleUrl: './structure-card.component.scss'
})
export class StructureCardComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    @Input() structure!: Entreprise;
    @Input() showActions: boolean = false;
    @Output() view = new EventEmitter<Entreprise>();

    apiUrl = environment.apiUrl;
    estFavori = false;
    estConnecte = false;
    favoriEnCours = false;

    constructor(
        private favorisService: FavorisService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.authService.estConnecte$.pipe(takeUntil(this.destroy$)).subscribe(c => {
            this.estConnecte = c;
        });

        this.favorisService.favorisIds$.pipe(takeUntil(this.destroy$)).subscribe(ids => {
            if (this.structure?.id) {
                this.estFavori = ids.has(this.structure.id);
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    toggleFavori(event: Event): void {
        event.stopPropagation();
        if (!this.estConnecte || !this.structure.id || this.favoriEnCours) return;

        this.favoriEnCours = true;
        // Optimistic update
        this.estFavori = !this.estFavori;

        this.favorisService.toggleFavori(this.structure.id).subscribe({
            complete: () => { this.favoriEnCours = false; },
            error: () => {
                this.estFavori = !this.estFavori; // Rollback
                this.favoriEnCours = false;
            }
        });
    }

    getPhotoPrincipalUrl(): string {
        if (!this.structure.photoPrincipal) return '';
        if (this.structure.photoPrincipal.length > 20) {
            return `${this.apiUrl}/photos/public/${this.structure.photoPrincipal}/image`;
        }
        return `http://localhost:8080/${this.structure.photoPrincipal}`;
    }

    getMoyenneAvis(): number {
        return this.structure.noteMoyenne || 0;
    }

    getTotalAvis(): number {
        return this.structure.viewCount || 0;
    }

    getTodayHoraire(): string {
        if (!this.structure.horaires || this.structure.horaires.length === 0) return 'Non renseigné';

        const days = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
        const todayName = days[new Date().getDay()];

        const h = this.structure.horaires.find(hor => hor.jourSemaine === todayName) || this.structure.horaires[0];
        const open = h.heureDeDebut || '';
        const close = h.heureDeFin || '';
        return open && close ? `${open} — ${close}` : 'Non renseigné';
    }

    isOpenNow(): boolean {
        if (!this.structure.horaires || this.structure.horaires.length === 0) return false;

        const now = new Date();
        const days = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
        const todayName = days[now.getDay()];

        const h = this.structure.horaires.find(hor => hor.jourSemaine === todayName);
        if (!h) return false;

        const open = h.heureDeDebut;
        const close = h.heureDeFin;

        if (!open || !close) return false;

        const [h_open, m_open] = open.split(':').map(Number);
        const [h_close, m_close] = close.split(':').map(Number);

        const openDate = new Date(now);
        openDate.setHours(h_open, m_open, 0);

        const closeDate = new Date(now);
        closeDate.setHours(h_close, m_close, 0);

        return now >= openDate && now <= closeDate;
    }

    onView() {
        this.view.emit(this.structure);
    }
}
