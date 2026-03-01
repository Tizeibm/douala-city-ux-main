import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { InscriptionService, Utilisateur } from '../website/registration/services/inscription.service';

@Component({
  selector: 'app-dashboard-user',
  standalone: false,
  templateUrl: './dashboard-user.component.html',
  styleUrl: './dashboard-user.component.scss'
})
export class DashboardUserComponent implements OnInit {


  utilisateur: Utilisateur | null = null;
  estConnecte: boolean = false;
  utilisateurNom: string | null = null;



  utilisateurId!: string;
  structures: any[] = [];
  nomUtilisateur: string | null = null;

  constructor(
    private authService: AuthService,
    private structureService: InscriptionService
  ) { }

  ngOnInit() {

    this.authService.estConnecte$.subscribe((etat) => this.estConnecte = etat);
    this.authService.utilisateur$.subscribe(u => {
      this.utilisateur = u;
    });
    this.authService.chargerUtilisateurDepuisStorage();
    this.utilisateurId = this.authService.getUtilisateurId();
    this.nomUtilisateur = this.authService.getNomUtilisateur();

    // this.structureService.getStructuresUtilisateur(this.utilisateurId)
    //   .subscribe(data => this.structures = data);
  }

  logout() {
    this.authService.logout();
  }
}
