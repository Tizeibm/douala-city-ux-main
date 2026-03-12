import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';
import { Utilisateur } from '../features/auth/registration/services/inscription.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  let role: string = 'SOLO';


  if (!authService.isLoggedIn()) {
    if (state.url.startsWith('/admin')) {
      router.navigate(['/admin/login']);

    }
    else {
      router.navigate(['/login']);


    }
    return false;
  }

  role = authService.getRole() || "USER"; // Default to USER if not set

  const expectedRoles: string[] = route.data?.['expectedRoles'] || [];

  if (expectedRoles.length > 0 && !expectedRoles.includes(role)) {
    console.log(`Access denied for role: ${role}. Expected: ${expectedRoles}`);
    if (role === 'USER') {
      router.navigate(['/accueil']); // Regular users go to home
    } else {
      router.navigate(['/login']);
    }
    return false;
  }

  // Handle specific redirects based on role if needed, but return true if access is allowed
  return true;
};
