import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Entreprise, Horaire, Localisation, Photo, ServiceOffert } from '../../../shared/models/entreprise';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EntrepriseService } from '../../../core/services/entreprises.service';
import { ActivatedRoute } from '@angular/router';
import { LocalisationStateService } from '../../../core/services/localisation.service';
import { ServService } from '../../../core/services/serv.service';
import { HorairesService } from '../../../core/services/horaires.service';
import { PhotosService } from '../../../core/services/photos.service';
import { HapticService } from '../../../core/services/haptic.service';
import { FeedbackService } from '../../../shared/feedback.service';

@Component({
  selector: 'app-user-edit-structure',
  standalone: false,
  templateUrl: './user-edit-structure.component.html',
  styleUrl: './user-edit-structure.component.scss'
})
export class UserEditStructureComponent implements OnInit {

  @Input() structure!: Entreprise;
  @Output() structureUpdated = new EventEmitter<Entreprise>();
  @Output() cancelEdit = new EventEmitter<void>();



  step = 1;

  categories: { nom: string; sousCategories: string[] }[] =
    [
      {
        nom: 'Commerce',
        sousCategories:
          ["Alimentation", "Vêtements", "Électronique", "Meubles", "Livres"]
      },
      {
        nom: 'Autres',
        sousCategories:
          ["Autre"]
      },
      {
        nom: 'transport',
        sousCategories:
          ["Agence de voyage", "Location de voitures", "Taxi", "Transport en commun"]
      },
      {
        nom: 'Hébergement',
        sousCategories:
          ["Hôtel", "Auberge", "Chambre d'hôtes", "Camping"]
      },
      {
        nom: 'Loisirs',
        sousCategories:
          ["Cinéma", "Salle de sport", "Parc d'attractions", "Musée"]
      },
      {
        nom: 'Restauration',
        sousCategories:
          ["Restaurant", "Café", "Fast-food", "Boulangerie"]
      },
      {
        nom: 'Education',
        sousCategories:
          ["École", "Université", "Centre de formation"]
      },
      {
        nom: 'Santé',
        sousCategories:
          ["Pharmacie", "Clinique", "Hôpital", "Laboratoire"]
      },
      {
        nom: 'services',
        sousCategories:
          ["coiffure", "Mécanique", "Plomberie", "électricité", "nettoyage"]
      }

    ];

  getCategories(): string[] {
    return this.categories.map(c => c.nom);
  }

  getSousCategories(): string[] {

    const cat = this.categories.find(c => c.nom === this.structureForm.value.categorieNom)
    return cat ? cat.sousCategories : [];
  }


  async next() {
    this.haptic.stepChange();

    // Save current step data before moving next
    const success = await this.saveStep(this.step);
    if (success) {
      this.step++;
    }
  }

  async saveStep(step: number): Promise<boolean> {
    const token = localStorage.getItem('token');
    const id = this.route.snapshot.paramMap.get('id') || '';
    const formValue = this.structureForm.value;

    return new Promise((resolve) => {
      this.feedback.showLoader();

      if (step === 1) {
        // Step 1: Info General & Photos
        const structureData = {
          nom: formValue.nom,
          description: formValue.description,
          categorieNom: formValue.categorieNom,
          sousCategorie: formValue.sousCategorie,
          photoPrincipal: formValue.photoPrincipale
        };

        this.entreprisesService.updateStructure(structureData, token, id).subscribe({
          next: () => {
            // Handle photos here as well
            this.saveNewPhotos(token, id);
            if (this.pendingMainPhoto) {
              this.entreprisesService.updateMainPhoto(this.pendingMainPhoto, token, id).subscribe();
            }
            this.feedback.hideLoader();
            resolve(true);
          },
          error: () => {
            this.feedback.error('Erreur lors de la mise à jour des informations');
            this.feedback.hideLoader();
            resolve(false);
          }
        });
      } else if (step === 2) {
        // Step 2: Horaires
        const mappedHoraires = formValue.horaires.map((h: any) => ({
          id: h.id,
          jourSemaine: h.jourSemaine,
          heureDeDebut: h.heureDeDebut.includes(':') && h.heureDeDebut.split(':').length === 2 ? h.heureDeDebut + ':00' : h.heureDeDebut,
          heureDeFin: h.heureDeFin.includes(':') && h.heureDeFin.split(':').length === 2 ? h.heureDeFin + ':00' : h.heureDeFin
        }));

        this.entreprisesService.saveHorairesBatch(mappedHoraires, id).subscribe({
          next: () => {
            this.feedback.hideLoader();
            resolve(true);
          },
          error: () => {
            this.feedback.error('Erreur lors de l\'enregistrement des horaires');
            this.feedback.hideLoader();
            resolve(false);
          }
        });
      } else if (step === 3) {
        // Step 3: Services
        this.entreprisesService.saveServicesBatch(formValue.services, id).subscribe({
          next: () => {
            this.feedback.hideLoader();
            resolve(true);
          },
          error: () => {
            this.feedback.error('Erreur lors de l\'enregistrement des services');
            this.feedback.hideLoader();
            resolve(false);
          }
        });
      } else {
        this.feedback.hideLoader();
        resolve(true);
      }
    });
  }

  saveNewPhotos(token: any, id: string) {
    const photosNonSavees = this.photos.value.map((photo: any, index: number) => ({ photo, index })).filter((item: any) => !item.photo.id);
    photosNonSavees.forEach((item: any) => {
      const file = this.pendingFiles.get(item.index);
      if (file) {
        this.entreprisesService.savePhoto(file, token, id).subscribe({
          next: (res: Photo) => this.photoState.addphotos(res),
          error: (err: any) => console.error('Erreur ajout photo', err)
        });
      }
    });
  }

  prev() {
    this.haptic.stepChange();
    this.step--;
  }

  backendUrl = "http://localhost:8080/";
  structureForm!: FormGroup;
  localisations: any[] = [];
  pendingFiles = new Map<number, File>();
  pendingMainPhoto: File | null = null;

  constructor(private fb: FormBuilder, private entreprisesService: EntrepriseService,
    private route: ActivatedRoute, private localisationState: LocalisationStateService,
    private servstate: ServService,
    private horState: HorairesService,
    private photoState: PhotosService,
    private cdr: ChangeDetectorRef,
    private haptic: HapticService,
    private feedback: FeedbackService
  ) { }

  joursSemaine = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];
  updateUI() {
    // Après la mise à jour de la base :
    this.loadDataAgain(); // ou rafraîchis ton tableau local
    this.cdr.detectChanges(); // 🔥 force le refresh de la vue
  }

  loadDataAgain() {
    this.localisationState.setLocalisations(this.structure.localisation || []);
  }

  ngOnInit(): void {
    this.localisationState.localisations$.subscribe({
      next: (locs) => (this.localisations = locs)
    });
    this.structureForm = this.fb.group({
      nom: [this.structure.nom, Validators.required],
      description: [this.structure.description],
      categorieNom: [this.structure.categorieNom, Validators.required],
      sousCategorie: [this.structure.sousCategorie],
      services: this.fb.array(
        this.structure.services?.length
          ? this.structure.services.map(s => this.createService(s))
          : []
      ),
      photos: this.fb.array(
        this.structure.photos?.length
          ? this.structure.photos.map(p => this.createPhoto(p))
          : []
      ),
      photoPrincipale: this.fb.control(this.structure.photoPrincipal || ''),
      localisation: this.fb.array(
        this.structure.localisation?.length
          ? this.structure.localisation.map(loc => this.createLocalisation(loc))
          : []
      ),
      horaires: this.fb.array(
        this.structure.horaires?.length
          ? this.structure.horaires.map(h => this.createHoraire(h))
          : [this.createHoraire({
            jourSemaine: 'LUNDI',
            heureDeDebut: '10:30',
            heureDeFin: '18:30'
          })]
      )
    });
  }


  // ======== SERVICES =========
  get services(): FormArray {
    return this.structureForm.get('services') as FormArray;
  }
  createService(service: ServiceOffert): FormGroup {
    return this.fb.group({
      id: [service.id || undefined],
      nom: [service.nom || ''],
      description: [service.description || ''],
      prix: [service.prix || 0]
    });
  }

  getLocationCopy(i: number) {
    const loc = this.localisation.at(i).value;
    return [{ ...loc }];
  }

  addService() {
    this.services.push(this.createService({
      id: undefined,
      nom: "",
      description: "",
      prix: 0
    }));
  }
  removeService(i: number) {
    const token = localStorage.getItem('token');
    const structureId = this.route.snapshot.paramMap.get('id') || '';
    const serv = this.services.at(i);
    const serviceId = serv.value.id;
    if (serviceId) {
      console.log(serviceId);
      this.entreprisesService.removeService(serviceId, token, structureId).subscribe({
        next: () => {
          this.servstate.deleteService(serviceId);
          this.services.removeAt(i);

        },
        error: (err: any) => console.error('Erreur suppression localisation', err)
      });


    }
    else {
      this.services.removeAt(i);
    }
  }

  removeHoraire(i: number) {
    const token = localStorage.getItem('token');
    const structureId = this.route.snapshot.paramMap.get('id') || '';
    const horaire = this.horaires.at(i);
    console.log(horaire);
    const horaireId = horaire.value.id;
    if (horaireId) {
      console.log(horaireId);
      this.entreprisesService.removeHoraire(horaireId, token, structureId).subscribe({
        next: () => {
          this.horaires.removeAt(i);
          this.horState.deleteHoraire(horaireId);


        },
        error: (err: any) => console.error('Erreur suppression horaire', err)
      });


    }
    else {
      this.horaires.removeAt(i);
    }
  }

  removePhoto(i: number) {
    const token = localStorage.getItem('token');
    const structureId = this.route.snapshot.paramMap.get('id') || '';
    const photo = this.photos.at(i);
    const photoId = photo.value.id;
    if (photoId) {
      console.log(photoId);
      this.entreprisesService.removePhoto(photoId, token, structureId).subscribe({
        next: () => {
          this.photoState.deletePhoto(photoId);
          this.photos.removeAt(i);

        },
        error: (err: any) => console.error('Erreur suppression photo', err)
      });


    }
    else {
      this.photos.removeAt(i);
    }
  }

  // ======== PHOTOS =========
  get photos(): FormArray {
    return this.structureForm.get('photos') as FormArray;
  }
  createPhoto(photo: Photo): FormGroup {
    return this.fb.group({
      id: [photo.id || undefined],
      filePath: [photo.filePath || ''],
      originalFileName: [photo.originalFileName || ''],
      storedFileName: [photo.storedFileName || ''],
      fileSize: [photo.fileSize || ''],
      contentType: [photo.contentType || ''],
      uploadDate: [photo.uploadDate || ''],
      thumbnailPath: [photo.thumbnailPath || '']

    });
  }

  createPhotop(photo?: string | null): FormControl {
    return this.fb.control(photo);
  }

  removePhotop() {
    this.photoPrincipale.setValue('');
  }

  addPhotoP(event: any): void {
    console.log(" photo principale");
    const input = event.target as HTMLInputElement;
    const file: File | undefined = input.files?.[0];
    console.log("fichier recu:", file);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {

      const newPhotop = reader.result as string;
      console.log(newPhotop);




      console.log('📸 Photo ajoutée:', newPhotop);

      this.structureForm.patchValue({
        photoPrincipale: newPhotop
      });
      this.pendingMainPhoto = file;


    };
    reader.readAsDataURL(file);

  }

  get photoPrincipale(): FormControl {
    return this.structureForm.get('photoPrincipale') as FormControl
  }

  set photoPrincipale(value: FormControl) {
    this.photoPrincipale = value;
  }
  // ======== LOCALISATION =========
  get localisation(): FormArray {
    return this.structureForm.get('localisation') as FormArray;
  }
  createLocalisation(loc: Localisation): FormGroup {
    return this.fb.group({
      id: [loc.id || undefined],
      quartier: [loc.quartier || ''],
      telephone: [loc.telephone || ''],
      latitude: [loc.latitude || 4.07],
      longitude: [loc.longitude || 9.05],
      address: [loc.address || '']
    });
  }

  editLocalisation(i: number) {

  }
  addLocalisation() {
    this.localisation.push(this.createLocalisation({
      id: undefined,
      quartier: '',
      telephone: '',
      latitude: 4.05,
      longitude: 9.07,
      address: ''

    }));


  }

  // Après ajout
  onLocalisationAdded(newLoc: any) {
    this.localisationState.addLocalisation(newLoc);
  }

  // Après modification
  onLocalisationUpdated(updatedLoc: any) {
    this.localisationState.updateLocalisation(updatedLoc);
  }

  // Après suppression
  onLocalisationDeleted(id: any) {
    this.localisationState.deleteLocalisation(id);
  }

  removeLocalisation(i: number) {
    const token = localStorage.getItem('token');
    const structureId = this.route.snapshot.paramMap.get('id') || '';
    const loc = this.localisation.at(i);
    const localisationId = loc.value.id;
    if (localisationId) {
      console.log(localisationId);
      this.entreprisesService.removeLocalisation(localisationId, token, structureId).subscribe({
        next: () => {
          this.localisationState.deleteLocalisation(localisationId);
          this.localisation.removeAt(i);

        },
        error: (err: any) => console.error('Erreur suppression localisation', err)
      });


    }
    else {
      this.localisation.removeAt(i);
    }


  }

  onLocationSelected(location: { latitude: number; longitude: number }, index?: number) {
    if (index !== undefined) {
      console.log('📍 Coordonnées reçues de la carte :', location, 'Index :', index);

      const locGroup = this.localisation.at(index);
      if (locGroup) {

        console.log(locGroup);

        locGroup.patchValue({
          latitude: location.latitude,
          longitude: location.longitude
        }, { emitEvent: false });

      } else {
        console.warn('⚠️ Aucun groupe trouvé pour la localisation', index);
      }

    }
  }

  onLocationRemoved(index: number) {
    this.localisation.removeAt(index); // Si tu utilises un FormArray
  }

  // ======== HORAIRES =========
  get horaires(): FormArray {
    return this.structureForm.get('horaires') as FormArray;
  }
  createHoraire(h: Horaire): FormGroup {
    return this.fb.group({
      id: [h.id || undefined],
      jourSemaine: [h.jourSemaine || ''],
      heureDeDebut: new FormControl('10:30'),
      heureDeFin: new FormControl('18:30')
    });
  }
  addHoraire() {
    this.horaires.push(this.createHoraire(
      {
        id: undefined,
        jourSemaine: '',
        heureDeDebut: '10:30',
        heureDeFin: '18:30'
      }
    ));
  }

  // ======== VALIDATION / SAUVEGARDE =========
  onSubmit() {
    this.feedback.showLoader();
    if (this.structureForm.invalid) {
      this.haptic.error();
      this.structureForm.markAllAsTouched();
      this.feedback.hideLoader();
      return;
    }
    this.haptic.tap();
    const token = localStorage.getItem('token');
    const id = this.route.snapshot.paramMap.get('id') || '';

    // Final save for localization
    const mappedLocalisations = this.localisation.value.map((loc: any) => ({
      id: loc.id,
      address: loc.address,
      quartier: loc.quartier,
      telephone: loc.telephone,
      latitude: loc.latitude,
      longitude: loc.longitude
    }));

    this.entreprisesService.saveLocalisationsBatch(mappedLocalisations, id).subscribe({
      next: () => {
        this.feedback.success('Structure mise à jour avec succès');
        this.feedback.hideLoader();
        this.haptic.success();
        // Emit updated structure (fetch fresh data if needed, but for now emit original with some updates)
        this.structureUpdated.emit(this.structureForm.value);
      },
      error: (err: any) => {
        this.feedback.error('Erreur lors de la sauvegarde finale des localisations');
        this.feedback.hideLoader();
        console.error('Erreur update localisation batch', err);
      }
    });
  }

  addPhoto(event: any): void {
    if (this.photos.length >= 2) {
      this.feedback.error('Vous ne pouvez pas ajouter plus de 2 photos.');
      return;
    }
    const file: File = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newPhoto: Photo = {
        id: undefined,
        thumbnailPath: file.type.startsWith('image/') ? reader.result as string : undefined,
        originalFileName: file.name,
        storedFileName: this.generateStoredFileName(file.name),
        filePath: reader.result as string,
        fileSize: file.size,
        contentType: file.type,
        uploadDate: new Date(),
      };

      this.photos.push(this.createPhoto(newPhoto));
      this.pendingFiles.set(this.photos.length - 1, file);

      console.log('📸 Photo ajoutée:', newPhoto);
    };

    reader.readAsDataURL(file);
    (event.target as HTMLInputElement).value = ''; // Réinitialiser l’input
  }

  private generateStoredFileName(originalName: string): string {
    const timestamp = new Date().getTime();
    const extension = originalName.split('.').pop();
    return `${timestamp}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
  }

  updateLocalisation(index: number): void {
    const group = this.localisation.at(index) as FormGroup;
    const loc = group.value;

    if (loc.latitude && loc.longitude) {
      group.patchValue({
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
      });
      console.log(`📍 Localisation ${index} mise à jour`);
    }
  }

  onCancel() {
    this.cancelEdit.emit();
  }
}
