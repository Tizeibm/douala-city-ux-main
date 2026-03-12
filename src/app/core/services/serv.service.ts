import { Injectable } from '@angular/core';
import { ServiceOffert } from '../../shared/models/entreprise';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServService {



  private serviceSubject = new BehaviorSubject<ServiceOffert[]>([]);
  services$ = this.serviceSubject.asObservable();

  setServices(services: ServiceOffert[]) {
    this.serviceSubject.next(services);
  }

  addService(service: ServiceOffert) {
    const current = this.serviceSubject.value;
    this.serviceSubject.next([...current, service]);
  }

  updateService(updated: ServiceOffert) {
    const current = this.serviceSubject.value.map(serv =>
      serv.id === updated.id ? updated : serv
    );
    this.serviceSubject.next(current);
  }

  deleteService(id: string) {
    const current = this.serviceSubject.value.filter(serv => serv.id !== id);
    this.serviceSubject.next(current);
  }
}


