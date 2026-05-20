const db = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * Modèle User pour AS-Chat
 *
 * Statuts de présence possibles :
 *   - 'online'  : connecté
 *   - 'offline' : déconnecté
 */
class User {

    // ─── Requêtes SQL ──────────────────────────────────────────────────────────

    /**
     * Crée un nouvel utilisateur en base avec un mot de passe haché.
     * @param {string} username
     * @param {string} email
     * @param {string} password - Mot de passe en clair (sera haché ici)
     * @returns {Promise<object>} - L'utilisateur créé (sans le mot de passe)
     */
    static async create(username, email, password) {
        // On hache le mot de passe avant de l'insérer (saltRounds = 10 : bon équilibre sécurité/perf)
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (username, email, password, status, created_at)
            VALUES (?, ?, ?, 'offline', NOW())
        `;
        const [result] = await db.execute(sql, [username, email, hashedPassword]);

        return {
            id: result.insertId,
            username,
            email,
            status: 'offline',
        };
    }

    /**
     * Recherche un utilisateur par son email.
     * Utilisé lors du login pour récupérer le hash à comparer.
     * @param {string} email
     * @returns {Promise<object|null>} - L'utilisateur complet ou null si introuvable
     */
    static async findByEmail(email) {
        const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;
        const [rows] = await db.execute(sql, [email]);
        return rows[0] || null;
    }

    /**
     * Recherche un utilisateur par son username EXACT.
     * @param {string} username
     * @returns {Promise<object|null>}
     */
    static async findByUsername(username) {
        const sql = `SELECT id, username, avatar_url, status FROM users WHERE username = ? LIMIT 1`;
        const [rows] = await db.execute(sql, [username]);
        return rows[0] || null;
    }

    /**
     * Recherche un utilisateur par son ID.
     * Retourne les données sans le mot de passe (sécurité).
     * @param {number} id
     * @returns {Promise<object|null>}
     */
    static async findById(id) {
        const sql = `
            SELECT id, username, email, avatar_url, status, created_at
            FROM users
            WHERE id = ?
            LIMIT 1
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0] || null;
    }

    /**
     * Cherche des utilisateurs dont le username contient le terme de recherche.
     * Utilisé pour la fonctionnalité "Nouvelle conversation".
     * @param {string} query       - Terme de recherche
     * @param {number} excludeId   - Exclure l'utilisateur connecté des résultats
     * @returns {Promise<Array>}
     */
    static async search(query, excludeId) {
        const sql = `
            SELECT id, username, avatar_url, status
            FROM users
            WHERE username LIKE ? AND id != ?
            LIMIT 20
        `;
        // Le % autour permet de chercher "partout dans le username"
        const [rows] = await db.execute(sql, [`%${query}%`, excludeId]);
        return rows;
    }

    /**
     * Met à jour le statut de présence (online/offline).
     * Appelé par Socket.io lors de la connexion/déconnexion.
     * @param {number} userId
     * @param {'online'|'offline'} status
     * @returns {Promise<void>}
     */
    static async setStatus(userId, status) {
        const sql = `UPDATE users SET status = ? WHERE id = ?`;
        await db.execute(sql, [status, userId]);
    }

    /**
     * Met à jour le profil de l'utilisateur.
     * @param {number} userId
     * @param {object} fields - Champs à mettre à jour : { username, avatar_url }
     * @returns {Promise<object|null>} - Le profil mis à jour
     */
    static async updateProfile(userId, fields) {
        const allowed = ['username', 'avatar_url'];
        const updates = [];
        const values = [];

        // On construit dynamiquement la requête pour n'updater que ce qui est fourni
        for (const key of allowed) {
            if (fields[key] !== undefined) {
                updates.push(`${key} = ?`);
                values.push(fields[key]);
            }
        }

        if (updates.length === 0) return null;

        values.push(userId);
        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        await db.execute(sql, values);

        return User.findById(userId);
    }

    /**
     * Vérifie qu'un mot de passe en clair correspond au hash stocké en base.
     * @param {string} plainPassword   - Saisi par l'utilisateur au login
     * @param {string} hashedPassword  - Récupéré depuis la base de données
     * @returns {Promise<boolean>}
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Récupère le mot de passe hashé d'un utilisateur
     */
    static async findPasswordById(id) {
        const sql = `SELECT password FROM users WHERE id = ? LIMIT 1`;
        const [rows] = await db.execute(sql, [id]);
        return rows[0]?.password || null;
    }


    /**
     * Met à jour le mot de passe d'un utilisateur
     */
    static async updatePassword(userId, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const sql = `UPDATE users SET password = ? WHERE id = ?`;
        await db.execute(sql, [hashedPassword, userId]);
    }

    /**
     * Supprime le compte d'un utilisateur
     */
    static async deleteAccount(userId) {
        const sql = `DELETE FROM users WHERE id = ?`;
        await db.execute(sql, [userId]);
    }
}

module.exports = User;
