const db = require('./src/config/db');

async function alterTable() {
    try {
        console.log('Connexion à la base de données...');
        
        // Check if column exists first to avoid error if script runs twice
        const [columns] = await db.execute("SHOW COLUMNS FROM users LIKE 'verification_code'");
        
        if (columns.length === 0) {
            console.log('Ajout de verification_code et verification_expires_at...');
            await db.execute(`
                ALTER TABLE users 
                ADD COLUMN verification_code VARCHAR(100) NULL,
                ADD COLUMN verification_expires_at DATETIME NULL
            `);
            console.log('Colonnes ajoutées avec succès !');
        } else {
            console.log('Les colonnes existent déjà.');
        }

    } catch (err) {
        console.error('Erreur lors de la modification de la base de données:', err);
    } finally {
        process.exit();
    }
}

alterTable();
