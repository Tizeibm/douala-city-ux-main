import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Entreprise } from '../../entreprise';
import { EntreprisesService } from '../../admin/services/entreprises.service';
import { FeedbackService } from '../../shared/feedback.service';
import { LocalisationStateService } from '../../admin/localisation.service';
import { ServService } from '../../admin/serv.service';
import { HorairesService } from '../../admin/horaires.service';
import { PhotosService } from '../../admin/photos.service';

@Component({
    selector: 'app-structure-edit-page',
    standalone: false,
    templateUrl: './structure-edit-page.component.html',
    styleUrl: './structure-edit-page.component.scss'
})
export class StructureEditPageComponent implements OnInit {
    structure: Entreprise | null = null;
    loading = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private entrepriseService: EntreprisesService,
        private feedback: FeedbackService,
        private localisationState: LocalisationStateService,
        private servState: ServService,
        private horState: HorairesService,
        private photoState: PhotosService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadStructure(id);
        } else {
            this.feedback.error('ID de structure manquant');
            this.router.navigate(['/dashboard-user/structures']);
        }
    }

    loadStructure(id: string): void {
        this.loading = true;
        this.entrepriseService.getEntreprisesById(null, id).subscribe({
            next: (struct) => {
                this.structure = struct;
                // Populate state services for the child edit component
                this.entrepriseService.setEntreprise(struct);
                this.localisationState.setLocalisations(struct.localisation || []);
                this.servState.setServices(struct.services || []);
                this.photoState.setphotos(struct.photos || []);
                this.horState.setHoraires(struct.horaires || []);
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading structure:', err);
                this.feedback.error('Erreur lors du chargement de la structure');
                this.loading = false;
                this.router.navigate(['/dashboard-user/structures']);
            }
        });
    }

    onStructureUpdated(updated: Entreprise): void {
        this.feedback.success('Structure mise à jour avec succès');
        this.router.navigate(['/dashboard-user/structures']);
    }

    onCancel(): void {
        this.router.navigate(['/dashboard-user/structures']);
    }
}
