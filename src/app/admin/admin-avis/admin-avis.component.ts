import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AvisService } from '../../features/avis/services/avis.service';
import { Avis } from '../../features/avis/models/avis';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-avis',
  standalone: false,
  templateUrl: './admin-avis.component.html',
  styleUrls: ['./admin-avis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAvisComponent implements OnInit {
  allAvis: Avis[] = [];
  filteredAvis: Avis[] = [];
  loading = true;
  activeTab: string = 'all';

  constructor(private avisService: AvisService) {}

  ngOnInit(): void {
    this.loadAllAvis();
  }

  loadAllAvis(): void {
    this.loading = true;
    this.avisService.getAllAvisForAdmin().subscribe({
      next: (data: any) => {
        this.allAvis = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('[AdminAvis] Error loading reviews:', err);
        this.loading = false;
      }
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.activeTab === 'all') {
      this.filteredAvis = [...this.allAvis];
    } else {
      this.filteredAvis = this.allAvis.filter(a => a.status === this.activeTab);
    }
  }

  getStatusCount(status: string): number {
    if (status === 'all') return this.allAvis.length;
    return this.allAvis.filter(a => a.status === status).length;
  }

  publierAvis(avis: Avis): void {
    if (!avis.id) return;
    Swal.fire({
      title: 'Publier cet avis ?',
      text: 'Cet avis sera visible publiquement.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      confirmButtonText: 'Publier',
      cancelButtonText: 'Annuler'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.avisService.publierAvis(avis.id!).subscribe({
          next: () => {
            avis.status = 'PUBLIE';
            this.applyFilter();
            Swal.fire('Publié !', "L'avis est maintenant visible.", 'success');
          },
          error: (err: any) => {
            console.error('[AdminAvis] Publish error:', err);
            Swal.fire('Erreur', 'Impossible de publier cet avis.', 'error');
          }
        });
      }
    });
  }

  rejeterAvis(avis: Avis): void {
    if (!avis.id) return;
    Swal.fire({
      title: 'Rejeter cet avis ?',
      input: 'text',
      inputLabel: 'Raison du rejet (optionnel)',
      inputPlaceholder: 'Ex: Contenu inapproprié...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Rejeter',
      cancelButtonText: 'Annuler'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.avisService.rejeterAvis(avis.id!, result.value || '').subscribe({
          next: () => {
            avis.status = 'REJETE';
            this.applyFilter();
            Swal.fire('Rejeté', "L'avis a été rejeté.", 'info');
          },
          error: (err: any) => {
            console.error('[AdminAvis] Reject error:', err);
            Swal.fire('Erreur', 'Impossible de rejeter cet avis.', 'error');
          }
        });
      }
    });
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'PUBLIE': return 'Publié';
      case 'REJETE': return 'Rejeté';
      case 'SIGNALE': return 'Signalé';
      default: return status || 'Inconnu';
    }
  }
}
