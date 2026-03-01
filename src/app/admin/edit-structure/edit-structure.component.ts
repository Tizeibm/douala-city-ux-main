import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Entreprise, Horaire, Localisation, Photo, ServiceOffert } from '../../entreprise';
import { EntrepriseService } from '../../services/entreprises.service';
import { fileURLToPath } from 'url';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LocalisationStateService } from '../localisation.service';
import { EntreprisesService } from '../services/entreprises.service';
import { ServService } from '../serv.service';
import { HorairesService } from '../horaires.service';
import { PhotosService } from '../photos.service';
import { HapticService } from '../../core/services/haptic.service';
import { FeedbackService } from '../../shared/feedback.service';


@Component({
  selector: 'app-edit-structure',
  standalone: false,
  templateUrl: './edit-structure.component.html',
  styleUrls: ['./edit-structure.component.scss']
})
export class EditStructureComponent implements OnInit {
  @Input() structure!: Entreprise;
  @Output() structureUpdated = new EventEmitter<Entreprise>();
  @Output() cancelEdit = new EventEmitter<void>();


  step = 1;

  next() {

    this.step++;
  }

  prev() {

    this.step--;
  }


  backendUrl = "http://localhost:8080/";
  structureForm!: FormGroup;
  localisations: any[] = [];
  successMessage = '';

  constructor(private fb: FormBuilder, private entreprisesService: EntrepriseService,
    private route: ActivatedRoute, private localisationState: LocalisationStateService,
    private servstate: ServService,
    private horState: HorairesService,
    private photoState: PhotosService,
    private cdr: ChangeDetectorRef, private structureService: EntreprisesService,
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

    ]

  getCategories(): string[] {
    return this.categories.map(c => c.nom);
  }

  getSousCategories(): string[] {

    const cat = this.categories.find(c => c.nom === this.structureForm.value.categorieNom)
    return cat ? cat.sousCategories : [];
  }


  token: String | null = localStorage.getItem('token');

  //jours= ['LUNDI', 'MARDI' , 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE']

  /* onPositionChange(pos: {lat: number, lng: number}){
     
     this.entreprise.latitude= pos.lat;
     this.entreprise.longitude= pos.lng;
   }  */
  onCategorieChange() {
    this.getSousCategories();
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
    const structureId = Number(this.route.snapshot.paramMap.get('id'));
    const serv = this.services.at(i);
    const serviceId = serv.value.id;
    if (serviceId) {
      console.log(serviceId);
      this.entreprisesService.removeService(serviceId, token, structureId).subscribe({
        next: () => {
          this.servstate.deleteService(serviceId);
          this.services.removeAt(i);

        },
        error: (err) => console.error('Erreur suppression localisation', err)
      });


    }
    else {
      this.services.removeAt(i);
    }
  }

  removeHoraire(i: number) {
    const token = localStorage.getItem('token');
    const structureId = Number(this.route.snapshot.paramMap.get('id'));
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
        error: (err) => console.error('Erreur suppression horaire', err)
      });


    }
    else {
      this.horaires.removeAt(i);
    }
  }

  removePhoto(i: number) {
    const token = localStorage.getItem('token');
    const structureId = Number(this.route.snapshot.paramMap.get('id'));
    const photo = this.photos.at(i);
    const photoId = photo.value.id;
    if (photoId) {
      console.log(photoId);
      this.entreprisesService.removePhoto(photoId, token, structureId).subscribe({
        next: () => {
          this.photoState.deletePhoto(photoId);
          this.photos.removeAt(i);

        },
        error: (err) => console.error('Erreur suppression photo', err)
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
    const structureId = Number(this.route.snapshot.paramMap.get('id'));
    const loc = this.localisation.at(i);
    const localisationId = loc.value.id;
    if (localisationId) {
      console.log(localisationId);
      this.entreprisesService.removeLocalisation(localisationId, token, structureId).subscribe({
        next: () => {
          this.localisationState.deleteLocalisation(localisationId);
          this.localisation.removeAt(i);

        },
        error: (err) => console.error('Erreur suppression localisation', err)
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
      return;
    }

    this.haptic.tap();
    const token = localStorage.getItem('token');
    const formValue = this.structureForm.value;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const structureData = {

      nom: formValue.nom,
      email: formValue.email,
      description: formValue.description,
      categorieNom: formValue.categorieNom,
      sousCategorie: formValue.sousCategorie,
      photoPrincipal: formValue.photoPrincipale
    };

    // 1️⃣ Enregistrer ou mettre à jour la structure
    this.entreprisesService.updateStructure(structureData, token, id).subscribe({
      next: (structureRes) => {
        const structureId = structureRes.id; // <-- récupère l'ID généré (ou déjà existant)

        // 2️⃣ Enregistrer les localisations SANS structureId
        const localisationsNonSavees = this.localisation.value.filter((loc: any) => !loc.id);

        localisationsNonSavees.forEach((loc: any) => {
          const localisationJSON = {
            quartier: loc.quartier,
            address: loc.address,
            telephone: loc.telephone,
            latitude: loc.latitude,
            longitude: loc.longitude
          };

          this.entreprisesService.saveLocalisation(localisationJSON, token, id).subscribe({
            next: (res) => {
              this.localisationState.addLocalisation(res);

            },
            error: (err) => console.error('Erreur ajout localisation', err)
          });
        });

        // 3️⃣ Mettre à jour les localisations déjà existantes
        const localisationsSavees = this.localisation.value.filter((loc: any) => loc.id);
        localisationsSavees.forEach((loc: any) => {
          const locJSON = {
            id: loc.id,
            quartier: loc.quartier,
            address: loc.address,
            telephone: loc.telephone,
            latitude: loc.latitude,
            longitude: loc.longitude

          };

          this.entreprisesService.editLocalisation(locJSON, locJSON.id, token, id).subscribe({
            next: () => {
              this.localisationState.updateLocalisation(locJSON);
              console.log('Localisation mise à jour')
            },
            error: (err) => console.error('Erreur update localisation', err)
          });
        });


        const servicesNonSavees = this.services.value.filter((serv: any) => !serv.id);

        servicesNonSavees.forEach((serv: any) => {
          const serviceJSON = {
            nom: serv.nom,
            description: serv.description,
            prix: serv.prix
          };

          this.entreprisesService.saveService(serviceJSON, token, id).subscribe({
            next: (res) => {
              this.servstate.addService(res);

            },
            error: (err) => console.error('Erreur ajout service', err)
          });
        });

        // 3️⃣ Mettre à jour les localisations déjà existantes
        const servicesSavees = this.services.value.filter((loc: any) => loc.id);
        servicesSavees.forEach((serv: any) => {
          const servJSON = {
            id: serv.id,
            nom: serv.nom,
            description: serv.description,
            prix: serv.prix
          };



          this.entreprisesService.editService(servJSON, servJSON.id, token, id).subscribe({
            next: () => {
              this.servstate.updateService(servJSON);
              console.log('service mis à jour')
            },
            error: (err) => console.error('Erreur update service', err)
          });




        });

        const photosNonSavees = this.photos.value.filter((photo: any) => !photo.id);

        photosNonSavees.forEach((photo: any) => {
          const PhoJSON = {
            filePath: photo.filePath,
            originalFileName: photo.originalFileName,
            storedFileName: photo.storedFileName,
            fileSize: photo.fileSize,
            contentType: photo.contentType,
            uploadDate: photo.uploadDate,
            thumbnailPath: photo.thumbnailPath

          };


          this.entreprisesService.savePhoto(PhoJSON, token, id).subscribe({
            next: (res) => {
              this.photoState.addphotos(res);

            },
            error: (err) => console.error('Erreur ajout photo', err)
          });
        });

        // 3️⃣ Mettre à jour les localisations déjà existantes
        /*  const photoSavees = this.photos.value.filter((pho: any) => pho.id);
          photoSavees.forEach((photo: any) => {
            const PhoJSON = {
              id: photo.id,
              filePath: photo.filePath,
          originalFileName: photo.originalFileName,
          storedFileName: photo.storedFileName,
          fileSize: photo.fileSize,
          contentType: photo.contentType,
          uploadDate: photo.uploadDate,
      thumbnailPath: photo.thumbnailPath
    
            };
    
            
    
            this.entreprisesService.editPhoto(PhoJSON, PhoJSON.id, token, id).subscribe({
              next: () => {
                this.photoState.updatePhoto(PhoJSON);
                console.log('photo mise à jour')
              },
              error: (err) => console.error('Erreur update photo', err)
            });
    
    
    
    
          }); */



        const HorairesNonSavees = this.horaires.value.filter((hor: any) => !hor.id);


        HorairesNonSavees.forEach((hor: any) => {

          const HoraireJSON = {
            jourSemaine: hor.jourSemaine,
            heureDeDebut: hor.heureDeDebut,
            heureDeFin: hor.heureDeFin
          };

          console.log(HoraireJSON);

          this.entreprisesService.saveHoraire(HoraireJSON, token, id).subscribe({
            next: (res) => {
              console.log(res);
              this.horState.addHoraire(res);

            },
            error: (err) => console.error('Erreur ajout horaire', err)
          });
        });

        // 3️⃣ Mettre à jour les horaires déjà existantes
        const horairesSavees = this.horaires.value.filter((hor: any) => hor.id);
        horairesSavees.forEach((hor: any) => {
          console.log(hor);
          const HorJSON = {
            id: hor.id,
            jourSemaine: hor.jourSemaine,
            heureDeDebut: hor.heureDeDebut,
            heureDeFin: hor.heureDeFin

          };


          console.log(HorJSON);
          this.entreprisesService.editHoraire(HorJSON, HorJSON.id, token, id).subscribe({
            next: () => {
              this.horState.updateHoraire(HorJSON);
              console.log('horaire mis à jour');
            },
            error: (err) => console.error('Erreur update horaire', err)
          });




        });
        console.log(structureRes);
        this.feedback.success('Structure mise à jour avec succès');
        this.feedback.hideLoader();
        this.haptic.success();
        this.structureUpdated.emit(structureRes);


      },
      error: (err) => {
        this.feedback.error('Erreur update structure');
        this.feedback.hideLoader();

      }
      /* this.structureService.getEntreprisesById(token, id).subscribe(struct =>
               {
                 console.log(struct);
               
                this.structureUpdated.emit(struct);
      
               });    */

    });
  }

  addPhoto(event: any): void {
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

  }

}

