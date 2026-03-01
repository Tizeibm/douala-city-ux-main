import { Component, Input, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Entreprise } from '../entreprise';
import { EntreprisesService } from '../admin/services/entreprises.service';
import { AvisService } from '../avis/services/avis.service';
import { Avis } from '../avis/models/avis';

@Component({
  selector: 'app-struct-details',
  standalone: false,
  templateUrl: './struct-details.component.html',
  styleUrl: './struct-details.component.scss'
})
export class StructDetailsComponent implements OnInit {

  moyenneAvis = 0;
  totalAvis = 0;
  avis: Avis[] = [];
  showAvisDrawer = false;


  open = {
    infos: true,
    horaires: false,
    avis: false,
    localisations: false,
    services: false
  }

  toggle(key: keyof typeof this.open) {

    this.open[key] = !this.open[key];

  }

  backendUrl = 'http://localhost:8080/';

  @Input() structure!: Entreprise;



  constructor(
    private route: ActivatedRoute,
    private entrepriseService: EntreprisesService,
    private avisService: AvisService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }




  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    let token: string | null = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token');
    }
    if (id) {
      this.entrepriseService.getEntreprisesById(token, id).subscribe({
        next: struct => {
          console.log(struct);
          this.structure = struct;
          this.loadAvisStats(id);
        },
        error: err => {
          console.error('[StructDetailsComponent] Error fetching structure:', err);
        }
      });
    }
  }

  loadAvisStats(structureId: string) {
    this.avisService.getAvisByStructure(structureId).subscribe({
      next: data => {
        this.avis = data;
        this.totalAvis = data.length;
        if (this.totalAvis > 0) {
          const sum = data.reduce((acc, curr) => acc + curr.note, 0);
          this.moyenneAvis = parseFloat((sum / this.totalAvis).toFixed(1));
        }
      },
      error: err => {
        console.error('[StructDetailsComponent] Error fetching avis stats:', err);
      }
    });
  }

  donnerAvis(): void {
    this.showAvisDrawer = true;
  }

  closeAvisDrawer() {
    this.showAvisDrawer = false;
  }

  consulterAvis(): void {

    this.router.navigate(['avisList'], { relativeTo: this.route });
  }

  scrollToReviews() {
    const el = document.getElementById('reviews');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  share() {
    if (navigator.share && isPlatformBrowser(this.platformId)) {
      navigator.share({
        title: this.structure.nom,
        text: `Découvrez ${this.structure.nom} sur Douala City`,
        url: window.location.href
      }).catch(err => console.error('Error sharing', err));
    } else {
      // Fallback: Copy to clipboard
      if (isPlatformBrowser(this.platformId)) {
        navigator.clipboard.writeText(window.location.href);
        alert('Lien copié dans le presse-papiers !');
      }
    }
  }

  getPhotoUrl(photo: any): string {
    if (!photo) return '/assets/images/placeholder.jpg';
    if (photo.url) return photo.url;
    if (photo.filePath) return this.backendUrl + photo.filePath;
    if (photo.storedFileName) return this.backendUrl + 'uploads/' + photo.storedFileName;
    return '/assets/images/placeholder.jpg';
  }
}