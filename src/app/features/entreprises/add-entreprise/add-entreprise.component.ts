import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Entreprise, Horaire, Localisation, ServiceOffert, Photo } from '../../../shared/models/entreprise';
import { EntrepriseService } from '../../../core/services/entreprises.service';
import { Utilisateur } from '../../auth/registration/services/inscription.service';
import { environment } from '../../../../environments/environment';
import type * as Leaflet from 'leaflet';
import { FeedbackService } from '../../../shared/feedback.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { forkJoin, of, from } from 'rxjs';
import { concatMap } from 'rxjs/operators';

export enum jours {

  LUNDI = 'LUNDI',
  MARDI = 'MARDI',
  MERCREDI = 'MERCREDI',
  JEUDI = 'JEUDI',
  VENDREDI = 'VENDREDI',
  SAMEDI = 'SAMEDI',
  DIMANCHE = 'DIMANCHE'
}

@Component({
  selector: 'app-add-entreprise',
  standalone: false,
  templateUrl: './add-entreprise.component.html',
  styleUrl: './add-entreprise.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})





export class AddEntrepriseComponent implements OnInit {
  currentStep = 1;
  user: Utilisateur | null = null;
  token: string | null = null;
  structureId: string | null = null;
  uploadedPhotos: Photo[] = [];
  isUploading = false;

  entreprise: Entreprise = {
    nom: '',
    email: '',
    website: '',
    description: '',
    categorieNom: '',
    sousCategorie: '',
    services: [],
    horaires: [],
    localisation: []
  };

  newService: ServiceOffert = { nom: '', description: '', prix: 0 };
  newHoraire: Horaire = { jourSemaine: 'LUNDI', heureDeDebut: '08:00', heureDeFin: '18:00' };
  newLocalisation: Localisation = { adresse: '', quartier: '', telephone: '', latitude: 4.0511, longitude: 9.7679 };

  categories: { nom: string; sousCategories: string[] }[] = [];

  joursSemaine = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];

  constructor(
    private entrepriseService: EntrepriseService,
    private feedback: FeedbackService,
    private categoriesService: CategoriesService
  ) { }

  ngOnInit() {
    this.categories = this.categoriesService.getCategories().map(c => ({ nom: c.nom, sousCategories: c.sousCategories }));
    const stored = localStorage.getItem('utilisateur');
    this.user = stored ? JSON.parse(stored) : null;
    this.token = localStorage.getItem('token');
    this.resetEntreprise();
  }

  nextStep() {
    if (this.currentStep < 5) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  getSousCategories(): string[] {
    const cat = this.categories.find(c => c.nom === this.entreprise.categorieNom);
    return cat ? cat.sousCategories : [];
  }

  addService() {
    if (this.newService.nom) {
      this.entreprise.services?.push({ ...this.newService });
      this.newService = { nom: '', description: '', prix: 0 };
    }
  }

  removeService(index: number) {
    this.entreprise.services?.splice(index, 1);
  }

  addHoraire() {
    this.entreprise.horaires?.push({ ...this.newHoraire });
    // Passer au jour suivant pour plus de commodité
    const currentIndex = this.joursSemaine.indexOf(this.newHoraire.jourSemaine || 'LUNDI');
    if (currentIndex < 6) {
      this.newHoraire.jourSemaine = this.joursSemaine[currentIndex + 1];
    }
  }

  removeHoraire(index: number) {
    this.entreprise.horaires?.splice(index, 1);
  }

  addLocalisation() {
    if (this.newLocalisation.adresse || this.newLocalisation.quartier) {
      this.entreprise.localisation?.push({ ...this.newLocalisation });
      this.newLocalisation = { adresse: '', quartier: '', telephone: '', latitude: 4.0511, longitude: 9.7679 };
    }
  }

  removeLocalisation(index: number) {
    this.entreprise.localisation?.splice(index, 1);
  }

  onMapClick(coords: { latitude: number, longitude: number }) {
    this.newLocalisation.latitude = coords.latitude;
    this.newLocalisation.longitude = coords.longitude;
  }

  finishStep1() {
    this.currentStep = 2;
  }

  finishStep2() {
    this.currentStep = 3;
  }

  finishStep3() {
    this.currentStep = 4;
  }

  finishStep4() {
    if (this.newLocalisation.adresse || this.newLocalisation.quartier) {
      this.addLocalisation();
    }
    if (!this.entreprise.localisation || this.entreprise.localisation.length === 0) {
      this.feedback.error('Veuillez ajouter au moins une localisation');
      return;
    }
    this.currentStep = 5;
  }

  pendingPhotos: { file: File, url: string }[] = [];

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file: File | undefined = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.pendingPhotos.push({ file: file, url: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
    if (input) input.value = '';
  }

  getPhotoUrl(photo: { url?: string; id?: string }): string {
    return photo.url || `${environment.apiUrl}/photos/public/${photo.id}/image`;
  }

  removePhoto(photoId: string, index: number) {
    if (this.pendingPhotos[index]) {
       this.pendingPhotos.splice(index, 1);
       return;
    }
    // Logique pour les photos distantes existantes (si modification ultérieure)
  }

  finishStep5() {
    this.feedback.showLoader();

    // 1. Créer la structure
    this.entrepriseService.ajouterEntreprise(this.entreprise).subscribe({
      next: (res) => {
        const id = res.id as string;
        this.structureId = id;
        
        // Préparer les lots (batches)
        const horaires = this.entreprise.horaires || [];
        const mappedHoraires = horaires.map(h => {
          const debut = h.heureDeDebut || '08:00';
          const fin = h.heureDeFin || '18:00';
          return {
            jourSemaine: h.jourSemaine,
            heureDeDebut: debut.length <= 5 ? debut + ':00' : debut,
            heureDeFin: fin.length <= 5 ? fin + ':00' : fin,
            ouvertWeekend: h.jourSemaine === 'SAMEDI' || h.jourSemaine === 'DIMANCHE'
          };
        });

        const services = this.entreprise.services || [];
        
        const locs = this.entreprise.localisation || [];
        const mappedLocalisations = locs.map(loc => ({
          address: loc.adresse,
          quartier: loc.quartier,
          telephone: loc.telephone,
          latitude: loc.latitude,
          longitude: loc.longitude
        }));

        const reqHoraires = mappedHoraires.length > 0 ? this.entrepriseService.saveHorairesBatch(mappedHoraires, id) : of(null);
            const reqServices = services.length > 0 ? this.entrepriseService.saveServicesBatch(services, id) : of(null);
            const reqLocs = mappedLocalisations.length > 0 ? this.entrepriseService.saveLocalisationsBatch(mappedLocalisations, id) : of(null);

            forkJoin([reqHoraires, reqServices, reqLocs]).subscribe({
              next: () => {
                // Envoyer les photos en attente séquentiellement s'il y en a
                if (this.pendingPhotos.length > 0) {
                   from(this.pendingPhotos).pipe(
                     concatMap(photo => this.entrepriseService.savePhoto(photo.file, this.token, id))
                   ).subscribe({
                     next: () => {},
                     error: () => console.error('Erreur envoi photo'),
                     complete: () => {
                       this.feedback.hideLoader();
                       this.feedback.success('Structure créée avec succès !');
                       this.onBack();
                     }
                   });
                } else {
                   this.feedback.hideLoader();
                   this.feedback.success('Structure créée avec succès !');
                   this.onBack();
                }
              },
              error: () => {
                this.feedback.hideLoader();
                this.feedback.error('Structure créée, mais la sauvegarde des détails a échoué');
                this.onBack();
              }
            });

      },
      error: (err: any) => {
        this.feedback.hideLoader();
        this.feedback.error('Erreur lors de la création de la structure');
      }
    });
  }

  private resetEntreprise() {
    this.entreprise = {
      nom: '', email: '', website: '', description: '',
      categorieNom: '', sousCategorie: '', services: [], horaires: [],
      localisation: []
    };
    this.structureId = null;
    this.uploadedPhotos = [];
    this.currentStep = 1;
  }

  onBack() {
    window.history.back();
  }
}
