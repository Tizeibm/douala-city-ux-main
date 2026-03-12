import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-dashboard-client',
    templateUrl: './dashboard-client.component.html',
    styleUrls: ['../dashboard-user/dashboard-user.component.scss'],
    standalone: false
})
export class DashboardClientComponent implements OnInit {
    utilisateur: any;

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        const userRole = this.authService.getRole();
        this.authService.utilisateur$.subscribe((user: any) => {
            this.utilisateur = user;
        });
    }
}
