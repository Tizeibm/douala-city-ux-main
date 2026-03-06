import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Entreprise } from '../entreprise';
import { EntrepriseService } from '../services/entreprises.service';
import { InscriptionService, Utilisateur } from '../website/registration/services/inscription.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { EntreprisesService } from '../admin/services/entreprises.service';
import { HapticService } from '../core/services/haptic.service';

@Component({
  selector: 'app-entreprise',
  standalone: false,
  templateUrl: './entreprise.component.html',
  styleUrl: './entreprise.component.scss'
})
export class EntrepriseComponent {

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
    private haptic: HapticService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  logout() {
    this.authService.logout();
  }

  entreprises: Entreprise[] = [];
  loading = true;

  ngOnInit(): void {
    this.authService.estConnecte$.subscribe((etat) => this.estConnecte = etat);
    this.authService.utilisateur$.subscribe(u => {
      this.utilisateur = u;
    });
    this.authService.chargerUtilisateurDepuisStorage();
    this.utilisateurId = this.authService.getUtilisateurId();
    this.nomUtilisateur = this.authService.getNomUtilisateur();
    this.chargerEntreprises();
  }

  chargerEntreprises(): void {
    if (isPlatformBrowser(this.platformId)) {
      const utilisateurStr = localStorage.getItem('utilisateur');
      const token = localStorage.getItem('token');

      if (utilisateurStr) {
        const utilisateur = JSON.parse(utilisateurStr);
        const utilisateurId: string | undefined = utilisateur?.id;

        if (utilisateurId !== undefined) {
          this.entrepriseService.getMesEntreprises(token).subscribe({
            next: (data: Entreprise[]) => {
              this.entreprises = data;
              this.structService.setEntreprises(this.filtered);
              console.log('Entreprises chargées:', this.filtered);
              this.loading = false;
            },
            error: (err) => {
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
    } else {
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
    this.structService.page$.subscribe(page => {
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

  supprimer(id: any) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      this.structService.deleteEntreprise(token, id).subscribe(() => {
        this.chargerEntreprises();
        this.updatePaginatedStructures();
      });
    }
  }
}
