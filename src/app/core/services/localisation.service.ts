import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Localisation } from '../../shared/models/entreprise';

@Injectable({ providedIn: 'root' })
export class LocalisationStateService {
  private localisationsSubject = new BehaviorSubject<Localisation[]>([]);
  localisations$ = this.localisationsSubject.asObservable();

  setLocalisations(localisations: Localisation[]) {
    this.localisationsSubject.next(localisations);
  }

  addLocalisation(newLoc: Localisation) {
    const current = this.localisationsSubject.value;
    this.localisationsSubject.next([...current, newLoc]);
  }

  updateLocalisation(updated: Localisation) {
    const current = this.localisationsSubject.value.map(loc =>
      loc.id === updated.id ? updated : loc
    );
    this.localisationsSubject.next(current);
  }

  deleteLocalisation(id: string) {
    const current = this.localisationsSubject.value.filter(loc => loc.id !== id);
    this.localisationsSubject.next(current);
  }
}
