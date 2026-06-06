import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-contact-page',
  standalone: false,
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactPageComponent {}
