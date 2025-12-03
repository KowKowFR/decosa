# Schéma de Base de Données - Decosa

Ce document décrit toutes les tables Prisma nécessaires pour l'application Decosa, une plateforme sociale minimaliste pour partager des articles et des idées.

## Structure des Fichiers

- `schema.prisma` - Configuration Prisma (generator, datasource)
- `auth.prisma` - Modèles d'authentification (User, Session, Account, Verification)
- `social.prisma` - Modèles sociaux (Post, Comment, Like, Report, Follow)

## Tables d'Authentification (déjà existantes)

Les tables suivantes sont déjà définies dans `auth.prisma` :

- `User` - Utilisateurs
- `Session` - Sessions utilisateur
- `Account` - Comptes d'authentification
- `Verification` - Vérifications d'email

## Tables à Ajouter

### 1. Post (Articles/Posts)

Table principale pour stocker les articles publiés par les utilisateurs.

**Champs :**

- `id` : Identifiant unique (CUID)
- `title` : Titre du post
- `content` : Contenu du post (texte long)
- `image` : URL optionnelle de l'image
- `authorId` : Référence à l'utilisateur auteur
- `createdAt` : Date de création
- `updatedAt` : Date de dernière modification
- `deletedAt` : Date de suppression (soft delete)

**Relations :**

- Un post appartient à un utilisateur (auteur)
- Un post peut avoir plusieurs likes
- Un post peut avoir plusieurs commentaires
- Un post peut avoir plusieurs signalements

**Index :**

- `authorId` : Pour récupérer les posts d'un utilisateur
- `createdAt` : Pour trier par date de création
- `deletedAt` : Pour filtrer les posts supprimés

---

### 2. Comment (Commentaires)

Table pour stocker les commentaires sur les posts.

**Champs :**

- `id` : Identifiant unique
- `content` : Contenu du commentaire
- `postId` : Référence au post commenté
- `authorId` : Référence à l'utilisateur auteur
- `createdAt` : Date de création
- `updatedAt` : Date de dernière modification
- `deletedAt` : Date de suppression (soft delete)

**Relations :**

- Un commentaire appartient à un post
- Un commentaire appartient à un utilisateur (auteur)
- Un commentaire peut avoir plusieurs likes
- Un commentaire peut avoir plusieurs signalements

**Index :**

- `postId` : Pour récupérer les commentaires d'un post
- `authorId` : Pour récupérer les commentaires d'un utilisateur
- `createdAt` : Pour trier par date

---

### 3. Like (Likes sur Posts)

Table pour stocker les likes des utilisateurs sur les posts.

**Champs :**

- `id` : Identifiant unique
- `postId` : Référence au post liké
- `userId` : Référence à l'utilisateur qui a liké
- `createdAt` : Date du like

**Contraintes :**

- Un utilisateur ne peut liker un post qu'une seule fois (contrainte unique `[postId, userId]`)

**Index :**

- `postId` : Pour compter les likes d'un post
- `userId` : Pour récupérer les posts likés par un utilisateur

---

### 4. CommentLike (Likes sur Commentaires)

Table pour stocker les likes des utilisateurs sur les commentaires.

**Champs :**

- `id` : Identifiant unique
- `commentId` : Référence au commentaire liké
- `userId` : Référence à l'utilisateur qui a liké
- `createdAt` : Date du like

**Contraintes :**

- Un utilisateur ne peut liker un commentaire qu'une seule fois (contrainte unique `[commentId, userId]`)

**Index :**

- `commentId` : Pour compter les likes d'un commentaire
- `userId` : Pour récupérer les commentaires likés par un utilisateur

---

### 5. Report (Signalements)

Table pour stocker les signalements de posts ou commentaires.

**Champs :**

- `id` : Identifiant unique
- `reason` : Raison du signalement
- `type` : Type de contenu signalé (POST ou COMMENT) - enum `ReportType`
- `postId` : Référence au post signalé (si type = POST)
- `commentId` : Référence au commentaire signalé (si type = COMMENT)
- `reporterId` : Référence à l'utilisateur qui signale
- `status` : Statut du signalement (PENDING, REVIEWED, RESOLVED, DISMISSED) - enum `ReportStatus`
- `reviewedBy` : ID de l'admin qui a traité
- `reviewedAt` : Date de traitement
- `notes` : Notes de l'admin
- `createdAt` : Date de création
- `updatedAt` : Date de dernière modification

**Contraintes :**

- Soit `postId` soit `commentId` doit être défini (mais pas les deux)

**Index :**

- `postId` : Pour récupérer les signalements d'un post
- `commentId` : Pour récupérer les signalements d'un commentaire
- `reporterId` : Pour récupérer les signalements d'un utilisateur
- `status` : Pour filtrer les signalements par statut

**Enums :**

- `ReportType` : POST, COMMENT
- `ReportStatus` : PENDING, REVIEWED, RESOLVED, DISMISSED

---

### 6. Follow (Relations de Suivi)

Table pour gérer les relations de suivi entre utilisateurs.

**Champs :**

- `id` : Identifiant unique
- `followerId` : Utilisateur qui suit
- `followingId` : Utilisateur suivi
- `createdAt` : Date de création de la relation

**Contraintes :**

- Un utilisateur ne peut suivre un autre utilisateur qu'une seule fois (contrainte unique `[followerId, followingId]`)
- Un utilisateur ne peut pas se suivre lui-même (à gérer au niveau applicatif)

**Index :**

- `followerId` : Pour récupérer les abonnements d'un utilisateur
- `followingId` : Pour récupérer les abonnés d'un utilisateur

---

## Mise à jour du modèle User

Le modèle `User` existant dans `auth.prisma` doit être étendu pour inclure les nouvelles relations et le champ `bio` :

**Nouveau champ à ajouter :**

- `bio` : Biographie optionnelle de l'utilisateur (`String?` avec `@db.Text`)

**Nouvelles relations à ajouter :**

- `posts` : Posts créés par l'utilisateur (`Post[]` avec relation `"PostAuthor"`)
- `comments` : Commentaires créés par l'utilisateur (`Comment[]` avec relation `"CommentAuthor"`)
- `postLikes` : Posts likés par l'utilisateur (`Like[]` avec relation `"PostLikes"`)
- `commentLikes` : Commentaires likés par l'utilisateur (`CommentLike[]` avec relation `"CommentLikes"`)
- `reports` : Signalements créés par l'utilisateur (`Report[]` avec relation `"Reports"`)
- `followers` : Utilisateurs qui suivent cet utilisateur (`Follow[]` avec relation `"Followers"`)
- `following` : Utilisateurs suivis par cet utilisateur (`Follow[]` avec relation `"Following"`)

---

## Soft Delete

Les modèles `Post` et `Comment` utilisent un soft delete avec le champ `deletedAt`. Cela permet de :

- Conserver les données pour des raisons légales/analytiques
- Permettre la restauration de contenu
- Masquer le contenu sans le supprimer définitivement

**Note :** Les requêtes doivent filtrer les enregistrements où `deletedAt IS NULL` pour exclure le contenu supprimé.

---

## Relations et Cascade

Toutes les relations utilisent `onDelete: Cascade` pour :

- Supprimer automatiquement les likes quand un post est supprimé
- Supprimer automatiquement les commentaires quand un post est supprimé
- Supprimer automatiquement les signalements quand un contenu est supprimé
- Supprimer automatiquement les relations de suivi quand un utilisateur est supprimé

---

## Commandes Prisma

Après avoir ajouté ces modèles, exécutez :

```bash
# Générer le client Prisma
bun run db:generate

# Appliquer les migrations
bun run db:push

# Ou créer une migration nommée
bun run db:migrate dev --name add_social_models
```

---

## Notes Importantes

1. **Contraintes d'unicité** : Les likes et follows utilisent des contraintes d'unicité pour éviter les doublons
2. **Soft Delete** : Les posts et commentaires utilisent `deletedAt` au lieu d'une suppression définitive
3. **Cascade Delete** : Toutes les relations sont configurées pour supprimer les données liées automatiquement
4. **Index** : Des index sont créés sur les champs fréquemment utilisés dans les requêtes
5. **Types d'enum** : Les signalements utilisent des enums pour garantir la cohérence des données
6. **Relations bidirectionnelles** : Toutes les relations sont définies des deux côtés (User ↔ Post, Post ↔ Comment, etc.)

---

## Exemples de Requêtes

### Récupérer les posts d'un utilisateur avec leurs likes et commentaires

```typescript
const posts = await prisma.post.findMany({
	where: {
		authorId: userId,
		deletedAt: null,
	},
	include: {
		author: true,
		likes: true,
		comments: {
			where: { deletedAt: null },
			include: { author: true },
		},
	},
	orderBy: { createdAt: "desc" },
});
```

### Récupérer les posts likés par un utilisateur

```typescript
const likedPosts = await prisma.post.findMany({
	where: {
		likes: {
			some: {
				userId: userId,
			},
		},
		deletedAt: null,
	},
	include: {
		author: true,
		_count: {
			select: { likes: true, comments: true },
		},
	},
});
```

### Récupérer les abonnements d'un utilisateur

```typescript
const following = await prisma.follow.findMany({
	where: {
		followerId: userId,
	},
	include: {
		following: true,
	},
});
```
