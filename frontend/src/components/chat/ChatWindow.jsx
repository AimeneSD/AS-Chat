import { useState, useEffect, useRef } from 'react';
import { messageService } from '../../services/api';
import { getSocket } from '../../socket/socket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

/**
 * ChatWindow — Phase 3.
 * Ajouts : coches bleues (message lu), statut live depuis les props.
 */
function ChatWindow({ currentUser, friend }) {
  const [messages, setMessages]             = useState([]);
  const [isTyping, setIsTyping]             = useState(false);
  const [loadingMsgs, setLoadingMsgs]       = useState(false);
  // Map : { [messageId]: true } — messages confirmés comme lus
  const [readReceipts, setReadReceipts]     = useState({});
  const typingTimeoutRef                    = useRef(null);

  // Chargement de l'historique quand on change de conversation
  useEffect(() => {
    if (!friend) return;
    const load = async () => {
      setLoadingMsgs(true);
      setMessages([]);
      setReadReceipts({});
      try {
        const { data } = await messageService.getConversation(friend.id);
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Erreur chargement messages :', err);
      } finally {
        setLoadingMsgs(false);
      }
    };
    load();
  }, [friend?.id]);

  // Écoute des événements Socket.io pour cette conversation
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !friend) return;

    // ── Nouveau message reçu ─────────────────────────────────────
    const onReceive = (msg) => {
      if (msg.sender_id === friend.id || msg.receiver_id === friend.id) {
        setMessages((prev) => [...prev, msg]);
        // Marquer comme lu immédiatement puisque la fenêtre est ouverte
        socket.emit('message:read', { senderId: friend.id });
      }
    };

    // ── Le destinataire a lu nos messages → coches bleues ───────
    // "readBy" = l'ID de l'ami qui vient de lire
    const onRead = ({ readBy }) => {
      if (readBy === friend.id) {
        // On marque TOUS les messages envoyés à cet ami comme lus
        setReadReceipts(() => {
          const updated = {};
          // On récupère l'état actuel depuis la closure — simple approche fonctionnelle
          return { all: true }; // Signal "tous lus"
        });
      }
    };

    // ── Indicateur de frappe ─────────────────────────────────────
    const onTyping     = ({ senderId }) => { if (senderId === friend.id) setIsTyping(true); };
    const onStopTyping = ({ senderId }) => { if (senderId === friend.id) setIsTyping(false); };

    socket.on('message:receive',   onReceive);
    socket.on('message:read',      onRead);
    socket.on('message:typing',    onTyping);
    socket.on('message:stopTyping', onStopTyping);

    // On marque les messages de l'ami comme lus à l'ouverture
    socket.emit('message:read', { senderId: friend.id });

    return () => {
      socket.off('message:receive',   onReceive);
      socket.off('message:read',      onRead);
      socket.off('message:typing',    onTyping);
      socket.off('message:stopTyping', onStopTyping);
    };
  }, [friend?.id]);

  // Envoi d'un message
  const handleSend = (content) => {
    const socket = getSocket();
    if (!socket || !content.trim()) return;

    socket.emit('message:send', { receiverId: friend.id, content }, ({ success, message, error }) => {
      if (success) {
        setMessages((prev) => [...prev, message]);
        // Réinitialiser le signal "tous lus" pour les nouveaux messages
        setReadReceipts({});
      } else {
        console.error('Erreur envoi :', error);
      }
    });
  };

  // Émission de l'indicateur de frappe
  const handleTyping = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('message:typing', { receiverId: friend.id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('message:stopTyping', { receiverId: friend.id });
    }, 2000);
  };

  // ── État : aucune conversation sélectionnée ──────────────────────────────
  if (!friend) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0d1117] select-none">
        <div className="text-center space-y-4 opacity-30">
          <div className="text-8xl">💬</div>
          <h2 className="text-white text-xl font-semibold nunito-sans-font">AS-Chat</h2>
          <p className="text-white/50 text-sm">Sélectionnez une conversation pour commencer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117]">

      {/* ── Header de la conversation ───────────────────────────────── */}
      <div className="flex-shrink-0 h-16 bg-[#161b22] border-b border-white/5 flex items-center px-6 gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-lg">
            {friend.avatar_url
              ? <img src={friend.avatar_url} alt={friend.username} className="w-full h-full rounded-full object-cover" />
              : friend.username?.[0]?.toUpperCase()
            }
          </div>
          {/* Point de statut — mis à jour en temps réel via le SocketContext → Chat → props */}
          <span className={`
            absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#161b22] transition-colors duration-500
            ${friend.status === 'online' ? 'bg-green-400' : 'bg-white/20'}
          `} />
        </div>

        {/* Nom + statut ou indicateur de frappe */}
        <div>
          <h2 className="text-white font-semibold text-sm">{friend.username}</h2>
          <p className="text-xs transition-all duration-300 min-h-[16px]">
            {isTyping
              ? <span className="text-green-400 italic animate-pulse">est en train d'écrire...</span>
              : <span className="text-white/35">{friend.status === 'online' ? 'En ligne' : 'Hors ligne'}</span>
            }
          </p>
        </div>
      </div>

      {/* ── Liste des messages ───────────────────────────────────────── */}
      <MessageList
        messages={messages}
        currentUserId={currentUser?.id}
        loading={loadingMsgs}
        allRead={readReceipts.all === true}
      />

      {/* ── Champ de saisie ─────────────────────────────────────────── */}
      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        disabled={!friend}
      />
    </div>
  );
}

export default ChatWindow;
