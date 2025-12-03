# Configuration S3 pour le stockage d'images

## Installation

Installer les dépendances AWS SDK dans le serveur :

```bash
cd apps/server
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Variables d'environnement

Ajouter les variables suivantes dans votre fichier `.env` du serveur :

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

## Configuration du bucket S3

1. Créer un bucket S3 dans AWS
2. Configurer les permissions CORS pour permettre les uploads depuis le frontend :

```json
[
	{
		"AllowedHeaders": ["*"],
		"AllowedMethods": ["PUT", "POST", "GET", "DELETE"],
		"AllowedOrigins": ["http://localhost:3001", "https://yourdomain.com"],
		"ExposeHeaders": ["ETag"]
	}
]
```

3. Configurer la politique du bucket pour permettre les uploads et la lecture publique :

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "PublicReadGetObject",
			"Effect": "Allow",
			"Principal": "*",
			"Action": "s3:GetObject",
			"Resource": "arn:aws:s3:::your-bucket-name/*"
		}
	]
}
```

4. **Désactiver "Block public access"** :
   - Allez dans "Permissions" > "Block public access"
   - Cliquez sur "Edit"
   - Décochez "Block all public access" (ou au minimum, décochez "Block public access to buckets and objects granted through new access control lists (ACLs)")
   - Confirmez

**Note importante** : Les nouveaux buckets S3 utilisent souvent "Bucket owner enforced" pour l'Object Ownership, ce qui désactive les ACLs. Dans ce cas :

- L'accès public doit être géré uniquement via la bucket policy (étape 3)
- Le code n'utilise pas d'ACL car le bucket ne les permet pas
- Assurez-vous que "Block public access" est désactivé pour que la bucket policy fonctionne

## Structure des fichiers

Les images sont organisées comme suit :

- `users/{userId}/avatar-{timestamp}.{ext}` - Photos de profil
- `posts/{userId}/{postId}-{timestamp}.{ext}` - Images de posts

## Utilisation

### Upload d'une photo de profil

Le frontend demande une URL pré-signée, puis upload directement vers S3 :

```typescript
const { presignedUrl, publicUrl } = await api.upload.getPresignedUrl({
	filename: file.name,
	contentType: file.type,
	type: "avatar",
});

await fetch(presignedUrl, {
	method: "PUT",
	body: file,
	headers: { "Content-Type": file.type },
});
```

### Upload d'une image de post

Même processus avec `type: "post"` et un `postId` optionnel.

## Migration depuis base64

Les images stockées en base64 doivent être migrées vers S3. L'URL S3 sera stockée dans le champ `image` de la base de données (au lieu de la chaîne base64).
