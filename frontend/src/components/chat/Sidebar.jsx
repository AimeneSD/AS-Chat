import { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { friendService } from '../../services/api';

/**
 * Sidebar — Phase 3 UX refactor.
 *
 * Mode "conversations" : filtre local des amis/discussions existantes.
 * Mode "friends"       : liste des amis + demandes reçues en attente.
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
}) {
  const { unreadCounts } = useSocket();
  const [actionId, setActionId] = useState(null);

  const totalUnread = Object.values(unreadCounts).reduce((sum, n) => sum + n, 0);

  useEffect(() => {
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) AS-Chat`;
    } else {
      document.title = 'AS-Chat';
    }
  }, [totalUnread]);

  const handleAccept = async (requesterId) => {
    setActionId(requesterId);
    try {
      await friendService.acceptRequest(requesterId);
      onFriendAdded?.();
    } catch (err) {
      console.error('Erreur acceptation :', err);
    } finally {
      setActionId(null);
    }
  };

  const handleDecline = async (requesterId) => {
    setActionId(requesterId);
    try {
      await friendService.declineOrRemove(requesterId);
      onFriendAdded?.();
    } catch (err) {
      console.error('Erreur refus :', err);
    } finally {
      setActionId(null);
    }
  };

  return (
    <aside className="w-80 flex-shrink-0 h-full bg-[#161b22] border-r border-white/5 flex flex-col">

      {/* ── En-tête ─────────────────────────────────────────────────── */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-white font-bold text-lg tracking-tight gugi-font">AS-Chat</h1>
            {totalUnread > 0 && (
              <span className="bg-green-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </div>
          <button
            onClick={onLogout}
            title="Se déconnecter"
            className="text-white/40 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
          </button>
        </div>

        {/* Onglets Discussions / Amis */}
        <div className="flex bg-white/5 rounded-xl p-1 gap-1">
          {['conversations', 'friends'].map((mode) => (
            <button
              key={mode}
              onClick={() => { onSidebarModeChange(mode); onSearchChange(''); }}
              className={`
                flex-1 text-xs font-semibold py-2 rounded-lg transition-all relative
                ${sidebarMode === mode
                  ? 'bg-green-600 text-white shadow'
                  : 'text-white/40 hover:text-white/70'}
              `}
            >
              {mode === 'conversations' ? '💬 Discussions' : '👥 Amis'}
              {/* Badge rouge sur l'onglet Amis si demandes en attente */}
              {mode === 'friends' && pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Barre de recherche locale */}
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

      {/* ── Liste ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-1">

        {/* ── Demandes reçues (onglet Amis uniquement) ────────────── */}
        {sidebarMode === 'friends' && pendingRequests.length > 0 && (
          <div className="mb-1">
            <p className="px-4 py-2 text-[10px] font-semibold text-orange-400/80 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse inline-block" />
              {pendingRequests.length} demande{pendingRequests.length > 1 ? 's' : ''} en attente
            </p>

            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 px-4 py-2.5 bg-orange-500/5 border-b border-white/3"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow">
                  {req.username?.[0]?.toUpperCase()}
                </div>

                {/* Nom */}
                <p className="flex-1 text-white/90 text-sm font-semibold truncate">{req.username}</p>

                {/* Boutons Accepter / Refuser */}
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleAccept(req.id)}
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
                    onClick={() => handleDecline(req.id)}
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
            ))}
          </div>
        )}

        {/* ── Amis / Conversations ─────────────────────────────────── */}
        <p className="px-4 py-2 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
          {sidebarMode === 'conversations' ? 'Récentes' : `${friends.length} ami${friends.length !== 1 ? 's' : ''}`}
        </p>

        {friends.length === 0 && (
          <div className="px-4 py-10 text-center">
            <p className="text-white/20 text-sm leading-relaxed">
              {sidebarMode === 'conversations'
                ? "Aucune discussion.\nUtilisez la zone de droite pour\ncontacter quelqu'un !"
                : "Aucun ami pour l'instant."}
            </p>
          </div>
        )}

        {friends.map((item) => {
          const isSelected = selectedFriend?.id === item.id;
          const unread     = unreadCounts[item.id] || 0;

          return (
            <div
              key={item.id}
              onClick={() => onSelectFriend(item)}
              className={`
                flex items-center gap-3 px-4 py-3 cursor-pointer transition-all
                ${isSelected
                  ? 'bg-green-500/10 border-r-2 border-green-500'
                  : 'hover:bg-white/4'}
                ${unread > 0 && !isSelected ? 'bg-green-500/5' : ''}
              `}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-lg">
                  {item.avatar_url
                    ? <img src={item.avatar_url} alt={item.username} className="w-full h-full rounded-full object-cover" />
                    : item.username?.[0]?.toUpperCase()
                  }
                </div>
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#161b22] transition-colors duration-500 ${item.status === 'online' ? 'bg-green-400' : 'bg-white/15'}`} />
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isSelected ? 'text-green-400' : unread > 0 ? 'text-white' : 'text-white/80'}`}>
                  {item.username}
                </p>
                <p className="text-xs text-white/30 truncate">
                  {item.status === 'online' ? '● En ligne' : '○ Hors ligne'}
                </p>
              </div>

              {/* Badge non-lus */}
              {unread > 0 && !isSelected && (
                <span className="flex-shrink-0 bg-green-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Profil bas ─────────────────────────────────────────────── */}
      <div className="p-4 border-t border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{user?.username}</p>
          <p className="text-green-400 text-xs">● En ligne</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
