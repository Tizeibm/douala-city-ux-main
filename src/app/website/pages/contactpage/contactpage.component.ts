import { Component } from '@angular/core';

@Component({
  selector: 'app-contactpage',
  standalone: false,
  templateUrl: './contactpage.component.html',
  styleUrl: './contactpage.component.scss'
})
export class ContactpageComponent {

  sendMessage(){
    alert('votre message a été envoyé avec succès !');
  }

}
