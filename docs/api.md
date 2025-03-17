# Documentation de l'API - Joystick Jungle

Cette documentation décrit les endpoints de l'API pour le système de gestion des sessions de jeu de Joystick Jungle.

## Base URL

```
https://api.joystickjungle.sn
```

En développement :
```
http://localhost:3000
```

## Authentification

L'API utilise l'authentification JWT pour sécuriser les endpoints. Pour les endpoints protégés, incluez le token JWT dans l'en-tête Authorization :

```
Authorization: Bearer <votre_token_jwt>
```

Le token JWT est obtenu lors de la connexion via Supabase Auth.

## Endpoints

### Paiements

#### Créer une demande de paiement Wave

```
POST /api/pay-with-wave
```

Crée une demande de paiement via Wave Mobile Money.

**Corps de la requête :**
```json
{
  "name": "Nom du client",
  "phone": "771234567",
  "amount": 5000,
  "item_name": "Session de jeu PS5",
  "description": "Réservation du 15 mai 2025",
  "session_id": "uuid-de-la-session",
  "subscription_id": null
}
```

**Paramètres :**
- `name` (obligatoire) : Nom complet du client
- `phone` (obligatoire) : Numéro de téléphone Wave
- `amount` (obligatoire) : Montant en FCFA
- `item_name` : Nom de l'article (optionnel)
- `description` : Description du paiement (optionnel)
- `session_id` : ID de la session de jeu (optionnel)
- `subscription_id` : ID de l'abonnement (optionnel)

**Réponse :**
```json
{
  "success": true,
  "message": "Payment request created successfully",
  "payment_url": "https://paytech.sn/payment/...",
  "token": "payment-token"
}
```

#### Callback de paiement (IPN)

```
POST /api/payment-callback
```

Endpoint appelé par PayTech pour notifier du statut d'un paiement.

**Corps de la requête :**
```json
{
  "token": "payment-token",
  "status": "completed",
  "reference": "WAVE-1234567890-123",
  "custom_field": "{\"customer_name\":\"Nom du client\",\"customer_phone\":\"771234567\",\"session_id\":\"uuid-de-la-session\",\"subscription_id\":null}"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Payment notification received"
}
```

### Sessions de jeu

#### Récupérer toutes les sessions

```
GET /api/sessions
```

Récupère la liste de toutes les sessions de jeu.

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "platform": "ps5",
      "start_time": "2025-05-15T14:00:00Z",
      "end_time": "2025-05-15T16:00:00Z",
      "duration_minutes": 120,
      "status": "booked",
      "players_count": 2,
      "extras": ["snacks", "drinks"],
      "total_price": 7000,
      "created_at": "2025-05-10T12:34:56Z",
      "updated_at": null
    },
    // ...
  ]
}
```

#### Récupérer une session spécifique

```
GET /api/sessions/:id
```

Récupère les détails d'une session de jeu spécifique.

**Paramètres de chemin :**
- `id` : ID de la session

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "platform": "ps5",
    "start_time": "2025-05-15T14:00:00Z",
    "end_time": "2025-05-15T16:00:00Z",
    "duration_minutes": 120,
    "status": "booked",
    "players_count": 2,
    "extras": ["snacks", "drinks"],
    "total_price": 7000,
    "created_at": "2025-05-10T12:34:56Z",
    "updated_at": null
  }
}
```

#### Créer une session

```
POST /api/sessions
```

Crée une nouvelle session de jeu.

**Corps de la requête :**
```json
{
  "platform": "ps5",
  "start_time": "2025-05-15T14:00:00Z",
  "duration_minutes": 120,
  "players_count": 2,
  "extras": ["snacks", "drinks"]
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "platform": "ps5",
    "start_time": "2025-05-15T14:00:00Z",
    "end_time": "2025-05-15T16:00:00Z",
    "duration_minutes": 120,
    "status": "booked",
    "players_count": 2,
    "extras": ["snacks", "drinks"],
    "total_price": 7000,
    "created_at": "2025-05-10T12:34:56Z",
    "updated_at": null
  }
}
```

#### Mettre à jour une session

```
PUT /api/sessions/:id
```

Met à jour une session de jeu existante.

**Paramètres de chemin :**
- `id` : ID de la session

**Corps de la requête :**
```json
{
  "status": "cancelled",
  "players_count": 3,
  "extras": ["snacks", "drinks", "premium"]
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "cancelled",
    "players_count": 3,
    "extras": ["snacks", "drinks", "premium"],
    "updated_at": "2025-05-12T10:11:12Z"
  }
}
```

### Abonnements

#### Récupérer les abonnements d'un utilisateur

```
GET /api/subscriptions/:userId
```

Récupère la liste des abonnements d'un utilisateur spécifique.

**Paramètres de chemin :**
- `userId` : ID de l'utilisateur

**En-têtes :**
- `Authorization: Bearer <token>` (obligatoire)

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "premium",
      "start_date": "2025-05-01T00:00:00Z",
      "end_date": "2025-06-01T00:00:00Z",
      "remaining_minutes": 1500,
      "status": "active",
      "created_at": "2025-04-28T15:30:45Z",
      "updated_at": null
    },
    // ...
  ]
}
```

#### Créer un abonnement

```
POST /api/subscriptions
```

Crée un nouvel abonnement pour l'utilisateur authentifié.

**Corps de la requête :**
```json
{
  "type": "premium",
  "start_date": "2025-05-01T00:00:00Z"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "type": "premium",
    "start_date": "2025-05-01T00:00:00Z",
    "end_date": "2025-06-01T00:00:00Z",
    "remaining_minutes": 1500,
    "status": "pending",
    "created_at": "2025-04-28T15:30:45Z",
    "updated_at": null
  }
}
```

#### Mettre à jour un abonnement

```
PUT /api/subscriptions/:id
```

Met à jour un abonnement existant.

**Paramètres de chemin :**
- `id` : ID de l'abonnement

**Corps de la requête :**
```json
{
  "remaining_minutes": 1200,
  "status": "active"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "remaining_minutes": 1200,
    "status": "active",
    "updated_at": "2025-05-05T09:10:11Z"
  }
}
```

### Utilisateurs

#### Récupérer le profil de l'utilisateur courant

```
GET /api/profile
```

Récupère le profil de l'utilisateur authentifié.

**En-têtes :**
- `Authorization: Bearer <token>` (obligatoire)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "771234567",
    "role": "user",
    "created_at": "2025-04-01T12:00:00Z",
    "updated_at": null
  }
}
```

#### Mettre à jour le profil utilisateur

```
PUT /api/profile
```

Met à jour le profil de l'utilisateur authentifié.

**En-têtes :**
- `Authorization: Bearer <token>` (obligatoire)

**Corps de la requête :**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "771234567"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Smith",
    "phone": "771234567",
    "updated_at": "2025-05-10T14:15:16Z"
  }
}
```

## Codes d'erreur

L'API utilise les codes d'état HTTP standard :

- `200 OK` : Requête réussie
- `201 Created` : Ressource créée avec succès
- `400 Bad Request` : Paramètres manquants ou invalides
- `401 Unauthorized` : Authentification requise
- `403 Forbidden` : Accès refusé
- `404 Not Found` : Ressource non trouvée
- `500 Internal Server Error` : Erreur serveur

## Exemples d'utilisation

### Réserver une session

1. Authentifiez-vous pour obtenir un token JWT
2. Créez une session :
   ```
   POST /api/sessions
   ```
3. Effectuez un paiement :
   ```
   POST /api/pay-with-wave
   ```
4. Vérifiez le statut de la session :
   ```
   GET /api/sessions/:id
   ```

### Annuler une session

1. Authentifiez-vous pour obtenir un token JWT
2. Mettez à jour le statut de la session :
   ```
   PUT /api/sessions/:id
   ```
   avec `{ "status": "cancelled" }`

### Souscrire à un abonnement

1. Authentifiez-vous pour obtenir un token JWT
2. Créez un abonnement :
   ```
   POST /api/subscriptions
   ```
3. Effectuez un paiement :
   ```
   POST /api/pay-with-wave
   ```
4. Vérifiez le statut de l'abonnement :
   ```
   GET /api/subscriptions/:userId
   ```