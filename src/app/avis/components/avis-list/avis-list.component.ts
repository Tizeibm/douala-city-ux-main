import { Component, OnInit } from '@angular/core';
import { Avis } from '../../models/avis';
import { ActivatedRoute, Router } from '@angular/router';
import { AvisService } from '../../services/avis.service';

@Component({
  selector: 'app-avis-list',
  standalone: false,
  templateUrl: './avis-list.component.html',
  styleUrl: './avis-list.component.scss'
})
export class AvisListComponent implements OnInit {

  avis: Avis[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private avisService: AvisService
  ) { }

  ngOnInit(): void {
    // Check current route for id (if embedded) or parent route (if routed)
    const id = this.route.snapshot.paramMap.get('id') || this.route.parent?.snapshot.paramMap.get('id');
    if (id) {
      this.loadAvis(id);

      this.avisService.avisAdded$.subscribe(() => {
        this.loadAvis(id);
      });
    }
  }

  loadAvis(structureId: string) {
    this.loading = true;
    this.avisService.getAvisByStructure(structureId).subscribe({
      next: (data) => {
        this.avis = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des avis', err);
        this.loading = false;
      }
    });
  }

  deleteAvis(avisId: string | undefined): void {
    if (!avisId) return;
    // Assuming signaler for now as delete is not in public API
    this.avisService.signalerAvis(avisId).subscribe(() => {
      this.avis = this.avis.filter(a => a.id !== avisId);
    });
  }

  reply(avisId: string | undefined): void {
    if (!avisId) return;
    this.router.navigate(['reply'], { relativeTo: this.route, queryParams: { avisId } });
  }

  editAvis(id: string | undefined): void {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }
}
