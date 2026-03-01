import { Component } from '@angular/core';
import { InscriptionService } from '../website/registration/services/inscription.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FeedbackService } from '../shared/feedback.service';




export enum ROLE {

  USER = "USER",
  ENTREPRISE = "ENTREPRISE",
  ADMIN = "ADMIN"
}

@Component({
  selector: 'app-login-logout',
  standalone: false,
  templateUrl: './login-logout.component.html',
  styleUrl: './login-logout.component.scss'
})
export class LoginLogoutComponent {

  role: ROLE | null = null;

  utilisateur = {

    nom: '',
    email: '',
    motDePasse: '',
    telephone: '',
    role: this.role
  }

  roles = [
    {
      role: 'USER',
      valeur: "USER"
    },
    {
      role: 'ENTREPRISE',
      valeur: "ENTREPRISE"
    },
    {
      role: 'ADMIN',
      valeur: "ADMIN"
    }
  ]

  erreurs: string[] = [];
  successMessage: string | null = null;


  messageSucces: string | null = null;
  messageErreur: string | null = null;


  constructor(private inscriptionService: InscriptionService,
    private authService: AuthService, private router: Router,
    private feedback: FeedbackService) {

  }

  inscrireUtilisateur() {

    // this.feedback.showLoader();
    console.log(this.utilisateur);
    this.inscriptionService.inscrireUtilisateur(this.utilisateur).subscribe({
      next: (res) => {
        //  this.feedback.success("Inscription réussie Bienvenue !")       
        this.messageSucces = 'Inscription réussie Bienvenue !';
        this.messageErreur = null;

        this.authService.login(this.utilisateur.email, this.utilisateur.motDePasse).subscribe({
          next: (loginRes) => {
            this.authService.connecter(loginRes.user, loginRes.token);
            this.router.navigate(['/dashboard-user']);
          },
          error: () => {
            this.messageErreur = 'Erreur lors de la connexion automatique';
          }
        });

      },
      error: (err) => {
        this.messageErreur = 'Une erreur est survenue lors de l inscription';
        this.messageSucces = null;

      }

    });
  }
}
