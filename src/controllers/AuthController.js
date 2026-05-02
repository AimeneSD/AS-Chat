const AuthController = {
    register: async (req, res) => {
        // Logique d'inscription à venir
        res.status(200).json({ message: "Register endpoint for AS-Chat" });
    },
    login: async (req, res) => {
        // Logique de connexion à venir
        res.status(200).send("ENDPOINT DE LOGIN")
        
    }
};

module.exports = AuthController;
