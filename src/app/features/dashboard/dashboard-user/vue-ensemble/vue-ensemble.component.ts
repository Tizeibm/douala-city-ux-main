import { Component, OnInit } from '@angular/core';
import { EntrepriseService } from '../../../../core/services/entreprises.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Entreprise } from '../../../../shared/models/entreprise';

@Component({
  selector: 'app-vue-ensemble',
  standalone: false,
  templateUrl: './vue-ensemble.component.html',
  styleUrl: './vue-ensemble.component.scss'
})
export class VueEnsembleComponent implements OnInit {

  structures: Entreprise[] = [];
  loading = true;
  statsMap = new Map<string, any>();

  aggregateStats = {
    totalViews: 0,
    monthlyViews: 0,
    uniqueVisitors: 0,
    contactClicks: 0,
    totalavis: 0
  };

  constructor(
    private entrepriseService: EntrepriseService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.chargerStructures();
  }

  chargerStructures(): void {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    this.entrepriseService.getMesEntreprisesValides(token).subscribe({
      next: (data: any) => {
        this.structures = data;
        this.chargerStatistiques();
      },
      error: (err: any) => {
        console.error('Erreur de chargement des structures', err);
        this.loading = false;
      }
    });
  }

  chargerStatistiques(): void {
    if (this.structures.length === 0) {
      this.loading = false;
      return;
    }

    let loadedCount = 0;
    this.structures.forEach(struct => {
      if (struct.id) {
        this.entrepriseService.getStructureStats(struct.id).subscribe({
          next: (stats) => {
            this.statsMap.set(struct.id!, stats);
            // Aggregate stats
            this.aggregateStats.totalViews += (stats.totalViews || 0);
            this.aggregateStats.monthlyViews += (stats.monthlyViews || 0);
            this.aggregateStats.uniqueVisitors += (stats.uniqueVisitors || 0);
            this.aggregateStats.contactClicks += (stats.contactClicks?.total || 0);
            this.aggregateStats.totalavis += (stats.totalavis || 0);
          },
          error: (err: any) => {
            console.error(`Erreur stats pour structure ${struct.id}`, err);
            this.statsMap.set(struct.id!, {
              totalViews: 0,
              monthlyViews: 0,
              uniqueVisitors: 0,
              contactClicks: 0,
              totalavis: 0
            });
          },
          complete: () => {
            loadedCount++;
            if (loadedCount === this.structures.length) {
              this.loading = false;
            }
          }
        });
      } else {
        loadedCount++;
      }
    });
  }
}
