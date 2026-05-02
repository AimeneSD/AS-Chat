import { useState } from 'react';
import { friendService } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';

/**
 * Sidebar — Phase 3.
 * Lit les badges de messages non lus depuis le SocketContext.
 */
function Sidebar({
  user,
  friends,
  selectedFriend,
  onSelectFriend,
  searchQuery,
  onSearchChange,
  searchResults,
  isSearching,
  onLogout,
}) {
  const { unreadCounts } = useSocket();
  const [addingFriend, setAddingFriend] = useState(null);

  const handleAddFriend = async (targetUser) => {
    setAddingFriend(targetUser.id);
    try {
      await friendService.sendRequest(targetUser.id);
      onSelectFriend(targetUser);
    } catch (err) {
      console.error('Erreur envoi demande :', err.response?.data?.error);
    } finally {
      setAddingFriend(null);
    }
  };

  const isAlreadyFriend = (userId) => friends.some((f) => f.id === userId);

  // Calcul du total des non-lus pour le titre de l'onglet du navigateur
  const totalUnread = Object.values(unreadCounts).reduce((sum, n) => sum + n, 0);

  const displayList    = searchQuery.trim().length >= 2 ? searchResults : friends;
  const isInSearchMode = searchQuery.trim().length >= 2;

  // Mise à jour du titre de l'onglet
  if (totalUnread > 0) {
    document.title = `(${totalUnread}) AS-Chat`;
  } else {
    document.title = 'AS-Chat';
  }

  return (
    <aside className="w-80 flex-shrink-0 h-full bg-[#161b22] border-r border-white/5 flex flex-col">

      {/* ── En-tête Sidebar ────────────────────────────────────────── */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-white font-bold text-lg tracking-tight gugi-font">AS-Chat</h1>
            {/* Badge total non-lus dans le titre */}
            {totalUnread > 0 && (
              <span className="bg-green-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </div>
          <button
            onClick={onLogout}
            title="Se déconnecter"
            className="text-white/40 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-green-500/50 transition-all"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* ── Liste de conversations / Résultats ─────────────────────── */}
      <div className="flex-1 overflow-y-auto py-2">
        <p className="px-4 py-2 text-xs font-semibold text-white/30 uppercase tracking-widest">
          {isInSearchMode ? 'Résultats' : 'Conversations'}
        </p>

        {displayList.length === 0 && !isSearching && (
          <div className="px-4 py-8 text-center">
            <p className="text-white/25 text-sm">
              {isInSearchMode ? 'Aucun utilisateur trouvé.' : 'Aucune conversation.\nRecherchez quelqu\'un pour commencer !'}
            </p>
          </div>
        )}

        {displayList.map((item) => {
          const isSelected = selectedFriend?.id === item.id;
          const isFriend   = isAlreadyFriend(item.id);
          const unread     = unreadCounts[item.id] || 0;

          return (
            <div
              key={item.id}
              onClick={() => !isInSearchMode || isFriend ? onSelectFriend(item) : null}
              className={`
                flex items-center gap-3 px-4 py-3 cursor-pointer transition-all
                ${isSelected ? 'bg-green-500/10 border-r-2 border-green-500' : 'hover:bg-white/4'}
                ${unread > 0 && !isSelected ? 'bg-green-500/5' : ''}
              `}
            >
              {/* Avatar + indicateur online */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-lg">
                  {item.avatar_url
                    ? <img src={item.avatar_url} alt={item.username} className="w-full h-full rounded-full object-cover" />
                    : item.username?.[0]?.toUpperCase()
                  }
                </div>
                {item.status === 'online' && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#161b22]" />
                )}
              </div>

              {/* Infos utilisateur */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isSelected ? 'text-green-400' : unread > 0 ? 'text-white' : 'text-white/80'}`}>
                  {item.username}
                </p>
                <p className="text-xs text-white/35 truncate">
                  {item.status === 'online' ? '🟢 En ligne' : '⚫ Hors ligne'}
                </p>
              </div>

              {/* Badge non-lus OU bouton Ajouter */}
              {isInSearchMode && !isFriend ? (
                <button
                  onClick={(e) => { e.stopPropagation(); handleAddFriend(item); }}
                  disabled={addingFriend === item.id}
                  className="flex-shrink-0 text-xs px-2.5 py-1 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all disabled:opacity-50"
                >
                  {addingFriend === item.id ? '...' : '+ Ajouter'}
                </button>
              ) : (
                unread > 0 && !isSelected && (
                  <span className="flex-shrink-0 bg-green-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* ── Profil utilisateur (en bas) ────────────────────────────── */}
      <div className="p-4 border-t border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
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
