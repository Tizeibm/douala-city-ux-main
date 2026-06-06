import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-about-page',
  standalone: false,
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutPageComponent {}
