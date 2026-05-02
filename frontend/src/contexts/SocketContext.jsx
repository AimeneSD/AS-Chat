import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getSocket } from '../socket/socket';

/**
 * SocketContext — Gère tous les événements Socket.io globaux.
 *
 * Responsabilités :
 *  - Mettre à jour le statut online/offline des amis en temps réel
 *  - Compter les messages non lus par conversation (badges)
 *  - Déclencher les notifications sonores
 *
 * Ce context est GLOBAL : il écoute dès que l'utilisateur est connecté,
 * même si aucune conversation n'est ouverte.
 */
const SocketContext = createContext(null);

// ── Son de notification ────────────────────────────────────────────────────────
// On utilise l'API Web Audio pour générer un "pop" synthétique,
// sans avoir besoin d'un fichier audio externe.
const playNotificationSound = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode   = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type      = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);           // La note
        oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); // Fondu

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    } catch {
        // Certains navigateurs bloquent l'AudioContext sans interaction utilisateur, on ignore l'erreur
    }
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function SocketProvider({ children, currentUserId, selectedFriendId, onFriendStatusChange }) {
    // Map : { [userId]: number } — nombre de messages non lus par conversation
    const [unreadCounts, setUnreadCounts] = useState({});
    const selectedFriendRef = useRef(selectedFriendId);

    // On garde une ref à jour pour éviter les closures périmées dans les listeners
    useEffect(() => {
        selectedFriendRef.current = selectedFriendId;
    }, [selectedFriendId]);

    // ── Branchement des listeners globaux ─────────────────────────────────────
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        // ── Un ami passe en ligne ──────────────────────────────────────────────
        const onUserOnline = ({ userId }) => {
            onFriendStatusChange?.(userId, 'online');
        };

        // ── Un ami passe hors ligne ────────────────────────────────────────────
        const onUserOffline = ({ userId }) => {
            onFriendStatusChange?.(userId, 'offline');
        };

        // ── Nouveau message reçu (au niveau global, pas juste dans ChatWindow) ─
        const onMessageReceive = (msg) => {
            const senderId = msg.sender_id;

            // Si la conversation avec cet expéditeur n'est pas ouverte :
            // on incrémente le badge non-lu et on joue le son
            if (selectedFriendRef.current !== senderId) {
                setUnreadCounts((prev) => ({
                    ...prev,
                    [senderId]: (prev[senderId] || 0) + 1,
                }));
                playNotificationSound();
            }
        };

        // ── Mes messages ont été lus par le destinataire ───────────────────────
        const onMessageRead = ({ readBy }) => {
            // On réinitialise le compteur de non-lus pour ce contact
            setUnreadCounts((prev) => ({ ...prev, [readBy]: 0 }));
        };

        socket.on('user:online',       onUserOnline);
        socket.on('user:offline',      onUserOffline);
        socket.on('message:receive',   onMessageReceive);
        socket.on('message:read',      onMessageRead);

        return () => {
            socket.off('user:online',      onUserOnline);
            socket.off('user:offline',     onUserOffline);
            socket.off('message:receive',  onMessageReceive);
            socket.off('message:read',     onMessageRead);
        };
    }, [onFriendStatusChange]);

    // Quand on ouvre une conversation, on remet son compteur à 0
    useEffect(() => {
        if (!selectedFriendId) return;
        setUnreadCounts((prev) => ({ ...prev, [selectedFriendId]: 0 }));
    }, [selectedFriendId]);

    return (
        <SocketContext.Provider value={{ unreadCounts }}>
            {children}
        </SocketContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSocket() {
    return useContext(SocketContext);
}
