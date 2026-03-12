import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { Utilisateur } from '../registration/services/inscription.service';
import { FeedbackService } from '../../../shared/feedback.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {


  email: string = '';
  password: string = '';
  erreur: string = '';


  errorMessage= '';

  constructor(private authService: AuthService, private router: Router,
    private feedback: FeedbackService
  ) {}

  onLogin() {
    this.feedback.showLoader();
    console.log(this.email+' '+ this.password);
    this.authService.login(this.email, this.password).subscribe({
      next: (reponse) => {
        this.feedback.success(" connexion réussie")
        localStorage.setItem('token', reponse.token);
        console.log(reponse.token);
        const utilisateur : Utilisateur = reponse.userDto;
        const token: string= reponse.token;
        console.log(reponse);
        console.log(utilisateur);
        this.feedback.hideLoader();
        this.authService.connecter(utilisateur, token);
        this.router.navigate(['/dashboard-user']);
      },
      error: () => {
        this.feedback.error('Erreur lors de la connexion');
        this.erreur = 'Email ou mot de passe incorrect';
        this.feedback.hideLoader();
      }
    });
  }

}
