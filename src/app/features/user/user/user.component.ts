import { Component } from '@angular/core';
import { Entreprise, ServiceOffert } from '../../../shared/models/entreprise';
import { AuthService } from '../../../core/services/auth.service';
import { EntrepriseService } from '../../../core/services/entreprises.service';
import { InscriptionService, Utilisateur } from '../../auth/registration/services/inscription.service';

@Component({
  selector: 'app-user',
  standalone: false,
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {


  utilisateur: Utilisateur | null = null;
  estConnecte: boolean = false;
  utilisateurNom: string | null = null;



  utilisateurId!: string;

  nomUtilisateur: string | null = null;

  structures: Entreprise[] = [];
  selectedStructure?: Entreprise;

  newService: ServiceOffert = {
    nom: '',
    description: '',
    prix: 0
  };

  constructor(private entrepriseService: EntrepriseService,
    private structureService: InscriptionService,
    private authService: AuthService
  ) { }

  logout() {
    this.authService.logout();
  }

  entreprises: Entreprise[] = [];
  loading = true;


  ngOnInit(): void {


    this.authService.estConnecte$.subscribe((etat) => this.estConnecte = etat);
    this.authService.utilisateur$.subscribe(u => {
      this.utilisateur = u;
    });
    this.authService.chargerUtilisateurDepuisStorage();
    this.utilisateurId = this.authService.getUtilisateurId();
    this.nomUtilisateur = this.authService.getNomUtilisateur();
    this.chargerEntreprises();
  }


  chargerEntreprises(): void {
    this.loading = true;
    this.entrepriseService.getMesEntreprisesValides().subscribe({
      next: (data: Entreprise[]) => {
        this.entreprises = data;
        console.log('Entreprises chargées:', this.entreprises);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des entreprises :', err);
        this.loading = false;
      }
    });
  }



  addService(structure: Entreprise) {
    this.newService = { nom: '', description: '', prix: 0 }; // réinitialiser
  }

  saveService() {
    if (!this.selectedStructure) return;

    this.structureService.addServiceToStructure(this.selectedStructure.id!, this.newService)
      .subscribe({
        next: (savedService) => {
          // mettre à jour l’affichage local

          //  this.selectedStructure.services.push(savedService);
          // reset
          // fermer le formulaire
        },
        error: (err: any) => {
          console.error('Erreur ajout service : ', err);
        }
      });
  }
}
