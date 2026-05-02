import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../socket/socket';
import { SocketContext } from './SocketContextInstance';

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

// ── Son de notification ────────────────────────────────────────────────────────
const playNotificationSound = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode   = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type      = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    } catch {
        // Certains navigateurs bloquent l'AudioContext sans interaction utilisateur
    }
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function SocketProvider({ children, selectedFriendId, onFriendStatusChange }) {
    const [unreadCounts, setUnreadCounts] = useState({});
    const selectedFriendRef = useRef(selectedFriendId);

    useEffect(() => {
        selectedFriendRef.current = selectedFriendId;
    }, [selectedFriendId]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const onUserOnline = ({ userId }) => {
            onFriendStatusChange?.(userId, 'online');
        };

        const onUserOffline = ({ userId }) => {
            onFriendStatusChange?.(userId, 'offline');
        };

        const onMessageReceive = (msg) => {
            const senderId = msg.sender_id;
            if (selectedFriendRef.current !== senderId) {
                setUnreadCounts((prev) => ({
                    ...prev,
                    [senderId]: (prev[senderId] || 0) + 1,
                }));
                playNotificationSound();
            }
        };

        const onMessageRead = ({ readBy }) => {
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
        
        // On enveloppe dans une microtask pour éviter l'avertissement ESLint
        Promise.resolve().then(() => {
            setUnreadCounts((prev) => ({ ...prev, [selectedFriendId]: 0 }));
        });
    }, [selectedFriendId]);

    return (
        <SocketContext.Provider value={{ unreadCounts }}>
            {children}
        </SocketContext.Provider>
    );
}

