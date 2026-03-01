import { Component, OnInit } from '@angular/core';
import { EntreprisesService } from '../services/entreprises.service';
import { FeedbackService } from '../../shared/feedback.service';

@Component({
  selector: 'app-validation',
  standalone: false,
  templateUrl: './validation.component.html',
  styleUrl: './validation.component.scss'
})
export class ValidationComponent implements OnInit {

  entreprises: any[] = [];
  loading: boolean = false;

  constructor(private entrepriseService: EntreprisesService, private feedback: FeedbackService) { }

  ngOnInit(): void {
    this.loadEntreprises();
  }

  loadEntreprises() {
    this.loading = true;
    this.entrepriseService.getEntreprisesEnAttente().subscribe({
      next: (data: any) => {
        this.entreprises = data.content || data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des entreprises', err);
        this.loading = false;
      }
    });
  }

  valider(id: string) {
    this.feedback.showLoader();
    this.entrepriseService.validerEntreprise(id).subscribe({
      next: () => {
        this.feedback.hideLoader();
        this.feedback.success('Entreprise validée avec succès');
        this.loadEntreprises();
      },
      error: (err) => {
        this.feedback.hideLoader();
        this.feedback.error('Erreur lors de la validation de l\'entreprise');
        this.loadEntreprises();
      }
    });
  }

  rejeter(id: string) {
    this.feedback.showLoader();
    this.entrepriseService.rejeterEntreprise(id).subscribe({
      next: () => {
        this.feedback.success('Entreprise rejetée avec succès');
        this.feedback.hideLoader();
        this.loadEntreprises();
      },
      error: (err) => {
        this.feedback.error('Erreur lors du rejet de l\'entreprise');
        this.feedback.hideLoader();
        this.loadEntreprises();
      }
    });
  }
}

