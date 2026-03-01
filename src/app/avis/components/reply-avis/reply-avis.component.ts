import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AvisService } from '../../services/avis.service';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-reply-avis',
  standalone: false,
  templateUrl: './reply-avis.component.html',
  styleUrl: './reply-avis.component.scss'
})
export class ReplyAvisComponent implements OnInit {

  contenu = '';
  avisId: string | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private avisService: AvisService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.avisId = params['avisId'];
    });
  }

  submit() {
    if (!this.avisId || !this.contenu) return;

    this.loading = true;
    const role = this.authService.getRole();
    const typeRepondant = role === 'ADMIN' ? 'ADMIN' : 'STRUCTURE';

    const reponse = {
      avisId: this.avisId,
      contenu: this.contenu,
      typeRepondant: typeRepondant
    };

    this.avisService.addReponseAvis(reponse).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (err) => {
        console.error('Erreur lors de l\'envoi de la réponse', err);
        this.errorMessage = 'Erreur lors de l\'envoi de la réponse.';
        this.loading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
