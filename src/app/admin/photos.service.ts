import { Injectable } from '@angular/core';
import { Photo } from '../entreprise';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhotosService {

  private photosSubject = new BehaviorSubject<Photo[]>([]);
  photos$ = this.photosSubject.asObservable();

  setphotos(photos: Photo[]) {
    this.photosSubject.next(photos);
  }

  addphotos(photo: Photo) {
    const current = this.photosSubject.value;
    this.photosSubject.next([...current, photo]);
  }

  updatePhoto(updated: Photo) {
    const current = this.photosSubject.value.map(pho =>
      pho.id === updated.id ? updated : pho
    );
    this.photosSubject.next(current);
  }

  deletePhoto(id: string) {
    const current = this.photosSubject.value.filter(pho => pho.id !== id);
    this.photosSubject.next(current);
  }
}
