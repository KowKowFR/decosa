# Guide de déploiement sur AWS EC2

Ce guide vous explique comment déployer votre application decosa sur une instance EC2 AWS.

## Prérequis

- Un compte AWS
- Une instance EC2 (Ubuntu 22.04 LTS recommandé)
- Un domaine (optionnel, pour HTTPS)
- Une base de données PostgreSQL (RDS ou sur l'instance EC2)
- Un bucket S3 configuré (voir `S3_SETUP.md`)

## Étape 1 : Préparer l'instance EC2

### 1.1 Créer une instance EC2

1. Connectez-vous à la console AWS
2. Allez dans EC2 → Launch Instance
3. Choisissez **Ubuntu Server 22.04 LTS**
4. Sélectionnez un type d'instance (t3.medium minimum recommandé)
5. Configurez le Security Group :
   - **Port 22 (SSH)** : Votre IP
   - **Port 80 (HTTP)** : 0.0.0.0/0
   - **Port 443 (HTTPS)** : 0.0.0.0/0
   - **Port 3000 (Backend)** : 127.0.0.1 (uniquement localhost)
   - **Port 3001 (Frontend)** : 127.0.0.1 (uniquement localhost)
6. Créez ou sélectionnez une Key Pair
7. Lancez l'instance

### 1.2 Se connecter à l'instance

```bash
ssh -i votre-key.pem ubuntu@VOTRE_IP_EC2
```

## Étape 2 : Installer les dépendances système

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Installer Node.js (pour certaines dépendances)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Installer PostgreSQL (si vous n'utilisez pas RDS)
sudo apt install -y postgresql postgresql-contrib

# Installer Nginx (reverse proxy)
sudo apt install -y nginx

# Installer PM2 (gestionnaire de processus)
sudo npm install -g pm2

# Installer Certbot (pour SSL)
sudo apt install -y certbot python3-certbot-nginx
```

## Étape 3 : Configurer PostgreSQL

### Si vous utilisez PostgreSQL sur EC2 :

```bash
# Démarrer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Créer un utilisateur et une base de données
sudo -u postgres psql

# Dans psql :
CREATE USER decosa WITH PASSWORD 'votre_mot_de_passe_securise';
CREATE DATABASE decosa OWNER decosa;
GRANT ALL PRIVILEGES ON DATABASE decosa TO decosa;
\q
```

### Si vous utilisez RDS :

Notez l'endpoint RDS et configurez-le dans les variables d'environnement.

## Étape 4 : Cloner et configurer le projet

```bash
# Installer Git si nécessaire
sudo apt install -y git

# Cloner votre repository
cd ~
git clone https://github.com/votre-username/decosa.git
cd decosa

# Installer les dépendances
bun install
```

## Étape 5 : Configurer les variables d'environnement

### 5.1 Variables d'environnement du serveur

Créez un fichier `.env` dans `apps/server/` :

```bash
cd apps/server
nano .env
```

```env
# Database
DATABASE_URL="postgresql://decosa:votre_mot_de_passe@localhost:5432/decosa?schema=public"
# Ou pour RDS :
# DATABASE_URL="postgresql://decosa:votre_mot_de_passe@votre-rds-endpoint:5432/decosa?schema=public"

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://votre-domaine.com

# Auth
GITHUB_CLIENT_ID=votre_github_client_id
GITHUB_CLIENT_SECRET=votre_github_client_secret

# AWS S3
AWS_ACCESS_KEY_ID=votre_access_key
AWS_SECRET_ACCESS_KEY=votre_secret_key
AWS_REGION=eu-west-3
AWS_S3_BUCKET_NAME=decosa-storage

# Better Auth
BETTER_AUTH_SECRET=generer_une_cle_secrete_aleatoire_32_caracteres
BETTER_AUTH_URL=https://votre-domaine.com
```

### 5.2 Variables d'environnement du frontend

Créez un fichier `.env.local` dans `apps/web/` :

```bash
cd ../web
nano .env.local
```

```env
NEXT_PUBLIC_SERVER_URL=https://votre-domaine.com
# Ou si vous utilisez un sous-domaine pour l'API :
# NEXT_PUBLIC_SERVER_URL=https://api.votre-domaine.com
```

### 5.3 Générer une clé secrète pour Better Auth

```bash
# Générer une clé secrète aléatoire
openssl rand -base64 32
```

Copiez le résultat dans `BETTER_AUTH_SECRET`.

## Étape 6 : Configurer la base de données

```bash
# Depuis la racine du projet
cd ~/decosa

# Générer le client Prisma
bun run db:generate

# Appliquer les migrations
bun run db:migrate
```

## Étape 7 : Build et démarrer les applications

### 7.1 Build du projet

```bash
cd ~/decosa

# Build tout le projet
bun run build
```

### 7.2 Démarrer le serveur backend avec PM2

```bash
cd apps/server

# Créer un fichier ecosystem.config.js
nano ecosystem.config.js
```

```javascript
module.exports = {
	apps: [
		{
			name: "decosa-server",
			script: "dist/index.js",
			cwd: "/home/ubuntu/decosa/apps/server",
			instances: 1,
			exec_mode: "fork",
			env: {
				NODE_ENV: "production",
				PORT: 3000,
			},
			error_file: "/home/ubuntu/logs/server-error.log",
			out_file: "/home/ubuntu/logs/server-out.log",
			log_date_format: "YYYY-MM-DD HH:mm:ss Z",
			merge_logs: true,
			autorestart: true,
			max_memory_restart: "1G",
		},
	],
};
```

```bash
# Créer le dossier de logs
mkdir -p ~/logs

# Démarrer avec PM2
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
# Suivez les instructions affichées
```

### 7.3 Démarrer le frontend avec PM2

```bash
cd ~/decosa/apps/web

# Créer un fichier ecosystem.config.js pour Next.js
nano ecosystem.config.js
```

```javascript
module.exports = {
	apps: [
		{
			name: "decosa-web",
			script: "node_modules/next/dist/bin/next",
			args: "start",
			cwd: "/home/ubuntu/decosa/apps/web",
			instances: 1,
			exec_mode: "fork",
			env: {
				NODE_ENV: "production",
				PORT: 3001,
			},
			error_file: "/home/ubuntu/logs/web-error.log",
			out_file: "/home/ubuntu/logs/web-out.log",
			log_date_format: "YYYY-MM-DD HH:mm:ss Z",
			merge_logs: true,
			autorestart: true,
			max_memory_restart: "1G",
		},
	],
};
```

```bash
# Démarrer avec PM2
pm2 start ecosystem.config.js

# Sauvegarder
pm2 save
```

## Étape 8 : Configurer Nginx (Reverse Proxy)

```bash
sudo nano /etc/nginx/sites-available/decosa
```

```nginx
# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Configuration HTTPS
server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;

    # Certificats SSL (seront générés par Certbot)
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

    # Configuration SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy pour le frontend Next.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy pour l'API backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Cookie $http_cookie;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/decosa /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

## Étape 9 : Configurer SSL avec Let's Encrypt

```bash
# Obtenir un certificat SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Certbot configurera automatiquement Nginx
# Renouvellement automatique (déjà configuré par certbot)
```

## Étape 10 : Configurer GitHub OAuth

1. Allez sur GitHub → Settings → Developer settings → OAuth Apps
2. Créez une nouvelle OAuth App :
   - **Application name** : decosa
   - **Homepage URL** : `https://votre-domaine.com`
   - **Authorization callback URL** : `https://votre-domaine.com/api/auth/callback/github`
3. Copiez le Client ID et Client Secret dans vos variables d'environnement

## Étape 11 : Vérifier que tout fonctionne

```bash
# Vérifier les processus PM2
pm2 status

# Vérifier les logs
pm2 logs decosa-server
pm2 logs decosa-web

# Vérifier Nginx
sudo systemctl status nginx

# Vérifier PostgreSQL (si local)
sudo systemctl status postgresql
```

## Commandes utiles

### PM2

```bash
# Voir les processus
pm2 status

# Voir les logs
pm2 logs

# Redémarrer une application
pm2 restart decosa-server
pm2 restart decosa-web

# Arrêter une application
pm2 stop decosa-server

# Supprimer une application
pm2 delete decosa-server
```

### Nginx

```bash
# Tester la configuration
sudo nginx -t

# Redémarrer
sudo systemctl restart nginx

# Voir les logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql -d decosa

# Voir les tables
\dt

# Quitter
\q
```

## Mise à jour de l'application

```bash
cd ~/decosa

# Récupérer les dernières modifications
git pull

# Installer les nouvelles dépendances
bun install

# Rebuild
bun run build

# Redémarrer les applications
pm2 restart all
```

## Dépannage

### Les applications ne démarrent pas

1. Vérifiez les logs : `pm2 logs`
2. Vérifiez les variables d'environnement
3. Vérifiez que la base de données est accessible
4. Vérifiez les ports (3000 et 3001 doivent être libres)

### Erreurs 502 Bad Gateway

1. Vérifiez que les applications tournent : `pm2 status`
2. Vérifiez les logs Nginx : `sudo tail -f /var/log/nginx/error.log`
3. Vérifiez que les ports sont corrects dans la config Nginx

### Problèmes de connexion à la base de données

1. Vérifiez que PostgreSQL tourne : `sudo systemctl status postgresql`
2. Vérifiez la DATABASE_URL dans `.env`
3. Testez la connexion : `psql $DATABASE_URL`

### Problèmes avec S3

1. Vérifiez les credentials AWS
2. Vérifiez que le bucket existe et est accessible
3. Vérifiez les permissions IAM

## Sécurité supplémentaire

1. **Firewall (UFW)** :

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. **Fail2Ban** (protection contre les attaques brute force) :

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

3. **Backups automatiques** :
   - Configurez des snapshots EC2
   - Sauvegardez la base de données régulièrement

## Monitoring

Considérez d'utiliser :

- **CloudWatch** pour monitorer l'instance EC2
- **PM2 Plus** (optionnel) pour le monitoring des applications
- **Sentry** pour le tracking des erreurs

## Coûts estimés

- **EC2 t3.medium** : ~$30/mois
- **RDS db.t3.micro** : ~$15/mois (optionnel)
- **S3** : ~$1-5/mois (selon l'usage)
- **Route 53** : ~$0.50/mois par domaine
- **Total** : ~$35-50/mois

---

**Note** : Pour un environnement de production, considérez d'utiliser :

- **AWS RDS** pour la base de données (gestion automatique, backups)
- **AWS CloudFront** pour le CDN
- **AWS Application Load Balancer** pour la haute disponibilité
- **Docker** pour containeriser l'application
