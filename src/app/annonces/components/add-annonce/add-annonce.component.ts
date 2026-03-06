import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Annonce, AnnonceType } from '../../models/annonce';
import { AnnonceService } from '../../services/annonce.service';
import { AuthService } from '../../../auth.service';
import { Entreprise } from '../../../entreprise';
import { FeedbackService } from '../../../shared/feedback.service';
import { EntrepriseService } from '../../../services/entreprises.service';
import { Photo } from '../../../entreprise';

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

    userStructures: any[] = [];
    selectedStructureId: string | null = null;

    pendingPhotos: File[] = [];
    photoPreviews: string[] = [];

    constructor(
        private annonceService: AnnonceService,
        private authService: AuthService,
        private feedback: FeedbackService,
        private entrepriseService: EntrepriseService,
        private router: Router
    ) { }

    ngOnInit(): void {
        const user = this.authService.getUser();
        if (user && user.id) {
            this.userId = user.id;
            this.loadUserStructures();
        } else {
            this.feedback.error('Vous devez être connecté pour créer une annonce');
            this.router.navigate(['/login']);
        }
    }

    loadUserStructures() {
        // Use getMesEntreprises() as identified in EntrepriseService
        this.entrepriseService.getMesEntreprises().subscribe({
            next: (structs: Entreprise[]) => {
                this.userStructures = structs;
            },
            error: (err: any) => console.error('Erreur chargement structures', err)
        });
    }

    onFileSelected(event: any) {
        const files = event.target.files;
        if (files) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                this.pendingPhotos.push(file);

                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.photoPreviews.push(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }
    }

    removePhoto(index: number) {
        this.pendingPhotos.splice(index, 1);
        this.photoPreviews.splice(index, 1);
    }

    onSubmit() {
        if (!this.userId) return;
        if (!this.annonce.description) {
            this.feedback.error('Veuillez saisir une description');
            return;
        }

        this.loading = true;
        this.feedback.showLoader();

        const createObs = this.selectedStructureId
            ? this.annonceService.createAnnonceByStructure(this.selectedStructureId, this.annonce)
            : this.annonceService.createAnnonce(this.annonce);

        createObs.subscribe({
            next: (res) => {
                if (this.pendingPhotos.length > 0 && res.id) {
                    this.uploadPhotos(res.id);
                } else {
                    this.onSuccess();
                }
            },
            error: (err) => {
                this.loading = false;
                this.feedback.hideLoader();
                this.feedback.error('Erreur lors de la création de l\'annonce');
            }
        });
    }

    uploadPhotos(annonceId: string) {
        let uploadCount = 0;
        const total = this.pendingPhotos.length;
        const token = localStorage.getItem('token');

        this.pendingPhotos.forEach(file => {
            this.entrepriseService.savePhoto(file, token, annonceId).subscribe({
                next: () => {
                    uploadCount++;
                    if (uploadCount === total) {
                        this.onSuccess();
                    }
                },
                error: (err) => {
                    console.error('Erreur upload photo', err);
                    uploadCount++;
                    if (uploadCount === total) {
                        this.onSuccess(); // Still finish even if some fail, or handle better
                    }
                }
            });
        });
    }

    onSuccess() {
        this.loading = false;
        this.feedback.hideLoader();
        this.feedback.success('Annonce créée avec succès !');
        this.router.navigate(['/annonces']);
    }

    onCancel() {
        this.router.navigate(['/annonces']);
    }
}
