import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

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

  rating: number = 0;
  hoverRating: number = 0;
  commentaire: string = '';
  loading: boolean = false;
  errorMessage = '';
  successMessage = '';
  @Input() structureId: string | null = null;
  @Output() closePanel = new EventEmitter<void>();


  constructor(
    private avisService: AvisService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Priority: @Input > Route :id > Route parent :id
    if (!this.structureId) {
      this.structureId = this.route.snapshot.paramMap.get('id') ||
        this.route.parent?.snapshot.paramMap.get('id') ||
        null;
    }

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
      note: Math.round(this.rating),
      commentaire: this.commentaire.trim(),
      structure: this.structureId,
      auteur: userId,
      anonyme: false
    };

    console.log('[AjouterAvis] Submitting Review with Payload:', JSON.stringify(nouvelAvis, null, 2));

    this.avisService.addAvis(nouvelAvis).subscribe({
      next: (response) => {
        console.log('[AjouterAvis] Success Response:', response);
        this.successMessage = 'Votre avis a été envoyé avec succès ! Il sera visible après validation.';
        this.loading = false;
        this.commentaire = '';
        this.avisService.notifyAvisAdded();
        setTimeout(() => {
          this.closePanel.emit();
        }, 2000);
      },
      error: (error) => {
        console.error('[AjouterAvis] Submission Error:', error);
        let detail = '';
        if (error.status === 400 && error.error) {
           detail = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
           console.error('[AjouterAvis] Validation Error Details:', detail);
        } else if (error.status === 401) {
           detail = 'Non autorisé - Vérifiez votre connexion.';
        } else if (error.status === 403) {
           detail = 'Accès refusé - Droits insuffisants.';
        } else if (error.status === 500) {
           detail = 'Erreur interne du serveur.';
        }
        
        this.errorMessage = `Erreur (${error.status || 'Inconnue'}). ${detail || error.message || ''}`.substring(0, 150);
        this.loading = false;
      }
    });
  }

  onCancel() {
    this.closePanel.emit();
  }
}
