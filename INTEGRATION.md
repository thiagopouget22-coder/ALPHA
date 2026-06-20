# 🔗 Guide d'Intégration - Ajouter le système à ton bot existant

Si tu as **déjà un bot Discord**, voici comment intégrer ce système au lieu de créer un nouveau bot.

---

## 📝 Option 1 : Intégration minimale (Recommandée)

### Étape 1 : Copie les fichiers de base
Copie ces fichiers dans ton projet bot :
- `database.js`
- `shop.js`
- `events.js`
- `commands.js`

### Étape 2 : Ajoute les dépendances manquantes

```bash
npm install discord.js better-sqlite3
```

### Étape 3 : Dans ton fichier `index.js` ou `main.js`

Ajoute au début du fichier (après les imports) :

```javascript
// ===== SYSTÈME DE JEU =====
const { initializeShop } = require('./shop');
const { handleMessageXp } = require('./events');
const { 
  profCommand, 
  shopCommand, 
  buyCommand, 
  inventoryCommand, 
  leaderboardCommand 
} = require('./commands');

// Initialiser la boutique au démarrage
client.once('ready', () => {
  console.log(`✅ Bot connecté : ${client.user.tag}`);
  initializeShop(); // ← Ajoute cette ligne
});
```

### Étape 4 : Ajoute l'événement messageCreate

Trouve ta gestion des messages et ajoute :

```javascript
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // === SYSTÈME D'XP (Avant les commandes) ===
  await handleMessageXp(message);

  // === TES COMMANDES EXISTANTES ===
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Ajoute les nouvelles commandes du jeu :
  switch (commandName) {
    case 'profil':
    case 'profile':
      return await profCommand(message, args);
    
    case 'boutique':
    case 'shop':
      return await shopCommand(message, args);
    
    case 'acheter':
    case 'buy':
      return await buyCommand(message, args);
    
    case 'inventaire':
    case 'inventory':
      return await inventoryCommand(message, args);
    
    case 'leaderboard':
    case 'top':
      return await leaderboardCommand(message, args);
  }

  // ... tes autres commandes
});
```

---

## 📝 Option 2 : Intégration avec un système de commandes existant

Si tu utilises déjà un système de commandes (Discord.js commands folder, SlashCommands, etc.) :

### Pour discord-command-handlers classique :

Crée un fichier `commands/game/profil.js` :

```javascript
const { profCommand } = require('../../commands');

module.exports = {
  name: 'profil',
  description: 'Affiche ton profil',
  aliases: ['profile', 'stats'],
  async execute(message, args) {
    await profCommand(message, args);
  }
};
```

Répète pour chaque commande : `boutique.js`, `acheter.js`, `inventaire.js`, `leaderboard.js`

### Pour SlashCommands :

Crée `slashCommands/game/profil.js` :

```javascript
const { SlashCommandBuilder } = require('discord.js');
const { getUserStats } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profil')
    .setDescription('Affiche ton profil')
    .addUserOption(option => 
      option.setName('user').setDescription('L\'utilisateur').setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const stats = getUserStats(user.id);
    
    if (!stats) {
      return interaction.reply('❌ Cet utilisateur n\'a pas encore de profil');
    }
    
    const embed = {
      title: `${stats.rankEmoji} Profil de ${user.username}`,
      color: 0x00FF00,
      fields: [
        { name: '💰 Argent', value: `${stats.money} 💰`, inline: true },
        { name: '📊 XP', value: `${stats.xp} XP`, inline: true },
        { name: '🏆 Rang', value: stats.rank, inline: true },
      ]
    };
    
    interaction.reply({ embeds: [embed] });
  }
};
```

---

## 🛡️ Permissions Discord

Assure-toi que ton bot a ces permissions :
- ✅ Send Messages (Envoyer des messages)
- ✅ Embed Links (Utiliser les embeds)
- ✅ Read Message History (Lire l'historique)
- ✅ Mention Everyone (@everyone, @here)

---

## 🔑 Configuration avancée

### Utiliser une base de données externe (MongoDB)

Si tu veux utiliser MongoDB au lieu de SQLite :

1. Installe `mongoose` :
```bash
npm install mongoose
```

2. Contacte-moi pour une version MongoDB

### Ajouter des perms admin aux commandes

Dans `commands.js`, avant chaque commande :

```javascript
async function addShopItemCommand(message, args) {
  // Vérifier les permissions
  if (!message.member.permissions.has('ADMINISTRATOR')) {
    return message.reply('❌ Tu dois être admin');
  }
  // ... reste du code
}
```

---

## ✅ Checklist d'intégration

- [ ] Dépendances installées (`npm install`)
- [ ] Fichiers copiés dans le projet
- [ ] Token bot configuré
- [ ] Événement `messageCreate` mis à jour
- [ ] Commandes ajoutées
- [ ] Bot redémarré
- [ ] Test : Écris un message → vérifie les gains
- [ ] Test : `!profil` → affiche les stats
- [ ] Test : `!boutique` → affiche les items

---

## 🎯 Prochaines étapes

Une fois intégré, tu peux :
1. **Personnaliser** les XP, argent, rangs
2. **Ajouter** de nouveaux items à la boutique
3. **Créer** des commandes admin (`!additem`)
4. **Configurer** un canal spécial pour la boutique

---

## 💡 Astuces

- **Teste en local** avant de déployer
- **Sauvegarde ton code** régulièrement
- **Fais des backups** de `game.db` régulièrement
- **Log les erreurs** pour déboguer plus tard

---

**Besoin d'aide ? N'hésite pas à poser tes questions ! 💬**
