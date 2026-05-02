/**
 * Modèle User pour AS-Chat
 */
class User {
    /**
     * @param {string} username 
     * @param {string} email 
     * @param {string} password 
     * @param {string} role 
     */
    constructor(username, email, password, role = 'user') {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }
}

module.exports = User;
