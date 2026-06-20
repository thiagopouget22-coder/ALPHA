// ============================================
// 🎮 EXEMPLE SIMPLE - Bot Discord avec Jeu
// ============================================
// Copie ce code dans un fichier bot.js pour démarrer

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const Database = require('better-sqlite3');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🗄️ Base de données
const db = new Database(path.join(__dirname, 'game.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    userId TEXT PRIMARY KEY,
    xp INTEGER DEFAULT 0,
    money INTEGER DEFAULT 0,
    messages INTEGER DEFAULT 0
  )
`);

const PREFIX = '!';
const XP_PER_MESSAGE = 10;
const MONEY_PER_MESSAGE = 5;

// 👤 Créer/récupérer utilisateur
function getUser(userId) {
  let user = db.prepare('SELECT * FROM users WHERE userId = ?').get(userId);
  if (!user) {
    db.prepare('INSERT INTO users (userId) VALUES (?)').run(userId);
    user = { userId, xp: 0, money: 0, messages: 0 };
  }
  return user;
}

// ⬆️ Ajouter XP
function addXp(userId, amount) {
  const user = getUser(userId);
  const newXp = user.xp + amount;
  db.prepare('UPDATE users SET xp = ? WHERE userId = ?').run(newXp, userId);
  return newXp;
}

// 💰 Ajouter argent
function addMoney(userId, amount) {
  const user = getUser(userId);
  db.prepare('UPDATE users SET money = money + ? WHERE userId = ?').run(amount, userId);
}

// 🚀 Bot prêt
client.once('ready', () => {
  console.log(`✅ Bot connecté : ${client.user.tag}`);
  client.user.setActivity('des messages | !aide', { type: 'WATCHING' });
});

// 📨 Messages
let userCooldowns = {}; // Cooldown anti-spam

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // === GAINS D'XP ===
  const now = Date.now();
  if (!userCooldowns[message.author.id] || now - userCooldowns[message.author.id] > 30000) {
    getUser(message.author.id);
    addXp(message.author.id, XP_PER_MESSAGE);
    addMoney(message.author.id, MONEY_PER_MESSAGE);
    userCooldowns[message.author.id] = now;
    console.log(`+${XP_PER_MESSAGE} XP & +${MONEY_PER_MESSAGE}💰 pour ${message.author.username}`);
  }

  // === COMMANDES ===
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();
  const user = getUser(message.author.id);

  try {
    // !profil
    if (cmd === 'profil') {
      const embed = new EmbedBuilder()
        .setTitle(`👤 Profil de ${message.author.username}`)
        .setThumbnail(message.author.displayAvatarURL())
        .addFields(
          { name: '💰 Argent', value: `${user.money} 💰`, inline: true },
          { name: '📊 XP', value: `${user.xp} XP`, inline: true },
          { name: '💬 Messages', value: `${user.messages}`, inline: true }
        )
        .setColor('#00FF00');

      return message.reply({ embeds: [embed] });
    }

    // !leaderboard
    if (cmd === 'leaderboard' || cmd === 'top') {
      const top = db.prepare('SELECT * FROM users ORDER BY xp DESC LIMIT 10').all();
      
      let description = '';
      top.forEach((u, i) => {
        description += `**${i + 1}.** <@${u.userId}> - ${u.xp} XP (${u.money}💰)\n`;
      });

      const embed = new EmbedBuilder()
        .setTitle('🏆 LEADERBOARD XP')
        .setDescription(description || 'Pas de données')
        .setColor('#FFD700');

      return message.reply({ embeds: [embed] });
    }

    // !aide
    if (cmd === 'aide' || cmd === 'help') {
      const embed = new EmbedBuilder()
        .setTitle('📖 AIDE')
        .setDescription(
          '**Écris des messages** pour gagner XP et argent !\n\n' +
          '`!profil` - Tes stats\n' +
          '`!leaderboard` - Top 10\n' +
          '`!reset` - Réinitialiser (DEV)'
        )
        .setColor('#0099FF');

      return message.reply({ embeds: [embed] });
    }

    // !reset (admin)
    if (cmd === 'reset' && message.author.id === 'TON_ID_DISCORD') {
      db.exec('DELETE FROM users');
      return message.reply('✅ Base de données réinitialisée');
    }

  } catch (err) {
    console.error(err);
    message.reply('❌ Erreur');
  }
});

// 🔑 Token
client.login(process.env.DISCORD_TOKEN || 'TON_TOKEN');
