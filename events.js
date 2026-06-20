const { getOrCreateUser, addXp, addMoney, incrementMessages } = require('./database');

// Configuration des gains
const CONFIG = {
  XP_PER_MESSAGE: 10,        // XP gagné par message
  MONEY_PER_MESSAGE: 5,      // Argent gagné par message
  COOLDOWN_SECONDS: 30,      // Temps min entre 2 gains (cooldown)
  BONUS_LONG_MESSAGE: 5,     // XP bonus si message long (20+ caractères)
  BONUS_CONVERSATION: 3      // XP bonus pour réponse à quelqu'un
};

// Stockage des cooldowns pour éviter les spams
const cooldowns = new Map();

// Fonction principale : traiter les messages
async function handleMessageXp(message) {
  // Ignorer les bots et les messages vides
  if (message.author.bot || !message.content.trim()) return;

  const userId = message.author.id;
  const now = Date.now();

  // Vérifier le cooldown
  if (cooldowns.has(userId)) {
    const expirationTime = cooldowns.get(userId) + CONFIG.COOLDOWN_SECONDS * 1000;
    if (now < expirationTime) {
      return; // Utilisateur en cooldown
    }
  }

  // Créer/récupérer l'utilisateur
  getOrCreateUser(userId, message.author.username);

  // Calculer les gains
  let xpGain = CONFIG.XP_PER_MESSAGE;
  let moneyGain = CONFIG.MONEY_PER_MESSAGE;

  // Bonus pour messages longs
  if (message.content.length > 20) {
    xpGain += CONFIG.BONUS_LONG_MESSAGE;
  }

  // Bonus si c'est une réponse (mention ou reply)
  if (message.mentions.has(message.guild.members.me) || message.reference) {
    xpGain += CONFIG.BONUS_CONVERSATION;
  }

  // Appliquer les gains
  const result = addXp(userId, xpGain);
  addMoney(userId, moneyGain);
  incrementMessages(userId);

  // Mettre à jour le cooldown
  cooldowns.set(userId, now);

  // Notifier si l'utilisateur a monté de rang
  if (result.leveledUp) {
    const levelUpEmbed = {
      color: 0xFF00FF,
      title: '🎉 PROMOTION !',
      description: `${message.author.username} est passé au rang **${result.newRank}** !`,
      timestamp: new Date()
    };

    // Envoyer dans le canal ou en DM
    try {
      await message.channel.send({ embeds: [levelUpEmbed] });
    } catch (err) {
      console.log('Impossible d\'envoyer le message de promotion');
    }
  }
}

// Nettoyer les cooldowns expirés (optionnel, pour économiser la mémoire)
function cleanupCooldowns() {
  const now = Date.now();
  for (const [userId, timestamp] of cooldowns.entries()) {
    if (now - timestamp > CONFIG.COOLDOWN_SECONDS * 2000) {
      cooldowns.delete(userId);
    }
  }
}

// Lancer le cleanup toutes les 5 minutes
setInterval(cleanupCooldowns, 5 * 60 * 1000);

module.exports = {
  handleMessageXp,
  CONFIG,
  cleanupCooldowns
};
