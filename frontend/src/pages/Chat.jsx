import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SocketProvider } from '../contexts/SocketContext';
import { friendService } from '../services/api';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';

function Chat() {
  const { user, logout } = useAuth();

  const [friends, setFriends]               = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  // 'conversations' | 'friends'
  const [sidebarMode, setSidebarMode]       = useState('conversations');
  // Filtre local (ne fait pas d'appel API)
  const [searchQuery, setSearchQuery]       = useState('');

  const loadFriends = useCallback(async () => {
    try {
      const { data } = await friendService.getFriends();
      setFriends(data);
    } catch (err) {
      console.error('Erreur chargement amis :', err);
    }
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  // Mise à jour du statut online/offline en temps réel
  const handleFriendStatusChange = useCallback((userId, newStatus) => {
    setFriends((prev) =>
      prev.map((f) => f.id === userId ? { ...f, status: newStatus } : f)
    );
    setSelectedFriend((prev) =>
      prev?.id === userId ? { ...prev, status: newStatus } : prev
    );
  }, []);

  // Filtre local — recherche dans les amis existants uniquement
  const filteredFriends = friends.filter((f) =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SocketProvider
      currentUserId={user?.id}
      selectedFriendId={selectedFriend?.id}
      onFriendStatusChange={handleFriendStatusChange}
    >
      <div className="fixed inset-0 flex bg-[#0d1117]">
        <Sidebar
          user={user}
          friends={filteredFriends}
          allFriends={friends}
          selectedFriend={selectedFriend}
          onSelectFriend={(friend) => {
            setSelectedFriend(friend);
            setSearchQuery('');
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sidebarMode={sidebarMode}
          onSidebarModeChange={setSidebarMode}
          onLogout={logout}
          onFriendAdded={loadFriends}
        />

        <ChatWindow
          currentUser={user}
          friend={selectedFriend}
          onFriendAdded={loadFriends}
        />
      </div>
    </SocketProvider>
  );
}

export default Chat;
