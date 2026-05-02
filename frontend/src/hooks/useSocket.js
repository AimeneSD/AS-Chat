import { useContext } from 'react';
import { SocketContext } from '../contexts/SocketContextInstance';

/**
 * useSocket — Hook personnalisé pour accéder au contexte Socket.
 * Séparé pour satisfaire les règles strictes du Fast Refresh de Vite.
 */
export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket doit être utilisé à l\'intérieur d\'un <SocketProvider>');
    }
    return context;
}
