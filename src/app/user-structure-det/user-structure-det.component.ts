import { ChangeDetectorRef, Component, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Entreprise } from '../entreprise';
import { ActivatedRoute } from '@angular/router';
import { EntreprisesService } from '../admin/services/entreprises.service';
import { LocalisationStateService } from '../admin/localisation.service';
import { ServService } from '../admin/serv.service';
import { HorairesService } from '../admin/horaires.service';
import { PhotosService } from '../admin/photos.service';

@Component({
  selector: 'app-user-structure-det',
  standalone: false,
  templateUrl: './user-structure-det.component.html',
  styleUrl: './user-structure-det.component.scss'
})
export class UserStructureDetComponent implements OnInit {


  backendUrl = 'http://localhost:8080/';

  @Input() structure!: Entreprise;
  editMode = false;


  constructor(
    private route: ActivatedRoute,
    private entrepriseService: EntreprisesService,
    private localisationState: LocalisationStateService,
    private servState: ServService,
    private horState: HorairesService,
    private photoState: PhotosService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }
  moyenneAvis = 3;
  totalAvis = 5;

  open = {
    infos: true,
    horaires: false,
    avis: false,
    localisations: false,
    services: false
  }

  toggle(key: keyof typeof this.open) {

    this.open[key] = !this.open[key];

  }
  updateUI() {
    // Après la mise à jour de la base :
    this.loadDataAgain(); // ou rafraîchis ton tableau local
    this.cdr.detectChanges(); // 🔥 force le refresh de la vue
  }

  loadDataAgain() {
    this.localisationState.setLocalisations(this.structure.localisation || []);
  }
  ngOnInit(): void {



    const id = this.route.snapshot.paramMap.get('id');
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (id) {
      this.entrepriseService.getEntreprisesById(token, id).subscribe(struct => {
        console.log(struct);
        this.structure = struct;
        this.entrepriseService.structure$.subscribe(() => {
          this.entrepriseService.setEntreprise(struct);
          this.localisationState.setLocalisations(this.structure.localisation || []);
          this.servState.setServices(this.structure.services || []);
          this.photoState.setphotos(this.structure.photos || []);
          this.horState.setHoraires(this.structure.horaires || []);
        });
      });
    }
  }
  onEdit() {
    this.editMode = !this.editMode;
  }

  onCancelEdit() {
    this.editMode = false;
  }

  onStructureUpdated(updated: Entreprise) {

    this.entrepriseService.setEntreprise(updated);

    this.entrepriseService.structure$.subscribe(struct => {
      this.structure = updated;
    }
    )
    console.log(updated);

    this.localisationState.localisations$.subscribe(list => {
      console.log(list);
      this.structure.localisation = list ? list : [];
    }
    );
    this.servState.services$.subscribe(list => {
      console.log(list);
      this.structure.services = list ? list : [];
    }
    );





    this.horState.horaires$.subscribe(list => {

      this.structure.horaires = list ? list : [];
    }
    );


    this.photoState.photos$.subscribe(list => {
      console.log(list);
      this.structure.photos = list ? list : [];
    }
    );
    this.editMode = false;

  }



}



