import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SocketProvider } from '../contexts/SocketContext';
import { friendService } from '../services/api';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import SettingsModal from '../components/settings/SettingsModal';

function Chat() {
  const { user, logout } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [friends, setFriends]               = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [sidebarMode, setSidebarMode]       = useState('conversations');
  const [searchQuery, setSearchQuery]       = useState('');
  // Mobile : true = afficher le chat, false = afficher la sidebar
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

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

  const refreshAll = useCallback(() => {
    loadFriends();
    loadPending();
  }, [loadFriends, loadPending]);

  useEffect(() => {
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

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    setSearchQuery('');
    setShowChatOnMobile(true); // Sur mobile : basculer vers la vue chat
  };

  const handleBackToSidebar = () => {
    setShowChatOnMobile(false);
  };

  return (
    <SocketProvider
      currentUserId={user?.id}
      selectedFriendId={selectedFriend?.id}
      onFriendStatusChange={handleFriendStatusChange}
    >
      <div className="fixed inset-0 flex bg-[#0d1117]">

        {/* Sidebar — plein écran sur mobile (cachée si un ami est sélectionné), fixe sur md+ */}
        <div className={`
          ${showChatOnMobile ? 'hidden' : 'flex'} md:flex
          w-full md:w-80 shrink-0 h-full
        `}>
          <Sidebar
            user={user}
            friends={filteredFriends}
            pendingRequests={pendingRequests}
            selectedFriend={selectedFriend}
            onSelectFriend={handleSelectFriend}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sidebarMode={sidebarMode}
            onSidebarModeChange={setSidebarMode}
            onLogout={logout}
            onFriendAdded={refreshAll}
            onOpenSettings={() => setIsSettingsOpen(!isSettingsOpen)}
          />
        </div>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(!isSettingsOpen)}
          user={user}
        />

        {/* ChatWindow — plein écran sur mobile (cachée par défaut), flex-1 sur md+ */}
        <div className={`
          ${showChatOnMobile ? 'flex' : 'hidden'} md:flex
          flex-1 flex-col h-full
        `}>
          <ChatWindow
            currentUser={user}
            friend={selectedFriend}
            onFriendAdded={refreshAll}
            onBack={handleBackToSidebar}
          />
        </div>

      </div>
    </SocketProvider>
  );
}

export default Chat;
