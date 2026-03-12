import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Horaire } from '../../shared/models/entreprise';

@Injectable({
  providedIn: 'root'
})
export class HorairesService {

  private horairesSubject = new BehaviorSubject<Horaire[]>([]);
  horaires$ = this.horairesSubject.asObservable();

  setHoraires(horaires: Horaire[]) {

    this.horairesSubject.next(horaires);
  }

  addHoraire(horaire: Horaire) {
    const current = this.horairesSubject.value;
    this.horairesSubject.next([...current, horaire]);
  }

  updateHoraire(updated: Horaire) {
    const current = this.horairesSubject.value.map(h => h.id === updated.id ? { ...updated } : { ...h });
    this.horairesSubject.next(current);

  }

  deleteHoraire(id: string) {
    const current = this.horairesSubject.value.filter(hor => hor.id !== id);
    this.horairesSubject.next(current);
  }
}
