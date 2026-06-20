# 🚀 Idées d'Extension - Améliorez votre système de jeu

Voici des idées pour rendre le système encore plus intéressant !

---

## 🎁 Système de Récompenses Quotidiennes

**Concept** : Les utilisateurs peuvent récupérer une récompense une fois par jour

```javascript
// Dans database.js, ajoute une table :
CREATE TABLE IF NOT EXISTS daily_rewards (
  userId TEXT PRIMARY KEY,
  lastClaimed DATETIME,
  streak INTEGER DEFAULT 0
);

// Fonction à ajouter :
function claimDailyReward(userId) {
  const user = db.prepare('SELECT * FROM daily_rewards WHERE userId = ?').get(userId);
  const now = new Date();
  
  if (!user) {
    db.prepare('INSERT INTO daily_rewards (userId, lastClaimed, streak) VALUES (?, ?, 1)')
      .run(userId, now);
    return { xp: 50, money: 50, streak: 1 };
  }
  
  const lastClaim = new Date(user.lastClaimed);
  const daysPassed = (now - lastClaim) / (1000 * 60 * 60 * 24);
  
  if (daysPassed >= 1) {
    const newStreak = daysPassed < 2 ? user.streak + 1 : 1;
    const bonus = 25 * newStreak; // Bonus augmente avec la streak
    
    db.prepare('UPDATE daily_rewards SET lastClaimed = ?, streak = ? WHERE userId = ?')
      .run(now, newStreak, userId);
    
    return { xp: 50 + bonus, money: 50 + bonus, streak: newStreak };
  }
  
  return null; // Déjà réclamé aujourd'hui
}

// Commande : !daily
async function dailyCommand(message) {
  const reward = claimDailyReward(message.author.id);
  
  if (!reward) {
    return message.reply('⏰ Tu as déjà réclamé ta récompense aujourd\'hui !');
  }
  
  addXp(message.author.id, reward.xp);
  addMoney(message.author.id, reward.money);
  
  const embed = new EmbedBuilder()
    .setTitle(`🎁 Récompense Quotidienne Reçue !`)
    .setDescription(`**Streak**: ${reward.streak} jours !\n+${reward.xp} XP\n+${reward.money} 💰`)
    .setColor('#FF6B6B');
  
  return message.reply({ embeds: [embed] });
}
```

---

## 🎰 Mini-Jeux pour Gagner de l'Argent

### Coin Flip (Pile ou Face)

```javascript
async function coinFlipGame(message, args) {
  const betAmount = parseInt(args[0]);
  const bet = args[1]?.toLowerCase();
  const user = getUser(message.author.id);
  
  if (!betAmount || !['heads', 'tails', 'pile', 'face'].includes(bet)) {
    return message.reply('Usage: `!coinflip <montant> <pile|face>`');
  }
  
  if (user.money < betAmount) {
    return message.reply('💰 Argent insuffisant');
  }
  
  const result = Math.random() > 0.5 ? 'heads' : 'tails';
  const isWin = (bet === 'pile' && result === 'tails') || (bet === 'face' && result === 'heads');
  
  if (isWin) {
    addMoney(message.author.id, betAmount);
    return message.reply(`✅ **${result}** - Tu as gagné **${betAmount} 💰** !`);
  } else {
    removeMoney(message.author.id, betAmount);
    return message.reply(`❌ **${result}** - Tu as perdu **${betAmount} 💰**`);
  }
}
```

---

## 🤝 Système de Trades / Échanges

**Concept** : Les joueurs peuvent s'échanger des items

```javascript
// Table pour les trades :
CREATE TABLE IF NOT EXISTS trades (
  tradeId INTEGER PRIMARY KEY AUTOINCREMENT,
  senderId TEXT,
  receiverId TEXT,
  itemId INTEGER,
  quantity INTEGER,
  status TEXT DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

// Proposer un trade
function proposeTrade(senderId, receiverId, itemId, quantity) {
  db.prepare(`
    INSERT INTO trades (senderId, receiverId, itemId, quantity)
    VALUES (?, ?, ?, ?)
  `).run(senderId, receiverId, itemId, quantity);
  
  return true;
}

// Accepter un trade
function acceptTrade(tradeId, userId) {
  const trade = db.prepare('SELECT * FROM trades WHERE tradeId = ?').get(tradeId);
  
  if (trade.receiverId !== userId) return false;
  
  // Retirer item du sender
  db.prepare('UPDATE inventory SET quantity = quantity - ? WHERE userId = ? AND itemId = ?')
    .run(trade.quantity, trade.senderId, trade.itemId);
  
  // Ajouter item au receiver
  // ... insertion ou update
  
  // Marquer comme accepté
  db.prepare('UPDATE trades SET status = "accepted" WHERE tradeId = ?').run(tradeId);
  
  return true;
}
```

---

## 🏅 Badges et Achievements

**Concept** : Les joueurs déverrouillent des badges

```javascript
CREATE TABLE IF NOT EXISTS badges (
  badgeId INTEGER PRIMARY KEY,
  name TEXT,
  description TEXT,
  emoji TEXT,
  requirement TEXT
);

const BADGES = [
  { id: 1, name: 'Premier Message', emoji: '💬', description: 'Écris ton premier message' },
  { id: 2, name: 'Millionnaire', emoji: '💸', description: 'Accumule 1,000,000 💰' },
  { id: 3, name: 'Légende', emoji: '👑', description: 'Atteins le rang Légende' },
  { id: 4, name: 'Collectionneur', emoji: '📦', description: 'Achète 10 items différents' },
  { id: 5, name: 'Parleur', emoji: '🗣️', description: 'Écris 1000 messages' }
];

function checkBadges(userId) {
  const user = getUser(userId);
  const unlockedBadges = [];
  
  // Badge Millionnaire
  if (user.money >= 1000000) {
    unlockedBadges.push(2);
  }
  
  // Badge Parleur
  if (user.messages >= 1000) {
    unlockedBadges.push(5);
  }
  
  return unlockedBadges;
}
```

---

## 📈 Événements Spéciaux

### Double XP Weekend

```javascript
// Dans events.js :
function isDoubleXpWeekend() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  return dayOfWeek === 5 || dayOfWeek === 6; // Vendredi et samedi
}

function handleMessageXp(message) {
  // ... code existant ...
  
  let xpGain = CONFIG.XP_PER_MESSAGE;
  
  if (isDoubleXpWeekend()) {
    xpGain *= 2;
    message.react('⚡');
  }
  
  // ... reste du code
}
```

### Événement Spécial (ex: Noël, Halloween)

```javascript
function getSeasonBonus() {
  const today = new Date();
  const month = today.getMonth();
  
  if (month === 11) return { name: '🎄 Noël', multiplier: 1.5 }; // Décembre
  if (month === 9) return { name: '🎃 Halloween', multiplier: 1.3 }; // Octobre
  if (month === 0) return { name: '🎆 Nouvel An', multiplier: 1.2 }; // Janvier
  
  return { name: 'Normal', multiplier: 1 };
}
```

---

## 🏢 Système de Guild / Clans

**Concept** : Les joueurs se réunissent en guildes

```javascript
CREATE TABLE IF NOT EXISTS guilds (
  guildId INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  leader TEXT,
  description TEXT,
  level INTEGER DEFAULT 1,
  treasury INTEGER DEFAULT 0, // Argent commun
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guild_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT,
  guildId INTEGER,
  role TEXT DEFAULT 'member', -- member, officer, leader
  joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

// Créer une guilde
function createGuild(name, leaderId, description) {
  db.prepare(`
    INSERT INTO guilds (name, leader, description)
    VALUES (?, ?, ?)
  `).run(name, leaderId, description);
}

// Rejoindre une guilde
function joinGuild(userId, guildId) {
  db.prepare(`
    INSERT INTO guild_members (userId, guildId)
    VALUES (?, ?)
  `).run(userId, guildId);
}
```

---

## 🎯 Système de Quêtes

**Concept** : Les joueurs complètent des quêtes pour récompenses

```javascript
CREATE TABLE IF NOT EXISTS quests (
  questId INTEGER PRIMARY KEY,
  name TEXT,
  description TEXT,
  objective TEXT,
  reward_xp INTEGER,
  reward_money INTEGER
);

CREATE TABLE IF NOT EXISTS quest_progress (
  userId TEXT,
  questId INTEGER,
  progress INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  PRIMARY KEY (userId, questId)
);

const QUESTS = [
  { 
    id: 1, 
    name: 'Parleur', 
    description: 'Écris 100 messages', 
    objective: 'messages', 
    target: 100, 
    reward: { xp: 500, money: 1000 } 
  },
  { 
    id: 2, 
    name: 'Collecteur', 
    description: 'Achète 5 items', 
    objective: 'items_bought', 
    target: 5, 
    reward: { xp: 300, money: 500 } 
  }
];
```

---

## 🌍 Système de Localisation / Multi-Serveurs

Si tu veux que chaque serveur ait ses propres données :

```javascript
// Modifier les tables pour ajouter guildId :
CREATE TABLE IF NOT EXISTS users (
  userId TEXT,
  guildId TEXT,
  xp INTEGER DEFAULT 0,
  money INTEGER DEFAULT 0,
  PRIMARY KEY (userId, guildId)
);

// Les commandes doivent alors inclure :
const guildId = message.guild.id;
const user = db.prepare(
  'SELECT * FROM users WHERE userId = ? AND guildId = ?'
).get(userId, guildId);
```

---

## 💬 Système de Chat / Forum

**Concept** : Un canal spécial où les messages donnent bonus d'XP

```javascript
const BONUS_CHANNELS = {
  'ID_CANAL_DISCUSSION': { xp: 1.5, money: 1.5 }, // 50% bonus
  'ID_CANAL_SPAM': { xp: 0.5, money: 0.5 }        // 50% malus
};

function getChannelMultiplier(channelId) {
  return BONUS_CHANNELS[channelId] || { xp: 1, money: 1 };
}
```

---

## 🔔 Système de Notifications

**Concept** : Notifier les joueurs des événements importants

```javascript
// Quand quelqu'un atteint un nouvelle rank
async function sendLevelUpNotification(userId, newRank) {
  try {
    const user = await client.users.fetch(userId);
    const embed = new EmbedBuilder()
      .setTitle('🎉 Promotion!')
      .setDescription(`Tu as atteint le rang **${newRank}**`);
    
    await user.send({ embeds: [embed] });
  } catch (err) {
    console.log('Impossible d\'envoyer DM');
  }
}
```

---

## 💡 Conseils pour l'Implémentation

1. **Test d'abord** : Teste chaque feature en local
2. **Performance** : Utilise des indexes SQLite pour les grosses tables
3. **Balance** : Assure-toi que les récompenses ne sont pas trop faciles
4. **Documentation** : Explique aux joueurs comment utiliser les nouvelles features
5. **Feedback** : Demande aux joueurs ce qu'ils veulent

---

**Bonne chance pour développer ton système ! 🚀**
