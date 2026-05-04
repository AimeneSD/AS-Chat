import { useState, useEffect, useRef } from 'react';
import { messageService, userService, friendService } from '../../services/api';
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
    <div className="shrink-0 h-16 bg-[#161b22] border-b border-white/5 flex items-center px-6 gap-4">
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
 * Sous-composant pour la zone de recherche (quand aucun ami n'est sélectionné)
 */
function ChatSearchState({ 
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  setSearchResults, 
  isSearching, 
  handleAddFriend, 
  addingId, 
  addedIds 
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0d1117] px-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-3">💬</div>
          <h2 className="text-white font-bold text-lg">Nouvelle conversation</h2>
          <p className="text-white/35 text-sm mt-1">Trouvez quelqu'un par son pseudo pour commencer</p>
        </div>

        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un pseudo..."
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              if (val.trim().length < 2) setSearchResults([]);
            }}
            className="w-full bg-[#21262d] border border-white/8 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-green-500/50 transition-all"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="bg-[#21262d] border border-white/8 rounded-2xl overflow-hidden divide-y divide-white/5">
            {searchResults.map((u) => {
              const added = addedIds.has(u.id);
              return (
                <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                    {u.username?.[0]?.toUpperCase()}
                  </div>
                  <p className="flex-1 text-white text-sm font-semibold">{u.username}</p>
                  <button
                    onClick={() => handleAddFriend(u)}
                    disabled={addingId === u.id || added}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                      added
                        ? 'bg-white/10 text-white/40 cursor-default'
                        : 'bg-green-600 hover:bg-green-500 text-white'
                    }`}
                  >
                    {added ? '✓ Demande envoyée' : addingId === u.id ? '...' : '+ Ajouter'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
          <p className="text-center text-white/25 text-sm">Aucun utilisateur trouvé pour "{searchQuery}"</p>
        )}
      </div>
    </div>
  );
}

function ChatWindow({ currentUser, friend, onFriendAdded }) {
  const [messages, setMessages]         = useState([]);
  const [isTyping, setIsTyping]         = useState(false);
  const [loadingMsgs, setLoadingMsgs]   = useState(false);
  const [readReceipts, setReadReceipts] = useState({});

  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching]     = useState(false);
  const [addingId, setAddingId]           = useState(null);
  const [addedIds, setAddedIds]           = useState(new Set());

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

  useEffect(() => {
    if (searchQuery.trim().length < 2) return;
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await userService.search(searchQuery.trim());
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleAddFriend = async (targetUser) => {
    setAddingId(targetUser.id);
    try {
      await friendService.sendRequest(targetUser.id);
      setAddedIds((prev) => new Set([...prev, targetUser.id]));
      onFriendAdded?.();
    } catch (err) {
      if (err.response?.status === 409) {
        setAddedIds((prev) => new Set([...prev, targetUser.id]));
      }
    } finally {
      setAddingId(null);
    }
  };

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
    return (
      <ChatSearchState
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        isSearching={isSearching}
        handleAddFriend={handleAddFriend}
        addingId={addingId}
        addedIds={addedIds}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117]">
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


export default ChatWindow;
