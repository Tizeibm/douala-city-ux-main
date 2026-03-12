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
  newHoraire: Horaire = { jour: 'LUNDI', heureOuverture: '08:00', heureFermeture: '18:00' };
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
    const currentIndex = this.joursSemaine.indexOf(this.newHoraire.jour || 'LUNDI');
    if (currentIndex < 6) {
      this.newHoraire.jour = this.joursSemaine[currentIndex + 1];
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
    this.feedback.showLoader();
    this.entrepriseService.ajouterEntreprise(this.entreprise).subscribe({
      next: (res) => {
        this.structureId = res.id as string;
        this.feedback.hideLoader();
        this.currentStep = 2;
      },
      error: (err: any) => {
        this.feedback.hideLoader();
        this.feedback.error('Erreur lors de la création initiale de la structure');
      }
    });
  }

  finishStep2() {
    if (!this.structureId) return;
    this.feedback.showLoader();
    const horaires = this.entreprise.horaires || [];

    // Map to backend expected properties
    const mappedHoraires = horaires.map(h => ({
      jourSemaine: h.jour,
      heureDeDebut: h.heureOuverture + ':00', // Assuming time needs seconds in some standard cases or backend handles standard time, standard is "HH:mm". Testing showed time format might be strict. "08:00:00" might be needed if format is 'time', but format 'time' can be strict. I'll pass standard HH:mm:ss if it fails, but mostly backends parse HH:mm. Let's send what the UI produces (usually HH:mm) + ":00" to be safe since type is LocalTime.
      heureDeFin: h.heureFermeture + ':00',
      ouvertWeekend: h.jour === 'SAMEDI' || h.jour === 'DIMANCHE'
    }));

    this.entrepriseService.saveHorairesBatch(mappedHoraires, this.structureId).subscribe({
      next: () => {
        this.feedback.hideLoader();
        this.currentStep = 3;
      },
      error: () => {
        this.feedback.hideLoader();
        this.feedback.error('Erreur lors de l’enregistrement des horaires');
      }
    });
  }

  finishStep3() {
    if (!this.structureId) return;
    this.feedback.showLoader();
    const services = this.entreprise.services || [];
    this.entrepriseService.saveServicesBatch(services, this.structureId).subscribe({
      next: () => {
        this.feedback.hideLoader();
        this.currentStep = 4;
      },
      error: () => {
        this.feedback.hideLoader();
        this.feedback.error('Erreur lors de l’enregistrement des services');
      }
    });
  }

  finishStep4() {
    if (!this.structureId) return;
    // Add current pending localisation if any
    if (this.newLocalisation.adresse || this.newLocalisation.quartier) {
      this.addLocalisation();
    }

    if (!this.entreprise.localisation || this.entreprise.localisation.length === 0) {
      this.feedback.error('Veuillez ajouter au moins une localisation');
      return;
    }

    this.feedback.showLoader();

    // Map to backend expected properties
    const mappedLocalisations = this.entreprise.localisation.map(loc => ({
      address: loc.adresse,
      quartier: loc.quartier,
      telephone: loc.telephone,
      latitude: loc.latitude,
      longitude: loc.longitude
    }));

    this.entrepriseService.saveLocalisationsBatch(mappedLocalisations, this.structureId).subscribe({
      next: () => {
        this.feedback.hideLoader();
        this.currentStep = 5; // Move to photos step
      },
      error: () => {
        this.feedback.hideLoader();
        this.feedback.error('Erreur lors de l’enregistrement de la localisation');
      }
    });
  }

  onFileSelected(event: any) {
    if (!this.structureId) {
      this.feedback.error('Structure non créée completement');
      return;
    }
    const file: File = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.entrepriseService.savePhoto(file, this.token, this.structureId).subscribe({
        next: (photo) => {
          this.uploadedPhotos.push(photo);
          this.isUploading = false;
          this.feedback.success('Photo ajoutée avec succès');
        },
        error: (err) => {
          this.isUploading = false;
          this.feedback.error("Erreur lors de l'ajout de la photo");
        }
      });
    }
    event.target.value = ''; // Reset input
  }

  getPhotoUrl(photoId: string): string {
    return `${environment.apiUrl}/photos/public/${photoId}/image`;
  }

  removePhoto(photoId: string, index: number) {
    if (!this.structureId) return;
    this.entrepriseService.removePhoto(photoId, this.token, this.structureId).subscribe({
      next: () => {
        this.uploadedPhotos.splice(index, 1);
        this.feedback.success('Photo supprimée');
      },
      error: () => this.feedback.error('Erreur lors de la suppression de la photo')
    });
  }

  finishStep5() {
    this.feedback.success('Structure créée avec succès !');
    this.onBack(); // Redirect back
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
