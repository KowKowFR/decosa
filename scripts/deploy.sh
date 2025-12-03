#!/bin/bash

# Script de déploiement pour EC2
# Usage: ./scripts/deploy.sh

set -e

echo "🚀 Démarrage du déploiement..."

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis la racine du projet${NC}"
    exit 1
fi

# Vérifier que Bun est installé
if ! command -v bun &> /dev/null; then
    echo -e "${RED}❌ Bun n'est pas installé${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Installation des dépendances...${NC}"
bun install

echo -e "${YELLOW}🔨 Build du projet...${NC}"
bun run build

echo -e "${YELLOW}🗄️  Génération du client Prisma...${NC}"
bun run db:generate

echo -e "${YELLOW}🔄 Application des migrations...${NC}"
bun run db:migrate

echo -e "${GREEN}✅ Build terminé avec succès!${NC}"
echo -e "${YELLOW}💡 N'oubliez pas de redémarrer les applications avec PM2:${NC}"
echo -e "   pm2 restart all"

