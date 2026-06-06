import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { InscriptionService, Utilisateur } from '../../auth/registration/services/inscription.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-user',
  standalone: false,
  templateUrl: './dashboard-user.component.html',
  styleUrl: './dashboard-user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardUserComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  utilisateur: Utilisateur | null = null;
  estConnecte: boolean = false;
  utilisateurNom: string | null = null;

  utilisateurId!: string;
  structures: any[] = [];
  nomUtilisateur: string | null = null;

  constructor(
    private authService: AuthService,
    private structureService: InscriptionService
  ) { }

  ngOnInit() {
    this.authService.estConnecte$.pipe(takeUntil(this.destroy$)).subscribe((etat) => this.estConnecte = etat);
    this.authService.utilisateur$.pipe(takeUntil(this.destroy$)).subscribe(u => {
      this.utilisateur = u;
    });
    this.authService.chargerUtilisateurDepuisStorage();
    this.utilisateurId = this.authService.getUtilisateurId();
    this.nomUtilisateur = this.authService.getNomUtilisateur();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    this.authService.logout();
  }
}
