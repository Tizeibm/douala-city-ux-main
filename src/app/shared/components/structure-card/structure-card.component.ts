import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Entreprise } from '../../../shared/models/entreprise';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-structure-card',
    standalone: false,
    templateUrl: './structure-card.component.html',
    styleUrl: './structure-card.component.scss'
})
export class StructureCardComponent {
    @Input() structure!: Entreprise;
    @Input() showActions: boolean = false;
    @Output() view = new EventEmitter<Entreprise>();

    apiUrl = environment.apiUrl;

    getPhotoPrincipalUrl(): string {
        if (!this.structure.photoPrincipal) return '';
        // If it's a UUID (new system)
        if (this.structure.photoPrincipal.length > 20) {
            return `${this.apiUrl}/photos/public/${this.structure.photoPrincipal}/image`;
        }
        // Fallback for old system or direct filename (if any still exist)
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
        
        // Find today's schedule
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
