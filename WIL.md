# WHAT I LEARNED


- **CSRF(Cross-site Request Forgery)** : Attaque qui consiste à exploiter la confiance d'un site web envers l'utilisateur pour effectuer des actions non désirées. **Mis en place avec un middleware authMiddleware.js**
- **Stockage JWT** : Ne jamais stocker un JWT dans le localStorage car un attaquant peut exploiter une faille XSS pour voler le token et procéder par une attaque CSRF. Le stocker impérativement dans des cookies HTTP-only et secure.
- **Usage de chiffrement BCrypt** : Utilisation de l'algorithme de chiffrement BCrypt pour sécuriser les mots de passe des utilisateurs et empêcher les attaquants de faire des attaques par force brute ou par dictionnaire ou rainbow table(Ajout d'un salt aléatoire à chaque mot de passe).
- **SPA (Single Page Application)** : une application web qui se charge une seule fois et met à jour dynamiquement le contenu sans recharger la page **mis en place avec React Router**.
- **Server-side rendering (SSR)** : le rendu coté serveur (SSR) consiste à générer la page html sur le serveur au lieu du navigateur du client (à faire avec Next.js).
- **Static-site generation (SSG)** : la génération de site statique consiste à générer la page html sur le serveur au lieu du navigateur du client (à faire avec Next.js).
- **Lazy loading** : le chargement différé est une technique qui permet de charger des composants de manière asynchrone (à faire avec React.lazy et Suspense).
- **Progressive Web App (PWA)** : Progressive Web App (PWA) est une technologie qui permet de transformer une application web en une application mobile (à faire avec Next.js).
- **Skeleton screens** : les écrans squelettes sont des représentations visuelles qui permettent d'afficher un aperçu du contenu de la page pendant le chargement (à faire avec react-loading-skeleton).
- **Optimistic Updates** : l'optimistic update est une technique qui permet de mettre à jour l'interface utilisateur de manière immédiate sans attendre la réponse du serveur
- **Virtual Scrolling** : le scrolling virtuel est une technique qui permet d'afficher un grand nombre d'éléments dans une liste sans affecter les performances
- **Stale-While-Revalidate (SWR)** : le stale-while-revalidate (SWR) est une technique de cache qui permet de mettre à jour l'interface utilisateur de manière immédiate sans attendre la réponse du serveur (à faire avec swr)
- **SPA transitions** : les transitions de SPA sont des animations qui permettent de rendre l'application plus fluide (à faire avec Framer Motion).