# Backend API - Decosa

## Architecture

Le backend suit une architecture en couches :

```
routes/          → Définition des endpoints
  ├── posts.ts
  ├── comments.ts
  ├── likes.ts
  ├── reports.ts
  └── follows.ts

controllers/     → Gestion des requêtes HTTP
  ├── post.controller.ts
  ├── comment.controller.ts
  ├── like.controller.ts
  ├── report.controller.ts
  └── follow.controller.ts

services/        → Logique métier et accès aux données
  ├── post.service.ts
  ├── comment.service.ts
  ├── like.service.ts
  ├── report.service.ts
  └── follow.service.ts

middleware/      → Middlewares d'authentification et validation
  ├── auth.ts
  └── validation.ts

schemas/         → Schémas de validation Zod
  ├── post.ts
  ├── comment.ts
  ├── report.ts
  └── follow.ts
```

## Routes API

### Posts
- `GET /api/posts` - Liste des posts (pagination, recherche, filtrage)
- `GET /api/posts/:postId` - Détails d'un post
- `POST /api/posts` - Créer un post (authentifié)
- `PUT /api/posts/:postId` - Modifier un post (authentifié, propriétaire)
- `DELETE /api/posts/:postId` - Supprimer un post (authentifié, propriétaire)

### Comments
- `GET /api/comments/posts/:postId` - Liste des commentaires d'un post
- `POST /api/comments/posts/:postId` - Créer un commentaire (authentifié)
- `PUT /api/comments/:commentId` - Modifier un commentaire (authentifié, propriétaire)
- `DELETE /api/comments/:commentId` - Supprimer un commentaire (authentifié, propriétaire)

### Likes
- `POST /api/likes/posts/:postId` - Toggle like sur un post (authentifié)
- `POST /api/likes/comments/:commentId` - Toggle like sur un commentaire (authentifié)

### Reports
- `POST /api/reports` - Signaler un contenu (authentifié)
- `GET /api/reports` - Liste des signalements (authentifié, admin)
- `PUT /api/reports/:reportId` - Mettre à jour le statut (authentifié, admin)

### Follows
- `POST /api/follows/:userId` - Suivre un utilisateur (authentifié)
- `DELETE /api/follows/:userId` - Ne plus suivre (authentifié)
- `GET /api/follows/:userId/followers` - Liste des abonnés
- `GET /api/follows/:userId/following` - Liste des abonnements
- `GET /api/follows/:userId/check` - Vérifier si on suit (authentifié)

## Middlewares

### `requireAuth`
Vérifie que l'utilisateur est authentifié. Retourne 401 si non authentifié.

### `optionalAuth`
Récupère l'utilisateur s'il est authentifié, mais ne bloque pas la requête.

### `validateBody`, `validateQuery`, `validateParams`
Valide les données de la requête avec Zod. Retourne 400 en cas d'erreur.

## Sécurité

- Toutes les routes sensibles sont protégées par `requireAuth`
- Validation stricte des entrées avec Zod
- Soft delete pour les posts et commentaires
- Vérification de propriété avant modification/suppression
- CORS configuré pour l'origine frontend

## Variables d'environnement

```env
DATABASE_URL=postgresql://...
CORS_ORIGIN=http://localhost:3001
```

## Utilisation

```bash
# Développement
bun run dev

# Build
bun run build

# Production
bun run start
```

