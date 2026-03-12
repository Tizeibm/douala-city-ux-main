import { Component, Input, OnInit } from '@angular/core';
import { Entreprise, Localisation } from '../../shared/models/entreprise';
import { ActivatedRoute } from '@angular/router';
import { EntreprisesService } from '../../core/services/entreprises.service';
import { LocalisationStateService } from '../localisation.service';
import { ChangeDetectorRef } from '@angular/core';
import { ServService } from '../serv.service';
import { HorairesService } from '../horaires.service';
import { PhotosService } from '../photos.service';

@Component({
  selector: 'app-structure-details',
  standalone: false,
  templateUrl: './structure-details.component.html',
  styleUrls: ['./structure-details.component.scss']
})
export class StructureDetailsComponent implements OnInit {

  backendUrl = 'http://localhost:8080/';

  @Input() structure!: Entreprise;
  editMode = false;


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

  constructor(
    private route: ActivatedRoute,
    private entrepriseService: EntreprisesService,
    private localisationState: LocalisationStateService,
    private servState: ServService,
    private horState: HorairesService,
    private photoState: PhotosService,
    private cdr: ChangeDetectorRef
  ) { }


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
    const token = localStorage.getItem('token');
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
