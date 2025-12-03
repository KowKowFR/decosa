#!/bin/bash

# Script de configuration initiale pour EC2
# Usage: ./scripts/setup-ec2.sh

set -e

echo "🔧 Configuration de l'environnement EC2..."

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Mettre à jour le système
echo -e "${YELLOW}📦 Mise à jour du système...${NC}"
sudo apt update && sudo apt upgrade -y

# Installer Bun
if ! command -v bun &> /dev/null; then
    echo -e "${YELLOW}📦 Installation de Bun...${NC}"
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc
else
    echo -e "${GREEN}✅ Bun est déjà installé${NC}"
fi

# Installer Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Installation de Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo -e "${GREEN}✅ Node.js est déjà installé${NC}"
fi

# Installer PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}📦 Installation de PostgreSQL...${NC}"
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
else
    echo -e "${GREEN}✅ PostgreSQL est déjà installé${NC}"
fi

# Installer Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Installation de Nginx...${NC}"
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
else
    echo -e "${GREEN}✅ Nginx est déjà installé${NC}"
fi

# Installer PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installation de PM2...${NC}"
    sudo npm install -g pm2
else
    echo -e "${GREEN}✅ PM2 est déjà installé${NC}"
fi

# Installer Certbot
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Installation de Certbot...${NC}"
    sudo apt install -y certbot python3-certbot-nginx
else
    echo -e "${GREEN}✅ Certbot est déjà installé${NC}"
fi

# Installer Git
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}📦 Installation de Git...${NC}"
    sudo apt install -y git
else
    echo -e "${GREEN}✅ Git est déjà installé${NC}"
fi

# Créer le dossier de logs
mkdir -p ~/logs

echo -e "${GREEN}✅ Configuration terminée!${NC}"
echo -e "${YELLOW}💡 Prochaines étapes:${NC}"
echo -e "   1. Clonez votre repository: git clone <url>"
echo -e "   2. Configurez les variables d'environnement"
echo -e "   3. Exécutez: bun install && bun run build"
echo -e "   4. Configurez Nginx"
echo -e "   5. Démarrez avec PM2"

