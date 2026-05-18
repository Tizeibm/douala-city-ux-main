import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntrepriseService } from '../../../core/services/entreprises.service';
import { AnnonceService } from '../../annonces/annonces/services/annonce.service';
import { Entreprise } from '../../../shared/models/entreprise';
import { Annonce } from '../../annonces/annonces/models/annonce';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-resultats',
  standalone: false,
  templateUrl: './resultats.component.html',
  styleUrl: './resultats.component.scss'
})
export class ResultatsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  searchQuery: string = '';
  searchZone: string = '';

  structures: Entreprise[] = [];
  annonces: Annonce[] = [];

  loading: boolean = true;
  totalFound: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entrepriseService: EntrepriseService,
    private annonceService: AnnonceService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.searchZone = params['zone'] || '';
      this.performSearch();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  performSearch() {
    this.loading = true;

    this.entrepriseService.searchEntreprises(this.searchQuery, this.searchZone, 0, 10).subscribe({
      next: (res: any) => {
        this.structures = res.content || res;
        this.totalFound = res.totalElements || this.structures.length;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur de recherche', err);
        this.loading = false;
      }
    });
  }

  getAnnonceIcon(type: string): string {
    switch (type) {
      case 'VENTE': return 'fa-shopping-cart';
      case 'PROMOTION': return 'fa-tag';
      case 'IMMOBILIER': return 'fa-home';
      case 'EVENEMENT': return 'fa-calendar-alt';
      case 'SERVICES': return 'fa-concierge-bell';
      case 'EMPLOI': return 'fa-briefcase';
      default: return 'fa-bullhorn';
    }
  }

  onStructureView(structure: any) {
    this.router.navigate(['/structdet', structure.id]);
  }
}
