import { Component, OnInit } from '@angular/core';
import { StatistiquesService } from '../../core/services/statistiques.service';

@Component({
  selector: 'app-statistiques',
  standalone: false,
  templateUrl: './statistiques.component.html',
  styleUrl: './statistiques.component.scss'
})
export class StatistiquesComponent implements OnInit {

  stats: any = {};
  loading = true;
  error = '';

  constructor(private statsService: StatistiquesService) { }

  ngOnInit(): void {
    this.statsService.getUserStats().subscribe({
      next: (data: any) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'Impossible de charger les statistiques.';
        this.loading = false;
      }
    });
  }
}
