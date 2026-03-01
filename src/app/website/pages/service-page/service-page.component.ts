import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-service-page',
  standalone: false,
  templateUrl: './service-page.component.html',
  styleUrl: './service-page.component.scss'
})
export class ServicePageComponent  {

  services=[
    {
      icon: 'fas fa-store',
      title: 'Annuaire des entreprises',
      description: 'Trouvez rapidement les entreprises et services disponibles dans la ville.'
    },
    {
      icon: 'fas fa-map-marked-alt',
      title: 'cartographie',
      description: 'Visualisez les entreprises et lieux sur la carte interactive.'
    },
    {
      icon: 'fas fa-bullhorn',
      title: 'Publicité locale',
      description: 'Faites connaître vos produits et services à un public ciblé'
    }

  ];



}
