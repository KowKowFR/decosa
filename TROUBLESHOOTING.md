# Dépannage - Erreurs Turbopack

## Erreur: `inner_of_uppers_lost_follower`

Cette erreur est une erreur interne de Turbopack qui peut survenir lors du développement.

### Solutions rapides

1. **Nettoyer les caches** (déjà fait)

   ```bash
   rm -rf apps/web/.next
   rm -rf node_modules/.cache
   rm -rf .turbo
   ```

2. **Redémarrer le serveur de développement**

   ```bash
   # Arrêter le serveur (Ctrl+C)
   # Puis redémarrer
   bun run dev
   ```

3. **Réinstaller les dépendances** (si le problème persiste)

   ```bash
   rm -rf node_modules
   bun install
   ```

4. **Désactiver temporairement Turbopack** (solution de contournement)
   Dans `package.json`, modifier le script dev pour utiliser webpack :
   ```json
   "dev": "next dev"
   ```
   Au lieu de :
   ```json
   "dev": "next dev --turbo"
   ```

### Si le problème persiste

1. **Vérifier la version de Next.js**

   ```bash
   bun list next
   ```

2. **Mettre à jour Next.js** (si nécessaire)

   ```bash
   bun update next
   ```

3. **Vérifier les logs complets**
   - Regarder les erreurs dans la console
   - Vérifier les fichiers récemment modifiés
   - S'assurer qu'il n'y a pas de fichiers corrompus

### Solution alternative : Utiliser Webpack

Si Turbopack continue à poser problème, vous pouvez temporairement utiliser Webpack :

1. Modifier `apps/web/package.json` :

   ```json
   "dev": "next dev"
   ```

2. Ou ajouter dans `next.config.ts` :
   ```typescript
   const nextConfig: NextConfig = {
   	// ... autres configs
   	webpack: (config) => {
   		return config;
   	},
   };
   ```

### Notes

- Cette erreur est souvent liée à un problème de cache Turbopack
- Elle peut survenir après des modifications importantes de fichiers
- Le redémarrage du serveur résout généralement le problème
- Si le problème persiste, c'est probablement un bug de Turbopack qui sera corrigé dans une future version
