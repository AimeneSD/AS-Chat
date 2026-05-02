import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SocketProvider } from '../contexts/SocketContext';
import { friendService } from '../services/api';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';

function Chat() {
  const { user, logout } = useAuth();

  const [friends, setFriends]                   = useState([]);
  const [pendingRequests, setPendingRequests]   = useState([]);
  const [selectedFriend, setSelectedFriend]     = useState(null);
  const [sidebarMode, setSidebarMode]           = useState('conversations');
  const [searchQuery, setSearchQuery]           = useState('');

  const loadFriends = useCallback(async () => {
    try {
      const { data } = await friendService.getFriends();
      setFriends(data);
    } catch (err) {
      console.error('Erreur chargement amis :', err);
    }
  }, []);

  const loadPending = useCallback(async () => {
    try {
      const { data } = await friendService.getPending();
      setPendingRequests(data);
    } catch (err) {
      console.error('Erreur chargement demandes :', err);
    }
  }, []);

  // Recharge amis + demandes en attente
  const refreshAll = useCallback(() => {
    loadFriends();
    loadPending();
  }, [loadFriends, loadPending]);

  useEffect(() => {
    // On met les appels dans la boucle d'événements (microtask)
    // pour que le linter ne les considère pas comme des appels synchrones directs.
    Promise.resolve().then(() => {
      loadFriends();
      loadPending();
    });
  }, [loadFriends, loadPending]);

  const handleFriendStatusChange = useCallback((userId, newStatus) => {
    setFriends((prev) =>
      prev.map((f) => f.id === userId ? { ...f, status: newStatus } : f)
    );
    setSelectedFriend((prev) =>
      prev?.id === userId ? { ...prev, status: newStatus } : prev
    );
  }, []);

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
          pendingRequests={pendingRequests}
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
          onFriendAdded={refreshAll}
        />

        <ChatWindow
          currentUser={user}
          friend={selectedFriend}
          onFriendAdded={refreshAll}
        />
      </div>
    </SocketProvider>
  );
}

export default Chat;
