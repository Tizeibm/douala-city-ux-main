import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CookieConsentService {
    private readonly CONSENT_KEY = 'douala_city_cookie_consent';
    private readonly VISITOR_HASH_KEY = 'douala_city_visitor_hash';

    private showBannerSubject = new BehaviorSubject<boolean>(false);
    showBanner$ = this.showBannerSubject.asObservable();

    private consentGivenSubject = new BehaviorSubject<boolean>(false);
    consentGiven$ = this.consentGivenSubject.asObservable();

    private isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) platformId: Object) {
        this.isBrowser = isPlatformBrowser(platformId);
        this.checkConsent();
    }

    private checkConsent() {
        if (this.isBrowser) {
            const consent = localStorage.getItem(this.CONSENT_KEY);
            if (consent === null) {
                // First visit, show banner
                this.showBannerSubject.next(true);
            } else if (consent === 'true') {
                this.consentGivenSubject.next(true);
                this.ensureVisitorHash();
            } else {
                this.consentGivenSubject.next(false);
            }
        }
    }

    acceptCookies() {
        if (this.isBrowser) {
            localStorage.setItem(this.CONSENT_KEY, 'true');
            this.ensureVisitorHash();
            this.showBannerSubject.next(false);
            this.consentGivenSubject.next(true);
        }
    }

    rejectCookies() {
        if (this.isBrowser) {
            localStorage.setItem(this.CONSENT_KEY, 'false');
            localStorage.removeItem(this.VISITOR_HASH_KEY); // clean up if they previously accepted
            this.showBannerSubject.next(false);
            this.consentGivenSubject.next(false);
        }
    }

    getVisitorHash(): string | null {
        if (this.isBrowser && this.hasConsent()) {
            return localStorage.getItem(this.VISITOR_HASH_KEY);
        }
        return null;
    }

    hasConsent(): boolean {
        if (!this.isBrowser) return false;
        return localStorage.getItem(this.CONSENT_KEY) === 'true';
    }

    private ensureVisitorHash() {
        if (this.isBrowser) {
            let hash = localStorage.getItem(this.VISITOR_HASH_KEY);
            if (!hash) {
                hash = this.generateUUID();
                localStorage.setItem(this.VISITOR_HASH_KEY, hash);
            }
        }
    }

    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
