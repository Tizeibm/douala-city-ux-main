import { AfterViewInit, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Entreprise, Horaire, Localisation } from '../../../shared/models/entreprise';
import { EntrepriseService } from '../../../core/services/entreprises.service';
import { Utilisateur } from '../../auth/registration/services/inscription.service';
import { environment } from '../../../../environments/environment';
import type * as Leaflet from 'leaflet';
import { isPlatformBrowser } from '@angular/common';
import { FeedbackService } from '../../../shared/feedback.service';

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
  styleUrl: './add-entreprise.component.scss'
})





export class AddEntrepriseComponent implements OnInit {
  currentStep = 1;
  user: any = {};
  token: string | null = null;
  structureId: string | null = null;
  uploadedPhotos: any[] = [];
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

  newService = { nom: '', description: '', prix: 0 };
  newHoraire: Horaire = { jourSemaine: 'LUNDI', heureDeDebut: '08:00', heureDeFin: '18:00' };
  newLocalisation: Localisation = { adresse: '', quartier: '', telephone: '', latitude: 4.0511, longitude: 9.7679 };

  categories: { nom: string; sousCategories: string[] }[] = [
    { nom: 'Commerce', sousCategories: ["Alimentation", "Vêtements", "Électronique", "Meubles", "Livres", "Tous", "autres"] },
    { nom: 'Autres', sousCategories: ["Autre"] },
    { nom: 'transport', sousCategories: ["Agence de voyage", "Location de voitures", "Taxi", "Transport en commun"] },
    { nom: 'Hébergement', sousCategories: ["Hôtel", "Auberge", "Chambre d'hôtes", "Camping"] },
    { nom: 'Loisirs', sousCategories: ["Cinéma", "Salle de sport", "Parc d'attractions", "Musée", "autres"] },
    { nom: 'Restauration', sousCategories: ["Restaurant", "Café", "Fast-food", "Boulangerie"] },
    { nom: 'Education', sousCategories: ["École", "Université", "Centre de formation"] },
    { nom: 'Santé', sousCategories: ["Pharmacie", "Clinique", "Hôpital", "Laboratoire"] },
    { nom: 'services', sousCategories: ["coiffure", "Mécanique", "Plomberie", "électricité", "nettoyage", "informatique"] },
    { nom: 'institutions', sousCategories: ["mairie", "poste", "commissariat", "Sapeurs-pompiers", "préfecture"] }
  ];

  joursSemaine = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];

  constructor(
    private entrepriseService: EntrepriseService,
    private feedback: FeedbackService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.user = JSON.parse(localStorage.getItem('utilisateur') || '{}');
      this.token = localStorage.getItem('token');
    }
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
    // Cycle to next day for convenience
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

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      // Create local preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.pendingPhotos.push({ file: file, url: e.target.result });
      };
      reader.readAsDataURL(file);
    }
    event.target.value = ''; // Reset input
  }

  getPhotoUrl(photo: any): string {
    return photo.url || `${environment.apiUrl}/photos/public/${photo.id}/image`;
  }

  removePhoto(photoId: string, index: number) {
    if (this.pendingPhotos[index]) {
       this.pendingPhotos.splice(index, 1);
       return;
    }
    // Logic for existing remote photos (if editing later)
  }

  finishStep5() {
    this.feedback.showLoader();

    // 1. Create Structure
    this.entrepriseService.ajouterEntreprise(this.entreprise).subscribe({
      next: (res) => {
        const id = res.id as string;
        this.structureId = id;
        
        // Prepare Batches
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

        import('rxjs').then(({ forkJoin, of, from }) => {
          import('rxjs/operators').then(({ concatMap }) => {
            
            const reqHoraires = mappedHoraires.length > 0 ? this.entrepriseService.saveHorairesBatch(mappedHoraires, id) : of(null);
            const reqServices = services.length > 0 ? this.entrepriseService.saveServicesBatch(services, id) : of(null);
            const reqLocs = mappedLocalisations.length > 0 ? this.entrepriseService.saveLocalisationsBatch(mappedLocalisations, id) : of(null);

            forkJoin([reqHoraires, reqServices, reqLocs]).subscribe({
              next: () => {
                // Upload pending photos sequentially if any
                if (this.pendingPhotos.length > 0) {
                   from(this.pendingPhotos).pipe(
                     concatMap(photo => this.entrepriseService.savePhoto(photo.file, this.token, id))
                   ).subscribe({
                     next: () => {},
                     error: () => console.error('Photo upload error'),
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
          });
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
