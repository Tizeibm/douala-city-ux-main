import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Entreprise } from '../../../entreprise';

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

    getMoyenneAvis(): number {
        return 4.2; // Placeholder for now or calculate if data available
    }

    getTotalAvis(): number {
        return 12; // Placeholder
    }

    getTodayHoraire(): string {
        if (!this.structure.horaires || this.structure.horaires.length === 0) return 'Non renseigné';
        // Simplified for now, getting the first one or finding today
        const h = this.structure.horaires[0];
        const open = h.heureOuverture || h.heureDeDebut || '';
        const close = h.heureFermeture || h.heureDeFin || '';
        return open && close ? `${open} — ${close}` : 'Non renseigné';
    }

    onView() {
        this.view.emit(this.structure);
    }
}
