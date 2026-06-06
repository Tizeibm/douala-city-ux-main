import { Component, ChangeDetectionStrategy, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Avis } from '../../models/avis';
import { ActivatedRoute, Router } from '@angular/router';
import { AvisService } from '../../services/avis.service';

@Component({
  selector: 'app-avis-list',
  standalone: false,
  templateUrl: './avis-list.component.html',
  styleUrl: './avis-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvisListComponent implements OnInit {

  @Input() allAvis: Avis[] = [];
  @Input() structureId: string | null = null;
  filteredAvis: Avis[] = [];
  loading = false;
  activeFilter: number | null = null;

  stats = {
    total: 0,
    average: 0,
    distribution: [
      { rating: 5, count: 0, percentage: 0 },
      { rating: 4, count: 0, percentage: 0 },
      { rating: 3, count: 0, percentage: 0 },
      { rating: 2, count: 0, percentage: 0 },
      { rating: 1, count: 0, percentage: 0 }
    ]
  };

  expandedComments: Set<string> = new Set();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private avisService: AvisService
  ) { }

  ngOnInit(): void {
    if (!this.structureId) {
      this.structureId = (this.route.snapshot.paramMap.get('id') || this.route.parent?.snapshot.paramMap.get('id')) ?? null;
    }
    
    if (this.allAvis.length > 0) {
      this.computeStats();
      this.applyFilter();
    } else if (this.structureId) {
      this.loadAvis(this.structureId);
    }

    this.avisService.avisAdded$.subscribe(() => {
      if (this.structureId) this.loadAvis(this.structureId);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allAvis'] && this.allAvis) {
      this.computeStats();
      this.applyFilter();
    }
  }

  loadAvis(structureId: string) {
    this.loading = true;
    this.avisService.getAvisByStructure(structureId).subscribe({
      next: (data: any) => {
        this.allAvis = data;
        this.computeStats();
        this.applyFilter();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des avis', err);
        this.loading = false;
      }
    });
  }

  computeStats() {
    const total = this.allAvis.length;
    this.stats.total = total;

    // Reset distribution
    this.stats.distribution.forEach(d => { d.count = 0; d.percentage = 0; });

    if (total === 0) {
      this.stats.average = 0;
      return;
    }

    let sum = 0;
    this.allAvis.forEach(a => {
      sum += a.note;
      const distItem = this.stats.distribution.find(d => d.rating === Math.round(a.note));
      if (distItem) distItem.count++;
    });

    this.stats.average = parseFloat((sum / total).toFixed(1));
    this.stats.distribution.forEach(d => {
      d.percentage = Math.round((d.count / total) * 100);
    });
  }

  setFilter(rating: number | null) {
    if (this.activeFilter === rating) {
      this.activeFilter = null;
    } else {
      this.activeFilter = rating;
    }
    this.applyFilter();
  }

  applyFilter() {
    if (this.activeFilter === null) {
      this.filteredAvis = [...this.allAvis];
    } else {
      this.filteredAvis = this.allAvis.filter(a => Math.round(a.note) === this.activeFilter);
    }
  }

  toggleReadMore(id: string | undefined) {
    if (!id) return;
    if (this.expandedComments.has(id)) {
      this.expandedComments.delete(id);
    } else {
      this.expandedComments.add(id);
    }
  }

  isExpanded(id: string | undefined): boolean {
    return id ? this.expandedComments.has(id) : false;
  }

  signalerAvis(avisId: string | undefined): void {
    if (!avisId) return;
    this.avisService.signalerAvis(avisId).subscribe({
      next: () => {
        // We dont filter anymore as per user request
        // this.allAvis = this.allAvis.filter(a => a.id !== avisId);
        // this.applyFilter();
      },
      error: (err) => console.error('Erreur lors du signalement', err)
    });
  }

  reply(avisId: string | undefined): void {
    if (!avisId) return;
    this.router.navigate(['reply'], { relativeTo: this.route, queryParams: { avisId } });
  }
}
