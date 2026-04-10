import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-mobile-navbar',
  standalone: false,
  templateUrl: './mobile-navbar.html',
  styleUrl: './mobile-navbar.scss',
})
export class MobileNavbar implements OnInit {
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
  }
}
