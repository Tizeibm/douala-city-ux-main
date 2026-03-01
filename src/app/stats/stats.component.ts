import { Component, OnInit } from '@angular/core';
import { StatistiquesService, StatisticsDto } from '../services/statistiques.service';

@Component({
  selector: 'app-stats',
  standalone: false,
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent implements OnInit {

  stats: StatisticsDto = {
    totalStructures: 0,
    totalValideStructures: 0,
    totalWaitingStructures: 0,
    totalAnnonces: 0,
    totalUserAccounts: 0,
    totalEnterpriseAccounts: 0,
    totalAccounts: 0
  };

  loading = true;
  error = '';

  constructor(private statService: StatistiquesService) { }

  ngOnInit(): void {
    this.statService.getUserStats().subscribe({
      next: (s) => {
        this.stats = s;
        this.loading = false;
      },
      error: (e) => {
        console.error('Error loading stats', e);
        this.error = 'Impossible de charger les statistiques.';
        this.loading = false;
      }
    });
  }
}
