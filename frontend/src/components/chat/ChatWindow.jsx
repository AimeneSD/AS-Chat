import { useState, useEffect, useRef } from 'react';
import { messageService, } from '../../services/api';
import { getSocket } from '../../socket/socket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

/**
 * ChatWindow — Phase 3 UX refactor.
 *
 * L'empty state est maintenant une zone d'action :
 * on peut chercher un utilisateur par pseudo et lui envoyer une demande d'ami.
 */
/**
 * Sous-composant pour l'en-tête du chat
 */
function ChatHeader({ friend, isTyping }) {
  return (
    <div className="shrink-0 h-16 bg-[#162516] border-b border-white/5 flex items-center px-6 gap-4">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-lg">
          {friend.avatar_url
            ? <img src={friend.avatar_url} alt={friend.username} className="w-full h-full rounded-full object-cover" />
            : friend.username?.[0]?.toUpperCase()
          }
        </div>
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#161b22] transition-colors duration-500 ${friend.status === 'online' ? 'bg-green-400' : 'bg-white/20'}`} />
      </div>
      <div>
        <h2 className="text-white font-semibold text-sm">{friend.username}</h2>
        <div className="text-xs min-h-[16px]">
          {isTyping
            ? <span className="text-green-400 italic animate-pulse">est en train d'écrire...</span>
            : <span className="text-white/35">{friend.status === 'online' ? 'En ligne' : 'Hors ligne'}</span>
          }
        </div>
      </div>
    </div>
  );
}

/**
 * Sous-composant pour l'état vide (aucun ami sélectionné)
 */
function EmptyChatState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#2a3d25] px-8 text-center">
      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h2 className="text-white font-bold text-lg">Vos messages</h2>
      <p className="text-white/35 text-sm mt-1 max-w-xs">
        Sélectionnez un ami dans la liste pour commencer à discuter.
      </p>
    </div>
  );
}

function ChatWindow({ currentUser, friend }) {
  const [messages, setMessages]         = useState([]);
  const [isTyping, setIsTyping]         = useState(false);
  const [loadingMsgs, setLoadingMsgs]   = useState(false);
  const [readReceipts, setReadReceipts] = useState({});

  const typingTimeoutRef = useRef(null);
  const friendId = friend?.id;

  useEffect(() => {
    if (!friendId) return;
    const load = async () => {
      setLoadingMsgs(true);
      setMessages([]);
      setReadReceipts({});
      try {
        const { data } = await messageService.getConversation(friendId);
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Erreur chargement messages :', err);
      } finally {
        setLoadingMsgs(false);
      }
    };
    load();
  }, [friendId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !friendId) return;

    const onReceive = (msg) => {
      if (msg.sender_id === friendId || msg.receiver_id === friendId) {
        setMessages((prev) => [...prev, msg]);
        socket.emit('message:read', { senderId: friendId });
      }
    };
    const onRead = ({ readBy }) => {
      if (readBy === friendId) setReadReceipts({ all: true });
    };
    const onTyping     = ({ senderId }) => { if (senderId === friendId) setIsTyping(true); };
    const onStopTyping = ({ senderId }) => { if (senderId === friendId) setIsTyping(false); };

    socket.on('message:receive',    onReceive);
    socket.on('message:read',       onRead);
    socket.on('message:typing',     onTyping);
    socket.on('message:stopTyping', onStopTyping);
    socket.emit('message:read', { senderId: friendId });

    return () => {
      socket.off('message:receive',    onReceive);
      socket.off('message:read',       onRead);
      socket.off('message:typing',     onTyping);
      socket.off('message:stopTyping', onStopTyping);
    };
  }, [friendId]);

  // Nettoyage des timers
  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
  }, []);

  const handleSend = (content) => {
    const socket = getSocket();
    if (!socket || !content.trim()) return;
    socket.emit('message:send', { receiverId: friend.id, content }, ({ success, message }) => {
      if (success) {
        setMessages((prev) => [...prev, message]);
        setReadReceipts({});
      }
    });
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('message:typing', { receiverId: friend.id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('message:stopTyping', { receiverId: friend.id });
    }, 2000);
  };

  if (!friend) {
    return <EmptyChatState />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#162014]">
      <ChatHeader friend={friend} isTyping={isTyping} />
      <MessageList
        messages={messages}
        currentUserId={currentUser?.id}
        loading={loadingMsgs}
        allRead={readReceipts.all === true}
      />
      <MessageInput onSend={handleSend} onTyping={handleTyping} disabled={!friend} />
    </div>
  );
}

export default ChatWindow;
