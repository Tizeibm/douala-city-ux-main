# Améliorations de Sécurité - Guide d'Implémentation

## 1. Migration localStorage → HttpOnly Cookies

### Problème Actuel
- Tokens stockés en localStorage → Vulnérable aux attaques XSS
- Pas de refresh token → Session longue durée avec risque élevé

### Solution Recommandée

#### Côté Backend (Backend doit implémenter ceci)
Le backend doit être modifié pour :

1. **Lors de la connexion**, envoyer TWO cookies (au lieu d'un token JSON) :
   ```
   Set-Cookie: accessToken=<JWT>; HttpOnly; Secure; SameSite=Strict; Max-Age=900
   Set-Cookie: refreshToken=<JWT>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
   ```

2. **Endpoint de refresh** : `/api/auth/refresh`
   - Input: None (cookie automatiquement envoyé)
   - Output: Nouveau accessToken (via cookie)

3. **Logout endpoint** : `/api/auth/logout`
   - Efface les cookies côté serveur

#### Côté Frontend (Implémentation proposée)

**File: `src/app/core/services/auth.service.ts`** - Mettre à jour

```typescript
// Remplacer le localStorage par un système de cookies
login(email: string, password: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/auth/login`, { email, password }, {
    withCredentials: true  // Important: envoyer les cookies
  }).pipe(
    tap(() => {
      this.estConnecte$.next(true);
      // Le token est maintenant dans les cookies HttpOnly, 
      // pas besoin de le stocker manuellement
    })
  );
}

logout(): Observable<void> {
  return this.http.post<void>(`${this.apiUrl}/auth/logout`, {}, {
    withCredentials: true
  }).pipe(
    tap(() => {
      this.estConnecte$.next(false);
    })
  );
}

refreshToken(): Observable<any> {
  return this.http.post(`${this.apiUrl}/auth/refresh`, {}, {
    withCredentials: true
  });
}
```

**File: `src/app/core/api.interceptor.ts`** - Mettre à jour

```typescript
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Envoyer les cookies automatiquement
  const clonedReq = req.clone({
    withCredentials: true  // Ajouter cette ligne
  });

  return next(clonedReq);
};
```

**File: `src/app/core/error.interceptor.ts`** - Mettre à jour

```typescript
// Lors d'une erreur 401, tenter un refresh
catchError((error: HttpErrorResponse) => {
  if (error.status === 401) {
    return authService.refreshToken().pipe(
      switchMap(() => next(req.clone({ withCredentials: true }))),
      catchError(() => {
        // Refresh échoué → logout
        window.location.href = '/login';
        return throwError(() => error);
      })
    );
  }
  // ...
});
```

### Checklist d'Implémentation

- [ ] Backend implémente les endpoints `/auth/login`, `/auth/refresh`, `/auth/logout`
- [ ] Backend envoie accessToken et refreshToken via HttpOnly cookies
- [ ] Frontend supprime le localStorage du token
- [ ] Frontend ajoute `withCredentials: true` dans les interceptors
- [ ] Frontend implémente la logique de refresh automatique
- [ ] CORS configué correctement (credentials: 'include')

## 2. Autres Améliorations de Sécurité Réalisées

### ✅ ErrorInterceptor Implémenté
- Gestion centralisée des erreurs HTTP
- Retry automatique avec exponential backoff
- Notifications utilisateur cohérentes
- Logout automatique sur 401

### ✅ ChangeDetectionStrategy.OnPush
- Améliore la performance
- Réduit les vecteurs d'attaque XSS

### ✅ Services Consolidés
- Moins de confusion d'implémentation
- Plus facile à auditer la sécurité

## 3. Recommendations Additionnelles

1. **CSP (Content Security Policy)** - À ajouter dans `index.html`
   ```html
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
   ```

2. **HSTS** - À configurer côté backend
   ```
   Strict-Transport-Security: max-age=31536000; includeSubDomains
   ```

3. **X-Content-Type-Options** - À configurer côté backend
   ```
   X-Content-Type-Options: nosniff
   ```

## 4. Testing de Sécurité

Après implémentation, tester :
1. Modifier le localStorage manuellement → Request doit échouer (pas de token)
2. Attendre 15 min (expiration accessToken) → Doit faire refresh automatiquement
3. Fermer la session backend → Doit redirect vers /login

---

**Status**: ⏳ En attente d'implémentation backend
**Priorité**: HAUTE - Mettre en place dès que possible
**Effort Estimé**: 2-3h (frontend) + 2-3h (backend)
