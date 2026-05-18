import { Component, OnInit } from '@angular/core';
import { EntreprisesService } from '../../admin/services/entreprises.service';
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
  confirmAction: { type: 'valider' | 'rejeter', id: string, name: string } | null = null;

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
      error: (err: any) => {
        console.error('Erreur lors du chargement des entreprises', err);
        this.loading = false;
      }
    });
  }

  valider(id: string) {
    const e = this.entreprises.find(e => e.id === id);
    this.confirmAction = { type: 'valider', id, name: e?.nom || 'cette structure' };
  }

  rejeter(id: string) {
    const e = this.entreprises.find(e => e.id === id);
    this.confirmAction = { type: 'rejeter', id, name: e?.nom || 'cette structure' };
  }

  cancelAction() {
    this.confirmAction = null;
  }

  executeAction() {
    if (!this.confirmAction) return;
    const { type, id } = this.confirmAction;
    this.confirmAction = null;
    this.feedback.showLoader();

    if (type === 'valider') {
      this.entrepriseService.validerEntreprise(id).subscribe({
        next: () => {
          this.feedback.hideLoader();
          this.feedback.success('Entreprise validée avec succès');
          this.loadEntreprises();
        },
        error: () => {
          this.feedback.hideLoader();
          this.feedback.error('Erreur lors de la validation');
        }
      });
    } else {
      this.entrepriseService.rejeterEntreprise(id).subscribe({
        next: () => {
          this.feedback.hideLoader();
          this.feedback.success('Entreprise rejetée avec succès');
          this.loadEntreprises();
        },
        error: () => {
          this.feedback.hideLoader();
          this.feedback.error('Erreur lors du rejet');
        }
      });
    }
  }
}

