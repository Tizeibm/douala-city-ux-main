import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'doualacity';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollReveal();
    }
  }

  private initScrollReveal() {
    if (!isPlatformBrowser(this.platformId)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once revealed, we can stop observing this element
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.0, 
      rootMargin: '0px 0px -50px 0px' 
    });

    // Initial observation of existing elements
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Watch for dynamic elements added to the DOM
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            if (node.classList.contains('reveal')) {
              observer.observe(node);
            }
            node.querySelectorAll('.reveal').forEach(el => observer.observe(el));
          }
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }
}
