import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AvisService } from '../../services/avis.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { Avis } from '../../models/avis';

@Component({
  selector: 'app-ajouter-avis',
  standalone: false,
  templateUrl: './ajouter-avis.component.html',
  styleUrl: './ajouter-avis.component.scss'
})
export class AjouterAvisComponent implements OnInit {

  rating = 5;
  commentaire = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  structureId: string | null = null;

  @Output() closePanel = new EventEmitter<void>();

  constructor(
    private avisService: AvisService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Parent route is structdet/:id
    this.structureId = this.route.parent?.snapshot.paramMap.get('id') || null;
    if (!this.authService.isLoggedIn()) {
      this.errorMessage = 'Vous devez être connecté pour donner un avis.';
    }
  }

  setRating(star: number) {
    this.rating = star;
  }

  submitAvis() {
    if (!this.structureId) {
      this.errorMessage = 'Structure non identifiée.';
      return;
    }

    const userId = this.authService.getUtilisateurId();
    if (!userId) {
      this.errorMessage = 'Vous devez être connecté pour donner un avis.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const nouvelAvis: any = {
      note: this.rating,
      commentaire: this.commentaire,
      structureId: this.structureId,
      auteurId: userId,
      anonyme: false
    };

    console.log('Sending Avis:', nouvelAvis);

    this.avisService.addAvis(nouvelAvis).subscribe({
      next: (response) => {
        this.successMessage = 'Votre avis a été envoyé avec succès ! Il sera visible après validation par l\'administration.';
        this.loading = false;
        this.commentaire = '';
        setTimeout(() => {
          this.closePanel.emit();
        }, 3000);
      },
      error: (error) => {
        console.error('Full Error Object:', error);
        if (error.status === 400 && error.error) {
          console.error('Validation Errors:', error.error);
        }
        this.errorMessage = `Erreur lors de l'ajout de l'avis (${error.status || 'Inconnue'}). ${error.error?.message || ''}`;
        this.loading = false;
      }
    });
  }

  onCancel() {
    this.closePanel.emit();
  }
}
