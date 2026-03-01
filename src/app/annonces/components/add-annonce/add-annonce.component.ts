import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Annonce, AnnonceType } from '../../models/annonce';
import { AnnonceService } from '../../services/annonce.service';
import { AuthService } from '../../../auth.service';
import { FeedbackService } from '../../../shared/feedback.service';

@Component({
    selector: 'app-add-annonce',
    standalone: false,
    templateUrl: './add-annonce.component.html',
    styleUrl: './add-annonce.component.scss'
})
export class AddAnnonceComponent implements OnInit {
    annonce: Annonce = {
        type: AnnonceType.PROMOTION,
        description: ''
    };

    annonceTypes = Object.values(AnnonceType);
    userId: string | null = null;
    loading: boolean = false;

    constructor(
        private annonceService: AnnonceService,
        private authService: AuthService,
        private feedback: FeedbackService,
        private router: Router
    ) { }

    ngOnInit(): void {
        const user = this.authService.getUser();
        if (user && user.id) {
            this.userId = user.id;
        } else {
            this.feedback.error('Vous devez être connecté pour créer une annonce');
            this.router.navigate(['/login']);
        }
    }

    onSubmit() {
        if (!this.userId) return;
        if (!this.annonce.description) {
            this.feedback.error('Veuillez saisir une description');
            return;
        }

        this.loading = true;
        this.feedback.showLoader();

        this.annonceService.createAnnonce(this.annonce, this.userId).subscribe({
            next: (res) => {
                this.loading = false;
                this.feedback.hideLoader();
                this.feedback.success('Annonce créée avec succès !');
                this.router.navigate(['/annonces']);
            },
            error: (err) => {
                this.loading = false;
                this.feedback.hideLoader();
                this.feedback.error('Erreur lors de la création de l\'annonce');
            }
        });
    }

    onCancel() {
        this.router.navigate(['/annonces']);
    }
}
