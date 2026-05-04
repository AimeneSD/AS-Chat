import { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { friendService } from '../../services/api';


/**
 * Sidebar — Phase 3 UX refactor.
 *
 * Mode "conversations" : filtre local des amis/discussions existantes.
 * Mode "friends"       : liste des amis + demandes reçues en attente.
 */
/**
 * Sous-composant pour une demande d'ami en attente
 */
function PendingRequestItem({ req, actionId, onAccept, onDecline }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-orange-500/5 border-b border-white/3">
      <div className="w-9 h-9 rounded-full bg-linear-to-br from-orange-400 to-amber-500 flex items-center justify-center font-bold text-white text-sm shrink-0 shadow">
        {req.username?.[0]?.toUpperCase()}
      </div>
      <p className="flex-1 text-white/90 text-sm font-semibold truncate">{req.username}</p>
      <div className="flex gap-1.5 shrink-0">
        <button
          onClick={() => onAccept(req.id)}
          disabled={actionId === req.id}
          title="Accepter"
          className="w-7 h-7 rounded-lg bg-green-600 hover:bg-green-500 text-white flex items-center justify-center transition-colors disabled:opacity-50"
        >
          {actionId === req.id ? (
            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <button
          onClick={() => onDecline(req.id)}
          disabled={actionId === req.id}
          title="Refuser"
          className="w-7 h-7 rounded-lg bg-white/8 hover:bg-red-500/20 hover:text-red-400 text-white/50 flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Helpers pour SidebarItem
 */
function getContainerClasses(isSelected, unread) {
  const base = "flex items-center gap-3 px-4 py-3 cursor-pointer transition-all";
  if (isSelected) return `${base} bg-green-500/10 border-r-2 border-green-500`;
  if (unread > 0) return `${base} bg-green-500/5 hover:bg-white/4`;
  return `${base} hover:bg-white/4`;
}

function getAvatarIndicatorClasses(isOnline) {
  const color = isOnline ? 'bg-green-400' : 'bg-white/15';
  return `absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#161b22] transition-colors duration-500 ${color}`;
}

function getTextClasses(isSelected, unread) {
  if (isSelected) return "text-sm font-semibold truncate text-green-400";
  if (unread > 0) return "text-sm font-semibold truncate text-white";
  return "text-sm font-semibold truncate text-white/80";
}

function SidebarAvatar({ item }) {
  return (
    <div className="relative shrink-0">
      <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-lg">
        {item.avatar_url ? (
          <img src={item.avatar_url} alt={item.username} className="w-full h-full rounded-full object-cover" />
        ) : (
          item.username?.[0]?.toUpperCase()
        )}
      </div>
      <span className={getAvatarIndicatorClasses(item.status === 'online')} />
    </div>
  );
}

function UnreadBadge({ unread, isSelected }) {
  if (unread <= 0 || isSelected) return null;
  const displayUnread = unread > 99 ? '99+' : unread;
  return (
    <span className="shrink-0 bg-green-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
      {displayUnread}
    </span>
  );
}

/**
 * Sous-composant pour un item de la sidebar (ami ou conversation)
 */
function SidebarItem({ item, isSelected, unread, onSelect }) {
  const containerClasses = getContainerClasses(isSelected, unread);
  const textClasses = getTextClasses(isSelected, unread);
  const statusText = item.status === 'online' ? '● En ligne' : '○ Hors ligne';

  return (
    <div onClick={() => onSelect(item)} className={containerClasses}>
      <SidebarAvatar item={item} />
      
      <div className="flex-1 min-w-0">
        <p className={textClasses}>{item.username}</p>
        <p className="text-xs text-white/30 truncate">{statusText}</p>
      </div>

      <UnreadBadge unread={unread} isSelected={isSelected} />
    </div>
  );
}

/**
 * Sous-composant pour l'en-tête de la Sidebar
 */
function SidebarHeader({ totalUnread, onLogout }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h1 className="text-white font-bold text-lg tracking-tight gugi-font">AS-Chat</h1>
        {totalUnread > 0 && (
          <span className="bg-green-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </div>
      <button onClick={onLogout} title="Se déconnecter" className="text-white/40 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Sous-composant pour les onglets
 */
function SidebarTabs({ sidebarMode, onSidebarModeChange, onSearchChange, pendingRequestsCount }) {
  return (
    <div className="flex bg-white/5 rounded-xl p-1 gap-1">
      {['conversations', 'friends'].map((mode) => (
        <button
          key={mode}
          onClick={() => { onSidebarModeChange(mode); onSearchChange(''); }}
          className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all relative ${sidebarMode === mode ? 'bg-green-600 text-white shadow' : 'text-white/40 hover:text-white/70'}`}
        >
          {mode === 'conversations' ? 'Discussions' : 'Amis'}
          {mode === 'friends' && pendingRequestsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {pendingRequestsCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * Sous-composant pour la barre de recherche
 */
function SidebarSearch({ sidebarMode, searchQuery, onSearchChange }) {
  return (
    <div className="px-4 py-3 border-b border-white/5">
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder={sidebarMode === 'conversations' ? 'Filtrer les discussions...' : 'Filtrer les amis...'}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-green-500/40 transition-all"
        />
      </div>
    </div>
  );
}

/**
 * Composant pour ajouter un ami via son pseudo exact
 */
function SidebarAddFriend({ onFriendAdded }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      await friendService.sendRequestByUsername(username.trim());
      setMessage({ type: 'success', text: 'Demande envoyée !' });
      setUsername('');
      onFriendAdded?.();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Une erreur est survenue.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-4 border-b border-white/5 bg-white/2">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-3">Ajouter un ami</h3>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          placeholder="Pseudo exact..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none focus:border-green-500/30 transition-all"
        />
        <button
          disabled={loading || !username.trim()}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-30 text-white text-xs font-bold px-3 rounded-lg transition-all"
        >
          {loading ? '...' : 'Ajouter'}
        </button>
      </form>
      {message && (
        <p className={`text-[10px] mt-2 font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}

/**
 * Sous-composant pour les listes
 */
function SidebarLists({ 
  sidebarMode, 
  pendingRequests, 
  friends, 
  actionId, 
  handleAccept, 
  handleDecline, 
  selectedFriend, 
  unreadCounts, 
  onSelectFriend 
}) {
  return (
    <div className="flex-1 overflow-y-auto py-1">
      {sidebarMode === 'friends' && pendingRequests.length > 0 && (
        <div className="mb-1">
          <p className="px-4 py-2 text-[10px] font-semibold text-orange-400/80 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse inline-block" />
            {pendingRequests.length} demande{pendingRequests.length > 1 ? 's' : ''} en attente
          </p>
          {pendingRequests.map((req) => (
            <PendingRequestItem key={req.id} req={req} actionId={actionId} onAccept={handleAccept} onDecline={handleDecline} />
          ))}
        </div>
      )}

      <p className="px-4 py-2 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
        {sidebarMode === 'conversations' ? 'Récentes' : `${friends.length} ami${friends.length !== 1 ? 's' : ''}`}
      </p>

      {friends.length === 0 && (
        <div className="px-4 py-10 text-center">
          <p className="text-white/20 text-sm leading-relaxed whitespace-pre-line">
            {sidebarMode === 'conversations' ? "Aucune discussion.\nUtilisez la zone de droite pour\ncontacter quelqu'un !" : "Aucun ami pour l'instant."}
          </p>
        </div>
      )}

      {friends.map((item) => (
        <SidebarItem
          key={item.id}
          item={item}
          isSelected={selectedFriend?.id === item.id}
          unread={unreadCounts[item.id] || 0}
          onSelect={onSelectFriend}
        />
      ))}
    </div>
  );
}

function SidebarFooter({ user, onOpenSettings }) {
  return (
    <div className="p-4 border-t border-white/5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-white text-sm font-semibold truncate">{user?.username}</p>
          <p className="text-green-400 text-xs">● En ligne</p>
        </div>
      </div>
      <div className='flex flex-col'>
        <button className='cursor-pointer hover:bg-[#0d1117]/70 p-2 rounded-lg transition-colors' onClick={onOpenSettings}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-gear-wide-connected" viewBox="0 0 16 16">
            <path d="M7.068.727c.243-.97 1.62-.97 1.864 0l.071.286a.96.96 0 0 0 1.622.434l.205-.211c.695-.719 1.888-.03 1.613.931l-.08.284a.96.96 0 0 0 1.187 1.187l.283-.081c.96-.275 1.65.918.931 1.613l-.211.205a.96.96 0 0 0 .434 1.622l.286.071c.97.243.97 1.62 0 1.864l-.286.071a.96.96 0 0 0-.434 1.622l.211.205c.719.695.03 1.888-.931 1.613l-.284-.08a.96.96 0 0 0-1.187 1.187l.081.283c.275.96-.918 1.65-1.613.931l-.205-.211a.96.96 0 0 0-1.622.434l-.071.286c-.243.97-1.62.97-1.864 0l-.071-.286a.96.96 0 0 0-1.622-.434l-.205.211c-.695.719-1.888.03-1.613-.931l.08-.284a.96.96 0 0 0-1.186-1.187l-.284.081c-.96.275-1.65-.918-.931-1.613l.211-.205a.96.96 0 0 0-.434-1.622l-.286-.071c-.97-.243-.97-1.62 0-1.864l.286-.071a.96.96 0 0 0 .434-1.622l-.211-.205c-.719-.695-.03-1.888.931-1.613l.284.08a.96.96 0 0 0 1.187-1.186l-.081-.284c-.275-.96.918-1.65 1.613-.931l.205.211a.96.96 0 0 0 1.622-.434zM12.973 8.5H8.25l-2.834 3.779A4.998 4.998 0 0 0 12.973 8.5m0-1a4.998 4.998 0 0 0-7.557-3.779l2.834 3.78zM5.048 3.967l-.087.065zm-.431.355A4.98 4.98 0 0 0 3.002 8c0 1.455.622 2.765 1.615 3.678L7.375 8zm.344 7.646.087.065z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Composant Principal Sidebar
 */
function Sidebar({
  user,
  friends,
  pendingRequests = [],
  selectedFriend,
  onSelectFriend,
  searchQuery,
  onSearchChange,
  sidebarMode,
  onSidebarModeChange,
  onLogout,
  onFriendAdded,
  onOpenSettings
}) {
  const { unreadCounts } = useSocket();
  const [actionId, setActionId] = useState(null);

  const totalUnread = Object.values(unreadCounts).reduce((sum, n) => sum + n, 0);

  useEffect(() => {
    document.title = totalUnread > 0 ? `(${totalUnread}) AS-Chat` : 'AS-Chat';
  }, [totalUnread]);

  const handleAccept = async (id) => {
    setActionId(id);
    try {
      await friendService.acceptRequest(id);
      onFriendAdded?.();
    } finally {
      setActionId(null);
    }
  };

  const handleDecline = async (id) => {
    setActionId(id);
    try {
      await friendService.declineOrRemove(id);
      onFriendAdded?.();
    } finally {
      setActionId(null);
    }
  };

  return (
    <aside className="w-80 shrink-0 h-full bg-[#162516] border-r border-white/5 flex flex-col">
      <div className="p-4 border-b border-white/5">
        <SidebarHeader totalUnread={totalUnread} onLogout={onLogout} />
        <SidebarTabs 
          sidebarMode={sidebarMode} 
          onSidebarModeChange={onSidebarModeChange} 
          onSearchChange={onSearchChange} 
          pendingRequestsCount={pendingRequests.length} 
        />
      </div>

      <SidebarSearch 
        sidebarMode={sidebarMode} 
        searchQuery={searchQuery} 
        onSearchChange={onSearchChange} 
      />

      {sidebarMode === 'friends' && (
        <SidebarAddFriend onFriendAdded={onFriendAdded} />
      )}

      <SidebarLists 
        sidebarMode={sidebarMode}
        pendingRequests={pendingRequests}
        friends={friends}
        actionId={actionId}
        handleAccept={handleAccept}
        handleDecline={handleDecline}
        selectedFriend={selectedFriend}
        unreadCounts={unreadCounts}
        onSelectFriend={onSelectFriend}
      />

      <SidebarFooter user={user} onOpenSettings={onOpenSettings} />

      
    </aside>
  );
}

export default Sidebar;
