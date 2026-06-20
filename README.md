# 🎮 Système de Jeu Discord - Guide Complet

## 📋 Table des matières
1. Installation
2. Configuration
3. Commandes disponibles
4. Fonctionnalités
5. Personnalisation

---

## 🚀 Installation

### 1️⃣ Prérequis
- **Node.js 18+** ([Télécharger](https://nodejs.org/))
- **Ton bot Discord** déjà créé
- **Token du bot** Discord

### 2️⃣ Installation des dépendances

```bash
npm install
```

Cela installera :
- `discord.js` - Librairie Discord
- `better-sqlite3` - Base de données locale

### 3️⃣ Configuration du Token

**Option 1 : Variable d'environnement (.env)**

Crée un fichier `.env` à la racine :

```
DISCORD_TOKEN=ton_token_ici
```

**Option 2 : Directement dans le code**

Modifie `bot-main.js` ligne 26 :
```javascript
const TOKEN = 'TON_TOKEN_ICI';
```

### 4️⃣ Lancer le bot

```bash
npm start
```

Ou en mode développement (redémarrage automatique) :
```bash
npm run dev
```

---

## ⚙️ Configuration

### Modifier les gains d'XP et d'argent

Édite `events.js` :

```javascript
const CONFIG = {
  XP_PER_MESSAGE: 10,        // XP par message (défaut: 10)
  MONEY_PER_MESSAGE: 5,      // Argent par message (défaut: 5)
  COOLDOWN_SECONDS: 30,      // Délai entre 2 gains (défaut: 30s)
  BONUS_LONG_MESSAGE: 5,     // Bonus pour messages longs (défaut: 5)
  BONUS_CONVERSATION: 3      // Bonus pour réponses (défaut: 3)
};
```

### Modifier les rangs et leurs seuils

Édite `database.js` :

```javascript
const RANKS = [
  { name: 'Bronze', minXp: 0, emoji: '🥉' },
  { name: 'Argent', minXp: 500, emoji: '🥈' },
  { name: 'Or', minXp: 1500, emoji: '🥇' },
  { name: 'Platine', minXp: 3000, emoji: '💎' },
  // Ajoute tes rangs ici
];
```

### Modifier les items de la boutique

Édite `shop.js` et modifie `DEFAULT_SHOP_ITEMS` :

```javascript
const DEFAULT_SHOP_ITEMS = [
  { name: 'Nom', cost: 100, description: 'Description', emoji: '⭐' },
  // Ajoute d'autres items
];
```

---

## 📚 Commandes Disponibles

### 👤 Profil & Stats

```
!profil [@user]     → Voir tes stats ou celles de quelqu'un
!leaderboard        → Voir le top 10 des joueurs
!top                → Alias de leaderboard
```

### 🛍️ Boutique

```
!boutique           → Voir tous les items à vendre
!shop               → Alias de boutique
!acheter <numéro>   → Acheter un item (ex: !acheter 1)
!buy <numéro>       → Alias d'acheter
!inventaire         → Voir tes items achetés
!inv                → Alias d'inventaire
```

### ❓ Aide

```
!aide               → Afficher ce message d'aide
!help               → Alias d'aide
```

---

## 🎯 Fonctionnalités

### ✨ Système d'XP
- ✅ **Gains automatiques** : +10 XP par message
- ✅ **Bonus de longueur** : +5 XP si le message > 20 caractères
- ✅ **Bonus conversation** : +3 XP si tu réponds à quelqu'un
- ✅ **Cooldown** : 30 secondes min entre chaque gain (anti-spam)
- ✅ **Notifications** : Message quand tu montes de rang

### 💰 Système d'Argent
- ✅ **Gains** : +5 💰 par message
- ✅ **Dépenses** : Acheter des items dans la boutique
- ✅ **Affichage** : Voir ton solde dans ton profil

### 🏆 Système de Rangs
Basé sur l'XP, déverrouille automatiquement les rangs :
1. Bronze 🥉 - 0 XP
2. Argent 🥈 - 500 XP
3. Or 🥇 - 1500 XP
4. Platine 💎 - 3000 XP
5. Diamant ✨ - 5000 XP
6. Légende 👑 - 10000 XP

### 🛒 Système de Boutique
- ✅ **Items variés** : Potions, boosters, badges, rôles
- ✅ **Prix personnalisable** : Fixe pour chaque item
- ✅ **Inventaire** : Conserve tes achats
- ✅ **Ajout facile** : Ajoute des items avec la commande admin

### 📊 Base de Données
- Stockage local avec SQLite (fichier `game.db`)
- Pas besoin de serveur externe
- Dépendances minimales

---

## 🎨 Personnalisation

### Ajouter un nouvel item à la boutique

```javascript
// Dans shop.js, ajoute une ligne dans DEFAULT_SHOP_ITEMS :
{ name: 'Épée dorée', cost: 5000, description: 'Arme puissante', emoji: '⚔️' }
```

### Changer la couleur des embeds

Trouve cette ligne dans les commandes et modifie le code couleur :
```javascript
.setColor('#00FF00')  // Vert
```

Codes couleurs populaires :
- `#00FF00` - Vert
- `#FF0000` - Rouge
- `#FFD700` - Or
- `#0099FF` - Bleu
- `#FF00FF` - Magenta

### Ajouter de nouveaux rangs

1. Ajoute une entrée dans `RANKS` dans `database.js`
2. Modifie `minXp` pour le seuil d'XP
3. Change l'emoji si tu veux

---

## 📁 Structure des fichiers

```
projet/
├── bot-main.js          # Fichier principal (à exécuter)
├── database.js          # Gestion de la base de données
├── shop.js              # Système de boutique
├── events.js            # Gestion des événements (XP, argent)
├── commands.js          # Toutes les commandes Discord
├── game.db              # Base de données (créée automatiquement)
├── package.json         # Dépendances npm
└── .env                 # Configuration (optionnel)
```

---

## 🐛 Dépannage

### Le bot ne démarre pas
```
❌ Error: DISCORD_TOKEN is not defined
```
→ Ajoute ton token dans `.env` ou directement dans `bot-main.js`

### Les commandes ne fonctionnent pas
```
❌ Vérifie que tu utilises le bon préfixe: !
```
→ Utilise `!` avant chaque commande (ex: `!profil`)

### Les gains d'XP ne s'appliquent pas
→ Vérifie que le bot a la permission de lire les messages

### Base de données corrompue
```
Supprime le fichier game.db et redémarrage
```
→ La base se créera automatiquement à nouveau

---

## 🔧 Support et Améliorations

Besoin d'aide ? Tu peux :
- ✅ Modifier les paramètres dans les fichiers
- ✅ Ajouter de nouveaux rangs ou items
- ✅ Changer les gains d'XP
- ✅ Personnaliser les couleurs et messages

---

## 📝 Notes

- Les données sont stockées localement dans `game.db`
- Chaque serveur aura sa propre base de données
- Les backups ne se font pas automatiquement
- Les données ne sont jamais supprimées (les anciens comptes restent)

---

**Bon jeu ! 🎮**
