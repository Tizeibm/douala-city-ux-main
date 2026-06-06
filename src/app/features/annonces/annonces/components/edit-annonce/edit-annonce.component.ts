import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Annonce, AnnonceType } from '../../models/annonce';
import { AnnonceService } from '../../services/annonce.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { Entreprise } from '../../../../../shared/models/entreprise';
import { FeedbackService } from '../../../../../shared/feedback.service';
import { EntrepriseService } from '../../../../../core/services/entreprises.service';
import { environment } from '../../../../../../environments/environment';

@Component({
    selector: 'app-edit-annonce',
    standalone: false,
    templateUrl: './edit-annonce.component.html',
    styleUrl: '../add-annonce/add-annonce.component.scss' // Reuse style,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditAnnonceComponent implements OnInit {
    annonce: Annonce | null = null;
    id: string | null = null;

    annonceTypes = Object.values(AnnonceType);
    userId: string | null = null;
    loading: boolean = false;

    userStructures: any[] = [];
    selectedStructureId: string | null = null;

    pendingPhotos: File[] = [];
    photoPreviews: string[] = [];

    constructor(
        private route: ActivatedRoute,
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

            this.id = this.route.snapshot.paramMap.get('id');
            if (this.id) {
                this.loadAnnonce();
            } else {
                this.router.navigate(['/annonces']);
            }
        } else {
            this.feedback.error('Vous devez être connecté pour modifier une annonce');
            this.router.navigate(['/login']);
        }
    }

    loadAnnonce() {
        if (!this.id) return;
        this.annonceService.getAnnonceById(this.id).subscribe({
            next: (data: any) => {
                this.annonce = data;
                this.selectedStructureId = data.structureId || null;
                // Preload existing photos as previews if any
                if (data.photos && data.photos.length > 0) {
                    this.photoPreviews = data.photos.map((p: any) => `${environment.apiUrl}/photos/public/${p.id}/thumbnail`);
                }
            },
            error: (err: any) => {
                this.feedback.error('Erreur lors du chargement de l\'annonce');
                this.router.navigate(['/annonces']);
            }
        });
    }

    loadUserStructures() {
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
        // Only if it's one of the new photos (pendingPhotos)
        // If it's an existing photo, we might need a separate service call to delete it
        // For now, simpler: clear previews and just say only new ones can be removed/added here
        // Or handle more robustly. Let's start simple.
        this.photoPreviews.splice(index, 1);
        // If index is within pendingPhotos range
        const numExisting = (this.annonce?.photos?.length || 0);
        if (index >= numExisting) {
            this.pendingPhotos.splice(index - numExisting, 1);
        } else {
            // It was an existing photo. For full functionality, we'd call removePhoto API
            const photoId = this.annonce!.photos![index].id;
            const token = localStorage.getItem('token');
            this.entrepriseService.removePhoto(photoId, token, this.id!).subscribe({
                next: () => {
                    this.annonce!.photos!.splice(index, 1);
                    this.feedback.success('Photo supprimée');
                }
            });
        }
    }

    onSubmit() {
        if (!this.userId || !this.annonce || !this.id) return;
        if (!this.annonce.description) {
            this.feedback.error('Veuillez saisir une description');
            return;
        }

        this.loading = true;
        this.feedback.showLoader();

        // Update structure ID in model
        this.annonce.structureId = this.selectedStructureId || undefined;

        this.annonceService.updateAnnonce(this.annonce, this.id).subscribe({
            next: (res) => {
                if (this.pendingPhotos.length > 0) {
                    this.uploadPhotos(this.id!);
                } else {
                    this.onSuccess();
                }
            },
            error: (err: any) => {
                this.loading = false;
                this.feedback.hideLoader();
                this.feedback.error('Erreur lors de la mise à jour de l\'annonce');
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
                error: (err: any) => {
                    console.error('Erreur upload photo', err);
                    uploadCount++;
                    if (uploadCount === total) {
                        this.onSuccess();
                    }
                }
            });
        });
    }

    onSuccess() {
        this.loading = false;
        this.feedback.hideLoader();
        this.feedback.success('Annonce mise à jour avec succès !');
        this.router.navigate(['/annonces']);
    }

    onCancel() {
        this.router.navigate(['/annonces']);
    }
}
