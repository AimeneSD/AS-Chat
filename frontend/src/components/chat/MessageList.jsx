import { useEffect, useRef } from 'react';

/**
 * MessageList — Phase 3.
 * Ajout : coches bleues "Lu" sur le dernier message envoyé quand allRead = true.
 */
function MessageList({ messages, currentUserId, loading, allRead }) {
  const bottomRef = useRef(null);

  // Scroll automatique vers le bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-white/20 text-sm">Commencez la conversation !</p>
      </div>
    );
  }

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const formatDateLabel = (dateStr) => {
    const date      = new Date(dateStr);
    const today     = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString())     return "Aujourd'hui";
    if (date.toDateString() === yesterday.toDateString()) return "Hier";
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  // Index du dernier message envoyé par moi (pour y afficher la coche)
  let lastSentIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].sender_id === currentUserId) {
      lastSentIndex = i;
      break;
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-0.5 flex flex-col">
      {messages.map((msg, index) => {
        const isMine    = msg.sender_id === currentUserId;
        const isDeleted = msg.type === 'deleted';
        const prevMsg   = messages[index - 1];
        const nextMsg   = messages[index + 1];

        // Séparateur de date
        const showDate   = !prevMsg || formatDateLabel(msg.created_at) !== formatDateLabel(prevMsg.created_at);
        // Début d'un nouveau groupe (auteur différent du message précédent)
        const isFirstOfGroup = !prevMsg || prevMsg.sender_id !== msg.sender_id || showDate;
        // Fin d'un groupe (auteur différent du message suivant)
        const isLastOfGroup  = !nextMsg || nextMsg.sender_id !== msg.sender_id;
        // Coche "Lu" : uniquement sur mon dernier message envoyé, si allRead = true
        const showReadReceipt = isMine && index === lastSentIndex && allRead;

        return (
          <div key={msg.id}>
            {/* ── Séparateur de date ─── */}
            {showDate && (
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-white/25 text-xs">{formatDateLabel(msg.created_at)}</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
            )}

            {/* ── Espacement entre groupes ─── */}
            {isFirstOfGroup && !showDate && <div className="h-3" />}

            {/* ── Bulle de message ─── */}
            <div className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Placeholder avatar (gauche uniquement) pour aligner les bulles */}
              {!isMine && <div className="w-7 flex-shrink-0" />}

              <div className={`
                max-w-[65%] px-4 py-2.5 text-sm leading-relaxed break-words
                transition-all duration-200
                ${isMine
                  ? `bg-green-600 text-white
                     ${isFirstOfGroup ? 'rounded-t-2xl' : 'rounded-t-lg'}
                     ${isLastOfGroup  ? 'rounded-bl-2xl rounded-br-sm' : 'rounded-bl-2xl rounded-br-lg'}`
                  : `bg-[#21262d] text-white/90 border border-white/5
                     ${isFirstOfGroup ? 'rounded-t-2xl' : 'rounded-t-lg'}
                     ${isLastOfGroup  ? 'rounded-br-2xl rounded-bl-sm' : 'rounded-br-2xl rounded-bl-lg'}`
                }
                ${isDeleted ? 'italic opacity-40' : ''}
              `}>
                {isDeleted ? '🗑 Message supprimé' : msg.content}
              </div>
            </div>

            {/* ── Horodatage + coche "Lu" (dernier message du groupe) ─── */}
            {isLastOfGroup && (
              <div className={`flex items-center gap-1 mt-1 mb-0.5 ${isMine ? 'flex-row-reverse' : 'flex-row'} ${isMine ? 'pr-1' : 'pl-9'}`}>
                <span className="text-[10px] text-white/20">
                  {formatTime(msg.created_at)}
                </span>

                {/* Coches bleues — "Lu" */}
                {showReadReceipt && (
                  <span className="text-[10px] text-green-400 font-medium animate-fade-in">
                    ✓✓ Lu
                  </span>
                )}
                {/* Coche simple — "Envoyé" (dernier message envoyé, pas encore lu) */}
                {isMine && index === lastSentIndex && !allRead && (
                  <span className="text-[10px] text-white/30">✓</span>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Ancre de scroll */}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;
