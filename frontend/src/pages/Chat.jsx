import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SocketProvider } from '../contexts/SocketContext';
import { friendService, userService } from '../services/api';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';

/**
 * Page principale du chat — Phase 3.
 * SocketProvider enveloppe le tout pour distribuer les événements temps réel.
 */
function Chat() {
  const { user, logout } = useAuth();

  const [friends, setFriends]               = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [searchQuery, setSearchQuery]       = useState('');
  const [searchResults, setSearchResults]   = useState([]);
  const [isSearching, setIsSearching]       = useState(false);

  // Chargement initial de la liste d'amis
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const { data } = await friendService.getFriends();
        setFriends(data);
      } catch (err) {
        console.error('Erreur chargement amis :', err);
      }
    };
    loadFriends();
  }, []);

  // ── Callback passé au SocketProvider ────────────────────────────────────────
  // Appelé quand un ami passe online ou offline.
  // useCallback évite de recréer la fonction et de déclencher des re-renders inutiles.
  const handleFriendStatusChange = useCallback((userId, newStatus) => {
    setFriends((prev) =>
      prev.map((f) => f.id === userId ? { ...f, status: newStatus } : f)
    );
    // Met aussi à jour le statut dans la fenêtre de conversation si elle est ouverte
    setSelectedFriend((prev) =>
      prev?.id === userId ? { ...prev, status: newStatus } : prev
    );
  }, []);

  // Recherche d'utilisateurs (avec debounce de 400ms)
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const debounce = setTimeout(async () => {
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

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    // SocketProvider écoute les événements globaux (online/offline, nouveaux messages)
    // et les distribue via useSocket() à tous les composants enfants.
    <SocketProvider
      currentUserId={user?.id}
      selectedFriendId={selectedFriend?.id}
      onFriendStatusChange={handleFriendStatusChange}
    >
      <div className="fixed inset-0 flex bg-[#0d1117]">
        <Sidebar
          user={user}
          friends={friends}
          selectedFriend={selectedFriend}
          onSelectFriend={(friend) => {
            setSelectedFriend(friend);
            setSearchQuery('');
            setSearchResults([]);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          onLogout={logout}
        />

        <ChatWindow
          currentUser={user}
          friend={selectedFriend}
        />
      </div>
    </SocketProvider>
  );
}

export default Chat;
