const db = require('../config/db');

/**
 * Modèle Message
 * 
 * Types de messages supportés :
 *   - 'text'  : message texte classique
 *   - 'image' : fichier image (url stockée dans content)
 *   - 'file'  : pièce jointe (url stockée dans content)
 * 
 * Statuts possibles :
 *   - 'sent'      : envoyé au serveur
 *   - 'delivered' : reçu par le destinataire
 *   - 'read'      : lu par le destinataire
 */
class Message {

    // ─── Requêtes SQL ──────────────────────────────────────────────────────────

    /**
     * Crée un nouveau message en base de données.
     * @param {number} senderId    - ID de l'expéditeur
     * @param {number} receiverId  - ID du destinataire
     * @param {string} content     - Contenu du message
     * @param {string} [type]      - Type : 'text' | 'image' | 'file'
     * @returns {Promise<object>}  - Le message créé avec son id
     */
    static async create(senderId, receiverId, content, type = 'text') {
        const sql = `
            INSERT INTO messages (sender_id, receiver_id, content, type, status, created_at)
            VALUES (?, ?, ?, ?, 'sent', NOW())
        `;
        const [result] = await db.execute(sql, [senderId, receiverId, content, type]);

        return {
            id: result.insertId,
            sender_id: senderId,
            receiver_id: receiverId,
            content,
            type,
            status: 'sent',
            created_at: new Date()
        };
    }

    /**
     * Récupère la conversation entre deux utilisateurs.
     * @param {number} userId1 
     * @param {number} userId2 
     * @param {number} [limit]  - Nombre de messages à récupérer (défaut: 50)
     * @param {number} [offset] - Pagination (défaut: 0)
     * @returns {Promise<Array>}
     */
    static async getConversation(userId1, userId2, limit = 50, offset = 0) {
        const sql = `
            SELECT 
                m.id, m.sender_id, m.receiver_id, m.content, m.type, 
                m.status, m.created_at,
                u.username AS sender_username
            FROM messages m
            JOIN users u ON u.id = m.sender_id
            WHERE 
                (m.sender_id = ? AND m.receiver_id = ?)
                OR
                (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC
            LIMIT ? OFFSET ?
        `;
        const [rows] = await db.execute(sql, [userId1, userId2, userId2, userId1, limit, offset]);
        return rows;
    }

    /**
     * Marque tous les messages non lus d'une conversation comme "read".
     * @param {number} senderId   - L'auteur des messages à marquer
     * @param {number} receiverId - Celui qui les a reçus (et qui les lit maintenant)
     * @returns {Promise<number>} - Nombre de messages mis à jour
     */
    static async markAsRead(senderId, receiverId) {
        const sql = `
            UPDATE messages
            SET status = 'read'
            WHERE sender_id = ? AND receiver_id = ? AND status != 'read'
        `;
        const [result] = await db.execute(sql, [senderId, receiverId]);
        return result.affectedRows;
    }

    /**
     * Récupère le nombre de messages non lus pour un utilisateur.
     * @param {number} userId 
     * @returns {Promise<number>}
     */
    static async getUnreadCount(userId) {
        const sql = `
            SELECT COUNT(*) AS count
            FROM messages
            WHERE receiver_id = ? AND status != 'read'
        `;
        const [[row]] = await db.execute(sql, [userId]);
        return row.count;
    }

    /**
     * Supprime un message (soft delete : mise à null du contenu).
     * L'entrée est conservée en base pour maintenir l'intégrité de la conversation.
     * @param {number} messageId
     * @param {number} senderId - Seul l'auteur peut supprimer son message
     * @returns {Promise<boolean>}
     */
    static async delete(messageId, senderId) {
        const sql = `
            UPDATE messages
            SET content = NULL, type = 'deleted'
            WHERE id = ? AND sender_id = ?
        `;
        const [result] = await db.execute(sql, [messageId, senderId]);
        return result.affectedRows > 0;
    }
}

module.exports = Message;