import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FeedbackService {


  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ =this.loadingSubject.asObservable();

  private toastSubject = new BehaviorSubject<{
    message: string;
    type: 'success' | 'error'
  } | null>(null);

  toast$ = this.toastSubject.asObservable();

  showLoader(){
    this.loadingSubject.next(true);
  }

  hideLoader(){
    this.loadingSubject.next(false);
  }

  success(message: string){
 
    this.toastSubject.next({message, type:'success'});
   
  }

  error(message: string){
    
    this.toastSubject.next({message, type:'error'});
    
  }

  clear(){
    this.toastSubject.next(null);
  }
  
}
