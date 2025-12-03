# Dépannage S3 - Images non accessibles

## Vérification rapide

### 1. Vérifier l'URL générée

Dans les logs du serveur, vous devriez voir :

```
S3 upload completed: {
  bucket: 'decosa-storage',
  region: 'eu-west-3',
  key: 'users/.../avatar-....png',
  publicUrl: 'https://decosa-storage.s3.eu-west-3.amazonaws.com/...'
}
```

### 2. Tester l'URL directement

Copiez l'URL depuis les logs et ouvrez-la dans un nouvel onglet du navigateur. Si vous voyez :

- **403 Forbidden** → Le bucket n'est pas public
- **404 Not Found** → Le fichier n'existe pas ou l'URL est incorrecte
- **L'image s'affiche** → Le problème est côté frontend

## Configuration requise dans AWS S3

### Étape 1 : Désactiver "Block public access"

1. Allez dans la console AWS S3
2. Sélectionnez votre bucket `decosa-storage`
3. Onglet **"Permissions"**
4. Section **"Block public access (bucket settings)"**
5. Cliquez sur **"Edit"**
6. **Décochez toutes les cases** (ou au minimum décochez "Block public access to buckets and objects granted through new access control lists (ACLs)")
7. Cliquez sur **"Save changes"**
8. Confirmez en tapant `confirm`

### Étape 2 : Ajouter la Bucket Policy

1. Toujours dans **"Permissions"**
2. Section **"Bucket policy"**
3. Cliquez sur **"Edit"**
4. Collez cette politique (remplacez `decosa-storage` si votre bucket a un autre nom) :

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "PublicReadGetObject",
			"Effect": "Allow",
			"Principal": "*",
			"Action": "s3:GetObject",
			"Resource": "arn:aws:s3:::decosa-storage/*"
		}
	]
}
```

5. Cliquez sur **"Save changes"**

### Étape 3 : Vérifier Object Ownership

1. Dans **"Permissions"** > **"Object Ownership"**
2. Vérifiez que c'est configuré sur **"Bucket owner enforced"** (c'est normal et compatible)
3. Si c'est le cas, les ACLs sont désactivées (c'est pourquoi on n'utilise pas d'ACL dans le code)

## Test après configuration

1. Redémarrez le serveur
2. Uploadez une nouvelle image
3. Vérifiez les logs :
   - Dans la console du navigateur : "✅ Image is accessible and loaded"
   - Si erreur : "❌ Image failed to load" → Vérifiez la bucket policy
4. Ouvrez l'URL directement dans le navigateur pour tester

## Vérification de l'URL

L'URL générée doit être au format :

```
https://decosa-storage.s3.eu-west-3.amazonaws.com/users/USER_ID/avatar-TIMESTAMP.png
```

**PAS** `s3://decosa/...` (c'est le format interne AWS)

## Problèmes courants

### Erreur 403 Forbidden

- **Cause** : Block public access est activé OU bucket policy manquante
- **Solution** : Suivez les étapes 1 et 2 ci-dessus

### Erreur 404 Not Found

- **Cause** : L'URL est incorrecte ou le fichier n'existe pas
- **Solution** : Vérifiez les logs du serveur pour voir l'URL générée

### L'image s'affiche dans un nouvel onglet mais pas dans l'app

- **Cause** : Problème de cache ou de re-render React
- **Solution** : Vérifiez que `key={avatar}` est bien sur le composant Avatar
