import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { Utilisateur } from '../../features/auth/registration/services/inscription.service';
import { FeedbackService } from '../../shared/feedback.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {



  email: string = "";
  password: string="";


errorMessage= '';


constructor(private authService: AuthService, private router: Router, private feedback: FeedbackService){}


  onLogin(): void {
    this.feedback.showLoader();
  console.log(this.email+' '+ this.password);
  this.errorMessage= '';
  this.authService.login(this.email, this.password).subscribe({
    next: (reponse) =>{
               console.log(reponse);
              localStorage.setItem('token', reponse.token);
              console.log(reponse.token);
              const utilisateur : Utilisateur = reponse.userDto;
              const token: string= reponse.token;
              console.log(reponse);
              console.log(utilisateur);
              this.feedback.success('Connexion réussie');
                this.feedback.hideLoader();
              this.authService.connecter(utilisateur, token);
             
      this.router.navigate(['/admin']);
    },
    error: (err: any) =>{
      this.feedback.error('Erreur lors de la connexion');
      this.feedback.hideLoader();
      console.error('Erreur lors de la connexion', err);
      this.errorMessage= 'Échec de la connexion. Veuillez vérifier vos identifiants.';
    }
  });


}
}
