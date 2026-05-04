const nodemailer = require('nodemailer');

// Configuration du transporteur SMTP (Gmail)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const emailService = {
    /**
     * Envoie un code de vérification à 6 chiffres par e-mail via Gmail
     * @param {string} email - L'adresse e-mail de destination
     * @param {string} code - Le code à 6 chiffres
     */
    sendVerificationCode: async (email, code) => {
        console.log(`[Nodemailer] Tentative d'envoi à: ${email}...`);
        try {
            const mailOptions = {
                from: `"AS-Chat" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'AS-Chat - Code de vérification',
                html: `
                    <div style="font-family: sans-serif; text-align: center; padding: 20px; color: #333;">
                        <h2 style="color: #4CAF50;">AS-Chat</h2>
                        <p>Vous avez demandé à modifier vos paramètres de compte.</p>
                        <p>Voici votre code de vérification (valable 15 minutes) :</p>
                        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; padding: 15px; background: #f4f4f4; border-radius: 8px; border: 1px solid #ddd;">
                            ${code}
                        </div>
                        <p style="color: #666; font-size: 12px;">Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet e-mail.</p>
                    </div>
                `
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('[Nodemailer] Email envoyé: ' + info.response);
            return info;
        } catch (error) {
            console.error('[Nodemailer Error]', error);
            throw new Error('Erreur lors de l\'envoi de l\'e-mail via Gmail.');
        }
    }
};

module.exports = emailService;
