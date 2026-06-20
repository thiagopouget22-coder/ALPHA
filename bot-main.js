const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');

// Importer les modules
const { initializeShop } = require('./shop');
const { handleMessageXp } = require('./events');
const { profCommand, shopCommand, buyCommand, inventoryCommand, leaderboardCommand } = require('./commands');

// Initialiser le client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Configuration
const PREFIX = '!';
const TOKEN = process.env.DISCORD_TOKEN || 'TON_TOKEN_ICI';

// Événement : Bot connecté
client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
  
  // Initialiser la boutique
  initializeShop();
  
  // Statut du bot
  client.user.setActivity('des messages | !aide', { type: 'WATCHING' });
});

// Événement : Message reçu
client.on('messageCreate', async (message) => {
  // Ignorer les messages des bots et sans prefix
  if (message.author.bot) return;

  // === SYSTÈME D'XP ===
  // Tous les messages donnent de l'XP (pas besoin du prefix)
  await handleMessageXp(message);

  // === COMMANDES ===
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  try {
    switch (commandName) {
      // 👤 Afficher le profil
      case 'profil':
      case 'profile':
      case 'stats':
        await profCommand(message, args);
        break;

      // 🛍️ Afficher la boutique
      case 'boutique':
      case 'shop':
        await shopCommand(message, args);
        break;

      // 💳 Acheter un item
      case 'acheter':
      case 'buy':
        await buyCommand(message, args);
        break;

      // 📦 Voir l'inventaire
      case 'inventaire':
      case 'inventory':
      case 'inv':
        await inventoryCommand(message, args);
        break;

      // 🏆 Voir le leaderboard
      case 'leaderboard':
      case 'top':
      case 'lb':
        await leaderboardCommand(message, args);
        break;

      // ❓ Aide
      case 'aide':
      case 'help':
      case '?':
        const helpEmbed = {
          color: 0x0099FF,
          title: '📖 AIDE - Système de Jeu',
          fields: [
            {
              name: '💰 Gagner de l\'argent et de l\'XP',
              value: 'Écris simplement des messages ! Tu gagnes du XP et de l\'argent automatiquement.'
            },
            {
              name: '👤 Commandes de Profil',
              value: '`!profil [@user]` - Afficher les stats\n`!leaderboard` - Voir le top 10'
            },
            {
              name: '🛍️ Commandes de Boutique',
              value: '`!boutique` - Voir tous les items\n`!acheter <numéro>` - Acheter un item\n`!inventaire` - Voir tes items'
            },
            {
              name: '🎯 Système de Rang',
              value: 'Bronze 🥉 → Argent 🥈 → Or 🥇 → Platine 💎 → Diamant ✨ → Légende 👑'
            }
          ],
          timestamp: new Date()
        };
        await message.reply({ embeds: [helpEmbed] });
        break;

      default:
        // Commande inconnue (optionnel)
        break;
    }
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la commande:', error);
    await message.reply('❌ Une erreur s\'est produite lors de l\'exécution de la commande.');
  }
});

// Gestion des erreurs
client.on('error', error => console.error('Erreur Discord.js:', error));

process.on('unhandledRejection', error => console.error('Promise rejection:', error));

// Lancer le bot
client.login(TOKEN);

module.exports = client;
