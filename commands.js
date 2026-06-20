const { EmbedBuilder } = require('discord.js');
const { getUser, getUserStats, getLeaderboard, RANKS } = require('./database');
const { getAllItems, getInventory } = require('./shop');

// Commande : !profil
async function profCommand(message, args) {
  const target = message.mentions.users.first() || message.author;
  const userId = target.id;

  const stats = getUserStats(userId);
  if (!stats) {
    return message.reply('❌ Cet utilisateur n\'a pas encore de profil');
  }

  const embed = new EmbedBuilder()
    .setTitle(`${stats.rankEmoji} Profil de ${target.username}`)
    .setThumbnail(target.displayAvatarURL())
    .addFields(
      { name: '💰 Argent', value: `${stats.money} 💰`, inline: true },
      { name: '📊 XP', value: `${stats.xp} XP`, inline: true },
      { name: '🏆 Rang', value: `${stats.rank}`, inline: true },
      { name: '💬 Messages', value: `${stats.messages} messages`, inline: true },
      { name: '📈 Progression', value: `${stats.xp} / ${RANKS.find(r => r.name === stats.nextRank)?.minXp || '∞'} XP`, inline: true },
      { name: '⏳ Avant promotion', value: `${stats.xpNeeded} XP`, inline: true }
    )
    .setColor('#00FF00')
    .setTimestamp();

  return message.reply({ embeds: [embed] });
}

// Commande : !boutique
async function shopCommand(message, args) {
  const items = getAllItems();

  if (items.length === 0) {
    return message.reply('❌ La boutique est vide pour le moment');
  }

  let description = '';
  items.forEach((item, index) => {
    description += `**${index + 1}. ${item.emoji} ${item.name}** - ${item.cost} 💰\n`;
    description += `   └─ ${item.description}\n\n`;
  });

  const embed = new EmbedBuilder()
    .setTitle('🛍️ BOUTIQUE')
    .setDescription(description)
    .setFooter({ text: 'Utilise !acheter <numéro> pour acheter' })
    .setColor('#FFD700')
    .setTimestamp();

  return message.reply({ embeds: [embed] });
}

// Commande : !acheter <numéro>
async function buyCommand(message, args) {
  const { buyItem } = require('./shop');
  const { getOrCreateUser } = require('./database');

  if (!args[0]) {
    return message.reply('❌ Utilise : `!acheter <numéro>`');
  }

  const itemNumber = parseInt(args[0]);
  if (isNaN(itemNumber) || itemNumber < 1) {
    return message.reply('❌ Numéro d\'item invalide');
  }

  const items = getAllItems();
  const item = items[itemNumber - 1];

  if (!item) {
    return message.reply('❌ Cet item n\'existe pas');
  }

  getOrCreateUser(message.author.id, message.author.username);
  const result = buyItem(message.author.id, item.itemId);

  if (result.success) {
    return message.reply(result.message);
  } else {
    return message.reply(`❌ ${result.message}`);
  }
}

// Commande : !inventaire
async function inventoryCommand(message, args) {
  const target = message.mentions.users.first() || message.author;
  const inventory = getInventory(target.id);

  if (inventory.length === 0) {
    return message.reply('📦 L\'inventaire est vide');
  }

  let description = '';
  inventory.forEach((item, index) => {
    description += `**${index + 1}. ${item.emoji} ${item.name}** (x${item.quantity})\n`;
  });

  const embed = new EmbedBuilder()
    .setTitle(`📦 Inventaire de ${target.username}`)
    .setDescription(description)
    .setColor('#FF6B6B')
    .setTimestamp();

  return message.reply({ embeds: [embed] });
}

// Commande : !leaderboard
async function leaderboardCommand(message, args) {
  const topUsers = getLeaderboard(10);

  if (topUsers.length === 0) {
    return message.reply('❌ Pas de données sur le leaderboard');
  }

  let description = '';
  topUsers.forEach((user, index) => {
    const rankData = RANKS.find(r => r.name === user.rank);
    description += `**${index + 1}.** ${rankData?.emoji || '🔹'} **${user.username}** - ${user.xp} XP (${user.money} 💰)\n`;
  });

  const embed = new EmbedBuilder()
    .setTitle('🏆 LEADERBOARD XP')
    .setDescription(description)
    .setColor('#00BFFF')
    .setTimestamp();

  return message.reply({ embeds: [embed] });
}

// Exporter les commandes
module.exports = {
  profCommand,
  shopCommand,
  buyCommand,
  inventoryCommand,
  leaderboardCommand
};
