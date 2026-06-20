const { db } = require('./database');

// Items par défaut dans la boutique
const DEFAULT_SHOP_ITEMS = [
  { name: 'Potion de Chance', cost: 100, description: 'Augmente la chance de gagner plus XP', emoji: '🍀' },
  { name: 'Booster XP +25%', cost: 250, description: 'Gagne 25% plus d\'XP pendant 1 heure', emoji: '⚡' },
  { name: 'Badge VIP', cost: 500, description: 'Affiche un badge VIP sur ton profil', emoji: '⭐' },
  { name: 'Rôle de Légende', cost: 1000, description: 'Obtiens un rôle spécial sur le serveur', emoji: '👑' },
  { name: 'Custom Titre', cost: 750, description: 'Crée un titre personnalisé', emoji: '✨' },
];

// Initialiser la boutique avec les items par défaut
function initializeShop() {
  const existingItems = db.prepare('SELECT COUNT(*) as count FROM shop_items').get();
  
  if (existingItems.count === 0) {
    const insert = db.prepare(
      'INSERT INTO shop_items (name, cost, description, emoji) VALUES (?, ?, ?, ?)'
    );

    for (const item of DEFAULT_SHOP_ITEMS) {
      insert.run(item.name, item.cost, item.description, item.emoji);
    }
    
    console.log('✅ Boutique initialisée avec les items par défaut');
  }
}

// Obtenir tous les items
function getAllItems() {
  return db.prepare('SELECT * FROM shop_items').all();
}

// Obtenir un item spécifique
function getItem(itemId) {
  return db.prepare('SELECT * FROM shop_items WHERE itemId = ?').get(itemId);
}

// Acheter un item
function buyItem(userId, itemId) {
  const { getUser, removeMoney } = require('./database');
  const item = getItem(itemId);
  const user = getUser(userId);

  if (!item || !user) return { success: false, message: 'Item ou utilisateur introuvable' };
  if (user.money < item.cost) return { success: false, message: 'Argent insuffisant' };

  // Retirer l'argent
  if (!removeMoney(userId, item.cost)) {
    return { success: false, message: 'Erreur lors du paiement' };
  }

  // Ajouter à l'inventaire
  const existing = db.prepare(
    'SELECT id FROM inventory WHERE userId = ? AND itemId = ?'
  ).get(userId, itemId);

  if (existing) {
    db.prepare('UPDATE inventory SET quantity = quantity + 1 WHERE id = ?').run(existing.id);
  } else {
    db.prepare('INSERT INTO inventory (userId, itemId, quantity) VALUES (?, ?, 1)').run(userId, itemId);
  }

  return { success: true, message: `✅ Tu as acheté **${item.name}** pour **${item.cost}💰**` };
}

// Obtenir l'inventaire d'un utilisateur
function getInventory(userId) {
  return db.prepare(`
    SELECT 
      i.id,
      i.quantity,
      s.itemId,
      s.name,
      s.emoji,
      s.description,
      s.cost
    FROM inventory i
    JOIN shop_items s ON i.itemId = s.itemId
    WHERE i.userId = ?
  `).all(userId);
}

// Utiliser un item (optionnel)
function useItem(userId, itemId) {
  const inventory = db.prepare(
    'SELECT id, quantity FROM inventory WHERE userId = ? AND itemId = ?'
  ).get(userId, itemId);

  if (!inventory || inventory.quantity <= 0) {
    return { success: false, message: 'Item non trouvé dans l\'inventaire' };
  }

  // Réduire la quantité
  if (inventory.quantity === 1) {
    db.prepare('DELETE FROM inventory WHERE id = ?').run(inventory.id);
  } else {
    db.prepare('UPDATE inventory SET quantity = quantity - 1 WHERE id = ?').run(inventory.id);
  }

  return { success: true, message: 'Item utilisé !' };
}

// Ajouter un nouvel item à la boutique (pour les admins)
function addShopItem(name, cost, description, emoji) {
  try {
    db.prepare(
      'INSERT INTO shop_items (name, cost, description, emoji) VALUES (?, ?, ?, ?)'
    ).run(name, cost, description, emoji);
    return { success: true, message: 'Item ajouté à la boutique' };
  } catch (error) {
    return { success: false, message: 'Erreur : cet item existe déjà' };
  }
}

module.exports = {
  initializeShop,
  getAllItems,
  getItem,
  buyItem,
  getInventory,
  useItem,
  addShopItem
};
