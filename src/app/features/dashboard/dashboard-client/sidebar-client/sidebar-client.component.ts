import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-sidebar-client',
    templateUrl: './sidebar-client.component.html',
    styleUrls: ['../../sidebar-user/sidebar-user.component.scss'],
    standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarClientComponent {
}
