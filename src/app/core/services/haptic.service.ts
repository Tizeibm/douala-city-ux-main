import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HapticService {


  private canVibrate: boolean = typeof navigator!= 'undefined' && typeof navigator.vibrate ==='function';


  tap():void {
    this.vibrate(15);
  }

  navigation(): void {

    this.vibrate(20);
  }

  stepChange(): void {
    this.vibrate(30);
  }

  success(): void {
    this.vibrate([30, 20, 30]);
  }

  error() :void {
    this.vibrate(60);
  }
 
  private vibrate(pattern: number | number[]): void {
    if (this.canVibrate){
      navigator.vibrate(pattern);
    }
  }

}
