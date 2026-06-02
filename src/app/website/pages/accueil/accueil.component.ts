import { Component, OnInit, OnDestroy, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { EntrepriseService } from '../../../core/services/entreprises.service';
import { AnnonceService } from '../../../features/annonces/annonces/services/annonce.service';
import { Entreprise } from '../../../shared/models/entreprise';
import { Annonce } from '../../../features/annonces/annonces/models/annonce';
import { environment } from '../../../../environments/environment';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

interface QuickCategory {
  icon: string;
  label: string;
  route: string;
}

interface HowItWorksStep {
  icon: string;
  title: string;
  description: string;
}

interface CommunityStat {
  icon: string;
  value: string;
  label: string;
}

@Component({
  selector: 'app-accueil',
  standalone: false,
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.scss'
})
export class AccueilComponent implements OnInit, OnDestroy, AfterViewInit {
  searchQuery: string = '';
  searchZone: string = '';

  featuredStructures: Entreprise[] = [];
  recentAnnonces: Annonce[] = [];
  loading = true;
  apiUrl = environment.apiUrl;

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;
  suggestedStructures: Entreprise[] = [];
  isSuggestionsVisible = false;

  // ─── Quick Categories Data ──────────────────────────────────
  quickCategories: QuickCategory[] = [
    { icon: 'fas fa-utensils', label: 'Restaurants', route: '/categories/restauration' },
    { icon: 'fas fa-heartbeat', label: 'Santé', route: '/categories/sante' },
    { icon: 'fas fa-shopping-bag', label: 'Shopping', route: '/categories/commerces' },
    { icon: 'fas fa-car', label: 'Transport', route: '/categories/transport' },
    { icon: 'fas fa-bed', label: 'Hôtels', route: '/categories/hebergement' },
    { icon: 'fas fa-briefcase', label: 'Services', route: '/categories/services' },
    { icon: 'fas fa-graduation-cap', label: 'Éducation', route: '/categories/education' },
    { icon: 'fas fa-ticket-alt', label: 'Loisirs', route: '/categories/loisirs' }
  ];

  // ─── How It Works Steps ─────────────────────────────────────
  howItWorksSteps: HowItWorksStep[] = [
    {
      icon: 'fa-search',
      title: 'Cherchez',
      description: 'Tapez ce que vous cherchez et laissez-nous trouver les meilleurs résultats à Douala.'
    },
    {
      icon: 'fa-star-half-alt',
      title: 'Comparez',
      description: 'Comparez les avis, photos et informations pour faire le meilleur choix.'
    },
    {
      icon: 'fa-phone-alt',
      title: 'Contactez',
      description: 'Appelez directement, consultez l\'itinéraire ou visitez le site web.'
    }
  ];

  // ─── Community Stats ────────────────────────────────────────
  communityStats: CommunityStat[] = [
    { icon: 'fa-store', value: '—', label: 'Entreprises locales' },
    { icon: 'fa-users', value: '—', label: 'Visiteurs mensuels' },
    { icon: 'fa-star', value: '—', label: 'Avis vérifiés' }
  ];

  // ─── Scroll Observer ────────────────────────────────────────
  private scrollObserver!: IntersectionObserver;

  getPhotoUrl(photo: any): string {
    if (!photo?.id) return '';
    return `${this.apiUrl}/photos/public/${photo.id}/thumbnail`;
  }

  constructor(
    private router: Router,
    private entrepriseService: EntrepriseService,
    private annonceService: AnnonceService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.loadData();
    this.setupAutosuggest();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.setupScrollReveal();
    }
  }

  // ─── Scroll Reveal with Staggered Animations ───────────────
  setupScrollReveal() {
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    };

    this.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          this.scrollObserver.unobserve(entry.target);
        }
      });
    }, options);

    // Observe all scroll-section elements
    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach(section => this.scrollObserver.observe(section));
  }

  // ─── Autosuggest ────────────────────────────────────────────
  setupAutosuggest() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 2) {
          this.suggestedStructures = [];
          this.isSuggestionsVisible = false;
          return [];
        }
        return this.entrepriseService.searchEntreprises(query, this.searchZone, 0, 5);
      })
    ).subscribe({
      next: (res: any) => {
        if (res && res.content) {
          this.suggestedStructures = res.content;
          this.isSuggestionsVisible = this.suggestedStructures.length > 0;
        }
      },
      error: () => this.isSuggestionsVisible = false
    });
  }

  onSearchInput() {
    this.searchSubject.next(this.searchQuery);
  }

  selectSuggestion(structure: Entreprise) {
    this.onViewStructure(structure);
  }

  hideSuggestions() {
    setTimeout(() => this.isSuggestionsVisible = false, 200);
  }

  // ─── Data Loading ───────────────────────────────────────────
  loadData() {
    this.loading = true;
    this.entrepriseService.getStructures(0, 4).subscribe({
      next: (res) => {
        this.featuredStructures = res.content || [];
      },
      error: (err: any) => console.error('Error fetching structures', err)
    });

    this.annonceService.getAnnonces(0, 3).subscribe({
      next: (res) => {
        this.recentAnnonces = res.content || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching annonces', err);
        this.loading = false;
      }
    });

    // Load dynamic stats
    this.entrepriseService.getStructures(0, 1).subscribe({
      next: (res: any) => {
        const total = res.totalElements || 0;
        this.communityStats[0].value = total > 0 ? total.toLocaleString('fr-FR') + '+' : '0';
      }
    });
    this.annonceService.getAnnonces(0, 1).subscribe({
      next: (res: any) => {
        const total = res.totalElements || 0;
        this.communityStats[2].value = total > 0 ? total.toLocaleString('fr-FR') : '0';
      }
    });
  }

  // ─── Navigation ─────────────────────────────────────────────
  onSearch() {
    this.router.navigate(['/resultats'], {
      queryParams: {
        q: this.searchQuery,
        zone: this.searchZone
      }
    });
  }

  getAnnonceId(annonce: any): string {
    return annonce.id || annonce.idAnnonce || annonce.uuid || '';
  }

  onViewStructure(structure: any) {
    const id = structure.id || structure.idStructure || structure.uuid;
    if (id) {
      this.router.navigate(['/structdet', id]);
    } else {
      console.error('No ID found for structure:', structure);
    }
  }

  ngOnDestroy() {
    if (this.searchSubscription) this.searchSubscription.unsubscribe();
    if (this.scrollObserver) this.scrollObserver.disconnect();
  }
}
