import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { CookieConsentService } from '../../services/cookie-consent.service';

@Component({
    selector: 'app-cookie-banner',
    templateUrl: './cookie-banner.component.html',
    styleUrls: ['./cookie-banner.component.scss'],
    standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookieBannerComponent {
    showBanner$: Observable<boolean>;

    constructor(private cookieConsentService: CookieConsentService) {
        this.showBanner$ = this.cookieConsentService.showBanner$;
    }

    accept() {
        this.cookieConsentService.acceptCookies();
    }

    reject() {
        this.cookieConsentService.rejectCookies();
    }
}
