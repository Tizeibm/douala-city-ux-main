import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-appli',
  standalone: false,
  templateUrl: './appli.component.html',
  styleUrl: './appli.component.scss'
})
export class AppliComponent implements OnInit {
  isDashboard: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.isDashboard = url.includes('/dashboard-user') || url.includes('/admin');
    });
  }
}
