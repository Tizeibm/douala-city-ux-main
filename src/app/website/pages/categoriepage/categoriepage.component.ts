import { Component } from '@angular/core';

@Component({
  selector: 'app-categoriepage',
  standalone: false,
  templateUrl: './categoriepage.component.html',
  styleUrl: './categoriepage.component.scss'
})
export class CategoriepageComponent {

  categories= [
    {
      icon: 'fas fa-utensils',
      name: 'Restaurants'
    },
    {
      icon: 'fas fa-bed',
      name: 'Hôtels'
    },
    {
      icon: 'fas fa-briefcase',
      name: 'Entreprises'
    },
    {
      icon: 'fas fa-graduation-cap',
      name: 'Education'
    },
    {
      icon: 'fas fa-hospital',
      name: 'Santé'
    },
    {
      icon: 'fas fa-bus',
      name: 'Transports'
    },
    {
      icon: 'fas fa-tshirt',
      name: 'Mode'
    },
    {
      icon: 'fas fa-cogs',
      name: 'Services divers'
    }
  ];
}
