import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Entreprise } from '../../../shared/models/entreprise';
import { EntrepriseService } from '../../../core/services/entreprises.service';
import { InscriptionService, Utilisateur } from '../../auth/registration/services/inscription.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { EntreprisesService } from '../../../admin/services/entreprises.service';
import { HapticService } from '../../../core/services/haptic.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-entreprise',
  standalone: false,
  templateUrl: './entreprise.component.html',
  styleUrl: './entreprise.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntrepriseComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  utilisateur: Utilisateur | null = null;
  estConnecte: boolean = false;
  utilisateurNom: string | null = null;

  utilisateurId!: string;
  structures: any[] = [];
  nomUtilisateur: string | null = null;

  search: string = '';
  filtered: Entreprise[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;

  constructor(private entrepriseService: EntrepriseService,
    private structService: EntreprisesService,
    private structureService: InscriptionService,
    private authService: AuthService,
    private router: Router,
    private haptic: HapticService
  ) { }

  logout() {
    this.authService.logout();
  }

  entreprises: Entreprise[] = [];
  loading = true;

  ngOnInit(): void {
    this.authService.estConnecte$.pipe(takeUntil(this.destroy$)).subscribe((etat) => this.estConnecte = etat);
    this.authService.utilisateur$.pipe(takeUntil(this.destroy$)).subscribe(u => {
      this.utilisateur = u;
    });
    this.authService.chargerUtilisateurDepuisStorage();
    this.utilisateurId = this.authService.getUtilisateurId();
    this.nomUtilisateur = this.authService.getNomUtilisateur();
    this.chargerEntreprises();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  chargerEntreprises(): void {
    const utilisateurStr = localStorage.getItem('utilisateur');
    const token = localStorage.getItem('token');

    if (utilisateurStr) {
      const utilisateur = JSON.parse(utilisateurStr);
      const utilisateurId: string | undefined = utilisateur?.id;

      if (utilisateurId !== undefined) {
        this.entrepriseService.getMesEntreprises().subscribe({
          next: (data: Entreprise[]) => {
            this.entreprises = data;
            this.structService.setEntreprises(this.filtered);
            this.loading = false;
          },
          error: (err: any) => {
            console.error('Erreur lors du chargement des entreprises :', err);
            this.loading = false;
          }
        });
      } else {
        console.error('ID utilisateur non disponible');
        this.loading = false;
      }
    } else {
      console.error('Utilisateur non trouvé dans le storage');
      this.loading = false;
    }
  }

  get entreprisesValidees(): Entreprise[] {
    return this.filtered.filter(e => e.status === 'VALIDE');
  }

  get entreprisesEnAttente(): Entreprise[] {
    return this.filtered.filter(e => e.status === 'EN_ATTENTE');
  }

  get filteredStructures(): Entreprise[] {
    this.filtered = this.entreprises.filter(s => s.nom.toLowerCase().includes(
      this.search.toLowerCase()));
    this.structService.setEntreprises(this.filtered);
    this.structService.ent$.subscribe(data => {
      this.filtered = data;
    });
    this.totalPages = this.filtered.length && Math.ceil(this.filtered.length / this.itemsPerPage);

    console.log(this.totalPages);
    // Reset to first page after filtering
    this.updatePaginatedStructures();
    this.loading = false;
    return this.filtered;
  }

  updatePaginatedStructures(): void {
    this.structService.page$.subscribe((page: any) => {
      this.currentPage = page;
    });
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.structService.ent$.subscribe(data => {
      this.filtered = data;
      this.filtered = this.filtered.slice(startIndex, endIndex);
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.structService.setPage(this.currentPage);
      this.updatePaginatedStructures();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.structService.setPage(this.currentPage);
      this.updatePaginatedStructures();
    }
  }

  consulter(entreprise: Entreprise) {
    this.haptic.navigation();
    this.router.navigate(['/dashboard-user/structures', entreprise.id]);
  }

  modifier(s: Entreprise) {
    this.router.navigate(['/dashboard-user/structures', s.id, 'modifier']);
  }

  supprimer(id: any) {
    const token = localStorage.getItem('token');
    this.structService.deleteEntreprise(token, id).subscribe(() => {
      this.chargerEntreprises();
      this.updatePaginatedStructures();
    });
  }
}
