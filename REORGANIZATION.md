# Réorganisation du projet : AS-Chat

Ce document explique les modifications structurelles apportées pour transformer "InternSync" en **AS-Chat** avec une architecture professionnelle.

## 📁 Nouvelle Structure des Dossiers

Le projet suit désormais une structure modulaire dans un dossier `/src` :

- **`/src/config`** : Contient les configurations (Base de données, Pusher).
- **`/src/controllers`** : Logique métier (Auth, Messages, etc.).
- **`/src/middlewares`** : Sécurité et validation (JWT, RBAC).
- **`/src/models`** : Modèles de données et requêtes SQL.
- **`/src/routes`** : Définition des points d'entrée de l'API.
- **`src/app.js`** : Configuration d'Express et des middlewares.
- **`server.js`** (racine) : Point d'entrée pour lancer le serveur.

## 🛠 Changements techniques

1.  **Changement de nom** : Le projet s'appelle désormais `as-chat-api` dans le `package.json`.
2.  **Point d'entrée** : Le serveur se lance maintenant via `server.js` au lieu de `index.js`.
3.  **Nouvelles dépendances** :
    - `pusher` : Pour la messagerie en temps réel.
    - `jsonwebtoken` : Pour l'authentification sécurisée.
    - `bcryptjs` : Pour le hachage des mots de passe.
4.  **Modèle User** : Mis à jour dans `src/models/User.js` avec la structure demandée (username, role, etc.) et documenté avec JSDoc pour le typage.

## 🚀 Prochaines étapes suggérées

1.  **Base de données** : Créer les tables SQL sur Alwaysdata.
2.  **Configuration .env** : Remplir les informations de connexion MySQL et les clés Pusher.
3.  **Authentification** : Implémenter la logique réelle de `register` et `login` avec JWT.

---
*Ce document a été généré pour assurer la traçabilité des modifications effectuées.*
