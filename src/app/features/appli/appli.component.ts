import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-appli',
  standalone: false,
  templateUrl: './appli.component.html',
  styleUrl: './appli.component.scss'
})
export class AppliComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isDashboard: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.isDashboard = url.includes('/dashboard-user') || url.includes('/admin');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
