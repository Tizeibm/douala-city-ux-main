import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-privacy-page',
  standalone: false,
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPageComponent {}
