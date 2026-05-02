const db = require('../config/db');

/**
 * Modèle Friend
 *
 * Statuts possibles de la relation :
 *   - 'pending'  : demande envoyée, en attente de réponse
 *   - 'accepted' : amis confirmés (conversation possible)
 *   - 'blocked'  : l'un a bloqué l'autre
 *
 * Convention : l'utilisateur qui envoie la demande est toujours "requester_id",
 * celui qui la reçoit est toujours "addressee_id".
 */
class Friend {

    // ─── Requêtes SQL ──────────────────────────────────────────────────────────

    /**
     * Envoie une demande d'ami.
     * @param {number} requesterId - Celui qui envoie la demande
     * @param {number} addresseeId - Celui qui la reçoit
     * @returns {Promise<object>}
     */
    static async sendRequest(requesterId, addresseeId) {
        const sql = `
            INSERT INTO friends (requester_id, addressee_id, status, created_at)
            VALUES (?, ?, 'pending', NOW())
        `;
        const [result] = await db.execute(sql, [requesterId, addresseeId]);

        return {
            id: result.insertId,
            requester_id: requesterId,
            addressee_id: addresseeId,
            status: 'pending',
        };
    }

    /**
     * Accepte une demande d'ami.
     * Seul l'addressee peut accepter.
     * @param {number} requesterId - Celui qui avait envoyé la demande
     * @param {number} addresseeId - Celui qui accepte
     * @returns {Promise<boolean>}
     */
    static async acceptRequest(requesterId, addresseeId) {
        const sql = `
            UPDATE friends
            SET status = 'accepted'
            WHERE requester_id = ? AND addressee_id = ? AND status = 'pending'
        `;
        const [result] = await db.execute(sql, [requesterId, addresseeId]);
        return result.affectedRows > 0;
    }

    /**
     * Refuse ou annule une demande d'ami (suppression de la ligne).
     * Peut être appelé par le requester (annulation) ou l'addressee (refus).
     * @param {number} userId1
     * @param {number} userId2
     * @returns {Promise<boolean>}
     */
    static async declineOrCancel(userId1, userId2) {
        const sql = `
            DELETE FROM friends
            WHERE (requester_id = ? AND addressee_id = ?)
               OR (requester_id = ? AND addressee_id = ?)
        `;
        const [result] = await db.execute(sql, [userId1, userId2, userId2, userId1]);
        return result.affectedRows > 0;
    }

    /**
     * Bloque un utilisateur.
     * Si une relation existait déjà (pending ou accepted), elle est écrasée.
     * @param {number} blockerId  - Celui qui bloque
     * @param {number} blockedId  - Celui qui est bloqué
     * @returns {Promise<void>}
     */
    static async block(blockerId, blockedId) {
        // On supprime d'abord toute relation existante dans les deux sens
        await Friend.declineOrCancel(blockerId, blockedId);

        const sql = `
            INSERT INTO friends (requester_id, addressee_id, status, created_at)
            VALUES (?, ?, 'blocked', NOW())
        `;
        await db.execute(sql, [blockerId, blockedId]);
    }

    /**
     * Récupère la liste d'amis confirmés d'un utilisateur.
     * Retourne les infos de l'ami (pas les IDs de la table friends).
     * @param {number} userId
     * @returns {Promise<Array>}
     */
    static async getFriends(userId) {
        const sql = `
            SELECT 
                u.id, u.username, u.avatar_url, u.status
            FROM friends f
            JOIN users u ON (
                CASE
                    WHEN f.requester_id = ? THEN u.id = f.addressee_id
                    ELSE u.id = f.requester_id
                END
            )
            WHERE (f.requester_id = ? OR f.addressee_id = ?)
              AND f.status = 'accepted'
            ORDER BY u.username ASC
        `;
        const [rows] = await db.execute(sql, [userId, userId, userId]);
        return rows;
    }

    /**
     * Récupère les demandes d'ami reçues et en attente.
     * Utilisé pour la section "Notifications / Demandes".
     * @param {number} userId
     * @returns {Promise<Array>}
     */
    static async getPendingRequests(userId) {
        const sql = `
            SELECT 
                f.id AS request_id,
                f.created_at AS requested_at,
                u.id, u.username, u.avatar_url
            FROM friends f
            JOIN users u ON u.id = f.requester_id
            WHERE f.addressee_id = ? AND f.status = 'pending'
            ORDER BY f.created_at DESC
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }

    /**
     * Vérifie la relation entre deux utilisateurs.
     * Utile pour savoir si on peut afficher le bouton "Envoyer un message".
     * @param {number} userId1
     * @param {number} userId2
     * @returns {Promise<'accepted'|'pending'|'blocked'|null>} - null = aucune relation
     */
    static async getRelationship(userId1, userId2) {
        const sql = `
            SELECT status
            FROM friends
            WHERE (requester_id = ? AND addressee_id = ?)
               OR (requester_id = ? AND addressee_id = ?)
            LIMIT 1
        `;
        const [rows] = await db.execute(sql, [userId1, userId2, userId2, userId1]);
        return rows[0]?.status || null;
    }
}

module.exports = Friend;
