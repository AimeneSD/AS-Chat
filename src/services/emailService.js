const { Resend } = require('resend');

// Initialise Resend avec la clé API
const resend = new Resend(process.env.RESEND_API_KEY);

const emailService = {
    /**
     * Envoie un code de vérification à 6 chiffres par e-mail
     * @param {string} email - L'adresse e-mail de destination
     * @param {string} code - Le code à 6 chiffres
     */
    sendVerificationCode: async (email, code) => {
        try {
            const data = await resend.emails.send({
                from: 'AS-Chat <onboarding@resend.dev>',
                to: [email],
                subject: 'AS-Chat - Code de vérification',
                html: `
                    <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                        <h2 style="color: #4CAF50;">AS-Chat</h2>
                        <p>Vous avez demandé à modifier vos paramètres de compte.</p>
                        <p>Voici votre code de vérification (valable 15 minutes) :</p>
                        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; padding: 15px; background: #f4f4f4; border-radius: 8px;">
                            ${code}
                        </div>
                        <p style="color: #666; font-size: 12px;">Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet e-mail.</p>
                    </div>
                `
            });
            return data;
        } catch (error) {
            console.error('[Resend Error]', error);
            throw new Error('Erreur lors de l\'envoi de l\'e-mail.');
        }
    }
};

module.exports = emailService;
