import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accueil',
  standalone: false,
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.scss'
})
export class AccueilComponent implements OnInit {
  searchQuery: string = '';
  searchZone: string = '';

  constructor(private router: Router) { }

  ngOnInit() {
  }

  onSearch() {
    this.router.navigate(['/resultats'], {
      queryParams: {
        q: this.searchQuery,
        zone: this.searchZone
      }
    });
  }
}
