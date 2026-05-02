import { createContext } from 'react';

// On crée le contexte dans un fichier séparé pour éviter les avertissements Fast Refresh de Vite
export const AuthContext = createContext(null);
