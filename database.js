const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'game.db'));

// Créer les tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    userId TEXT PRIMARY KEY,
    username TEXT,
    xp INTEGER DEFAULT 0,
    money INTEGER DEFAULT 0,
    rank TEXT DEFAULT 'Bronze',
    messages INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS shop_items (
    itemId INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    cost INTEGER,
    description TEXT,
    emoji TEXT
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    itemId INTEGER,
    quantity INTEGER DEFAULT 1,
    FOREIGN KEY(userId) REFERENCES users(userId),
    FOREIGN KEY(itemId) REFERENCES shop_items(itemId)
  );
`);

// Les rangs et leurs seuils d'XP
const RANKS = [
  { name: 'Bronze', minXp: 0, emoji: '🥉' },
  { name: 'Argent', minXp: 500, emoji: '🥈' },
  { name: 'Or', minXp: 1500, emoji: '🥇' },
  { name: 'Platine', minXp: 3000, emoji: '💎' },
  { name: 'Diamant', minXp: 5000, emoji: '✨' },
  { name: 'Légende', minXp: 10000, emoji: '👑' }
];

// Ajouter ou créer un utilisateur
function getOrCreateUser(userId, username) {
  const user = db.prepare('SELECT * FROM users WHERE userId = ?').get(userId);
  
  if (!user) {
    db.prepare(
      'INSERT INTO users (userId, username) VALUES (?, ?)'
    ).run(userId, username);
    return { userId, username, xp: 0, money: 0, rank: 'Bronze', messages: 0 };
  }
  return user;
}

// Ajouter de l'XP
function addXp(userId, amount) {
  const user = db.prepare('SELECT xp FROM users WHERE userId = ?').get(userId);
  if (!user) return null;

  const newXp = user.xp + amount;
  const newRank = calculateRank(newXp);

  db.prepare('UPDATE users SET xp = ?, rank = ? WHERE userId = ?').run(
    newXp,
    newRank,
    userId
  );

  return { newXp, newRank, leveledUp: newRank !== user.rank };
}

// Ajouter de l'argent
function addMoney(userId, amount) {
  db.prepare('UPDATE users SET money = money + ? WHERE userId = ?').run(amount, userId);
}

// Retirer de l'argent (pour achats)
function removeMoney(userId, amount) {
  const user = db.prepare('SELECT money FROM users WHERE userId = ?').get(userId);
  if (!user || user.money < amount) return false;
  
  db.prepare('UPDATE users SET money = money - ? WHERE userId = ?').run(amount, userId);
  return true;
}

// Incrémenter les messages
function incrementMessages(userId) {
  db.prepare('UPDATE users SET messages = messages + 1 WHERE userId = ?').run(userId);
}

// Calculer le rang basé sur l'XP
function calculateRank(xp) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) {
      return RANKS[i].name;
    }
  }
  return 'Bronze';
}

// Obtenir l'utilisateur
function getUser(userId) {
  return db.prepare('SELECT * FROM users WHERE userId = ?').get(userId);
}

// Obtenir les stats utilisateur avec emoji du rang
function getUserStats(userId) {
  const user = getUser(userId);
  if (!user) return null;

  const rankData = RANKS.find(r => r.name === user.rank);
  const nextRank = RANKS.find(r => r.minXp > user.xp);
  const xpNeeded = nextRank ? nextRank.minXp - user.xp : 0;

  return {
    ...user,
    rankEmoji: rankData?.emoji || '',
    xpNeeded: xpNeeded,
    nextRank: nextRank?.name || 'Max'
  };
}

// Leaderboard
function getLeaderboard(limit = 10) {
  return db.prepare(
    'SELECT userId, username, xp, rank, money FROM users ORDER BY xp DESC LIMIT ?'
  ).all(limit);
}

module.exports = {
  db,
  getOrCreateUser,
  addXp,
  addMoney,
  removeMoney,
  incrementMessages,
  calculateRank,
  getUser,
  getUserStats,
  getLeaderboard,
  RANKS
};
