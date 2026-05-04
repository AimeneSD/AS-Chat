# AS-Chat 

AS-Chat est une application de messagerie instantanée moderne et réactive, construite avec une architecture découplée. Elle permet aux utilisateurs de créer des comptes, de s'ajouter en amis et de discuter en temps réel.

## Stack

### Frontend
*   **React** avec **Vite** pour un développement rapide.
*   **TailwindCSS** pour un design fluide, réactif et moderne.
*   **Socket.io-client** pour la communication temps réel.

### Backend
*   **Node.js** & **Express** pour l'API REST.
*   **MySQL** pour la base de données relationnelle.
*   **Socket.io** pour gérer les événements en direct (messages, statut en ligne, saisie en cours).
*   **JWT (JSON Web Tokens)** pour l'authentification sécurisée.

## Installation & Démarrage

### Prérequis
*   Node.js (v18+)
*   MySQL

### Configuration du Backend
1. À la racine du projet, installez les dépendances :
   ```bash
   npm install
   ```
2. Créez un fichier `.env` basé sur `.env.example` et configurez votre base de données MySQL.
3. Démarrez le serveur :
   ```bash
   npm run dev
   ```

### Configuration du Frontend
1. Allez dans le dossier `frontend` :
   ```bash
   cd frontend
   npm install
   ```
2. Démarrez l'application React :
   ```bash
   npm run dev
   ```

## Architecture & Sécurité

### Authentification & Protection CSRF
L'application utilise une authentification basée sur les **Tokens JWT**.
Contrairement aux architectures traditionnelles utilisant des cookies de session, AS-Chat stocke le token JWT côté client (localStorage) et l'envoie explicitement dans les requêtes via le header HTTP `Authorization: Bearer <token>`.