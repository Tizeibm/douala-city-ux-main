# Rapport de Sécurité : Authentification et Cookies HttpOnly

## Contexte Actuel
L'application DoualaCity utilise actuellement `localStorage` pour stocker le jeton JWT (JSON Web Token) et les informations de l'utilisateur. 

- **Token Storage** : `localStorage.getItem('token')`
- **Utilisation** : Le token est récupéré par le `apiInterceptor` et ajouté à l'en-tête `Authorization: Bearer <token>` de chaque requête HTTP vers l'API.

## localStorage vs Cookies HttpOnly

### localStorage (État Actuel)
- **Avantages** : Très facile à implémenter côté client (Angular). Pas de gestion complexe de CORS (Cross-Origin Resource Sharing) pour les cookies.
- **Inconvénients** : **Vulnérable aux attaques XSS** (Cross-Site Scripting). Si un script malveillant s'exécute sur la page, il peut lire le contenu du `localStorage` et voler le token de l'utilisateur.

### Cookies HttpOnly (Recommandé pour la Production)
- **Avantages** : **Immunisé contre le vol via XSS**. Le drapeau `HttpOnly` empêche tout script JavaScript d'accéder au cookie. Le navigateur envoie automatiquement le cookie avec les requêtes vers le domaine concerné.
- **Inconvénients** : Nécessite une configuration SSL/TLS (HTTPS) rigoureuse. Plus complexe à configurer avec des domaines différents (CORS).

## Analyse de l'Attaque XSS
Sur DoualaCity, les risques de XSS sont limités par l'utilisation d'Angular (qui échappe par défaut les sorties HTML), mais restent présents via :
1. Les commentaires/avis des utilisateurs (si mal filtrés côté serveur).
2. Les scripts tiers (analytics, widgets, etc.).

## Recommandations et Feuille de Route

### 1. Changements Backend (Indispensable)
Le serveur Spring Boot doit être modifié pour :
- Envoyer le token dans un cookie avec les drapeaux : `HttpOnly`, `Secure` (nécessite HTTPS), et `SameSite=Strict` ou `Lax`.
- Supprimer le renvoi du token dans le corps de la réponse JSON lors du login.

### 2. Changements Frontend
- Supprimer la logique du `apiInterceptor` qui ajoute manuellement le header `Authorization`.
- Configurer `HttpClient` pour utiliser `withCredentials: true` afin que les cookies soient envoyés avec les requêtes cross-origin.

### 3. Mesures Intermédiaires (Réalisées)
- **Content Security Policy (CSP)** : Nous recommandons de configurer des headers CSP pour limiter l'exécution de scripts non autorisés.
- **Validation stricte** : Toutes les entrées utilisateur (comme les avis) sont validées et nettoyées côté serveur avant d'être réaffichées.

## Conclusion
L'utilisation de `HttpOnly` est une **excellente pratique** que nous devrions viser pour la mise en production. Cependant, cela nécessite une coordination avec l'équipe Backend pour modifier la méthode d'émission et de réception des jetons.
