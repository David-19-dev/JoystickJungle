# Guide de Déploiement - Joystick Jungle

Ce document explique comment déployer l'application Joystick Jungle sur Hostinger.

## Prérequis

- Un compte Hostinger avec un plan d'hébergement supportant Node.js
- Un domaine configuré
- Un compte Supabase
- Un compte PayTech (pour les paiements Wave)
- Un compte Brevo (pour les emails)

## 1. Préparation du projet

### 1.1 Construction du frontend

```bash
# À la racine du projet
npm run build
```

Cette commande va créer un dossier `dist` contenant les fichiers statiques du frontend.

### 1.2 Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
# Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
SUPABASE_SERVICE_KEY=votre-clé-service

# Brevo (pour les emails)
VITE_BREVO_API_KEY=votre-clé-api-brevo

# PayTech (pour les paiements Wave)
PAYTECH_API_KEY=votre-clé-api-paytech
PAYTECH_SECRET_KEY=votre-clé-secrète-paytech

# JWT (pour l'authentification API)
JWT_SECRET=votre-secret-jwt

# URL de l'API (en production)
VITE_API_URL=https://api.votre-domaine.com
```

## 2. Déploiement sur Hostinger

### 2.1 Déploiement du frontend

1. Connectez-vous à votre panneau de contrôle Hostinger
2. Allez dans la section "Fichiers" ou "Gestionnaire de fichiers"
3. Naviguez vers le dossier public de votre domaine (généralement `public_html`)
4. Téléversez le contenu du dossier `dist` dans ce dossier

### 2.2 Déploiement du backend

Hostinger propose plusieurs méthodes pour déployer des applications Node.js. Voici la méthode recommandée :

1. Connectez-vous à votre panneau de contrôle Hostinger
2. Allez dans la section "Sites web" > Votre site > "Avancé"
3. Cliquez sur "Node.js" dans le menu latéral
4. Activez Node.js pour votre site
5. Configurez le point d'entrée de l'application : `server/index.js`
6. Définissez les variables d'environnement dans l'interface
7. Téléversez les fichiers du projet (sauf le dossier `dist`) dans le dossier racine de votre site
8. Installez les dépendances :

```bash
npm install --production
```

9. Démarrez l'application Node.js depuis le panneau de contrôle

### 2.3 Configuration du domaine et des sous-domaines

Pour une architecture propre, vous pouvez configurer :
- Le frontend sur votre domaine principal (ex: `joystickjungle.sn`)
- L'API sur un sous-domaine (ex: `api.joystickjungle.sn`)

Dans le panneau de contrôle Hostinger :
1. Allez dans "Domaines" > Votre domaine > "DNS Zone"
2. Ajoutez un enregistrement A ou CNAME pour le sous-domaine `api` pointant vers votre serveur

## 3. Configuration de la base de données Supabase

### 3.1 Création du schéma

1. Connectez-vous à votre projet Supabase
2. Allez dans la section "SQL Editor"
3. Exécutez le script SQL contenu dans `supabase/migrations/create_initial_schema.sql`

### 3.2 Configuration de l'authentification

1. Dans Supabase, allez dans "Authentication" > "Settings"
2. Configurez les paramètres d'authentification :
   - Activez "Email signup"
   - Configurez les URL de redirection (vers votre domaine)
   - Personnalisez les templates d'emails si nécessaire

## 4. Configuration des services tiers

### 4.1 Configuration de Brevo (pour les emails)

1. Créez un compte sur Brevo (anciennement Sendinblue)
2. Générez une clé API dans "SMTP & API" > "API Keys"
3. Utilisez cette clé dans vos variables d'environnement

### 4.2 Configuration de PayTech (pour les paiements Wave)

1. Créez un compte marchand sur PayTech
2. Obtenez vos clés API et secrètes
3. Configurez les URL de callback dans votre compte PayTech :
   - IPN URL : `https://api.votre-domaine.com/api/payment-callback`
   - Success URL : `https://votre-domaine.com/payment-success`
   - Cancel URL : `https://votre-domaine.com/payment-cancel`

## 5. Vérification du déploiement

### 5.1 Test du frontend

1. Accédez à votre domaine principal (ex: `https://joystickjungle.sn`)
2. Vérifiez que toutes les pages se chargent correctement
3. Testez l'inscription et la connexion

### 5.2 Test de l'API

1. Testez les endpoints de l'API :
   ```
   curl https://api.votre-domaine.com/api/sessions
   ```

2. Vérifiez les logs du serveur pour détecter d'éventuelles erreurs

### 5.3 Test des fonctionnalités

1. Créez un compte utilisateur
2. Testez la réservation d'une session
3. Testez le paiement (en mode test)
4. Vérifiez la réception des emails

## 6. Maintenance et mises à jour

### 6.1 Mise à jour de l'application

Pour mettre à jour l'application :

1. Mettez à jour le code source
2. Reconstruisez le frontend : `npm run build`
3. Téléversez les nouveaux fichiers
4. Redémarrez le serveur Node.js

### 6.2 Sauvegarde

Configurez des sauvegardes régulières :
- Base de données Supabase
- Fichiers de configuration
- Code source

### 6.3 Surveillance

Mettez en place une surveillance de l'application :
- Utilisez les outils de monitoring de Hostinger
- Configurez des alertes en cas de panne
- Vérifiez régulièrement les logs

## 7. Résolution des problèmes courants

### 7.1 Problèmes de connexion à Supabase

- Vérifiez les clés API
- Assurez-vous que les politiques RLS sont correctement configurées
- Vérifiez les logs côté client et serveur

### 7.2 Problèmes avec les paiements

- Vérifiez les clés API PayTech
- Assurez-vous que les URL de callback sont correctement configurées
- Vérifiez les logs de l'API pour les erreurs de paiement

### 7.3 Problèmes d'envoi d'emails

- Vérifiez la clé API Brevo
- Assurez-vous que les templates d'emails sont correctement configurés
- Vérifiez les quotas d'envoi d'emails

## 8. Support et ressources

- Support Hostinger : [https://www.hostinger.fr/support](https://www.hostinger.fr/support)
- Documentation Supabase : [https://supabase.com/docs](https://supabase.com/docs)
- Documentation PayTech : [https://paytech.sn/documentation](https://paytech.sn/documentation)
- Documentation Brevo : [https://developers.brevo.com](https://developers.brevo.com)