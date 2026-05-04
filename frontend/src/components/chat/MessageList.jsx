import { useEffect, useRef } from 'react';

/**
 * MessageList — Phase 3.
 * Ajout : coches bleues "Lu" sur le dernier message envoyé quand allRead = true.
 */
/**
 * Sous-composant pour un message individuel
 * Réduit la complexité de MessageList
 */
function MessageItem({ 
  msg, 
  isMine, 
  isFirstOfGroup, 
  isLastOfGroup, 
  showDate, 
  showReadReceipt, 
  isLastSent,
  allRead,
  formatDateLabel,
  formatTime 
}) {
  const isDeleted = msg.type === 'deleted';

  return (
    <div>
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
        {!isMine && <div className="w-7 shrink-0" />}

        <div className={`
          max-w-[65%] px-4 py-2.5 text-sm leading-relaxed wrap-break-word
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

          {showReadReceipt && (
            <span className="text-[10px] text-green-400 font-medium animate-fade-in">
              ✓✓ Lu
            </span>
          )}
          
          {isMine && isLastSent && !allRead && (
            <span className="text-[10px] text-white/30">✓</span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Prépare les métadonnées de chaque message pour le rendu
 */
function useMessageMetadata(messages, currentUserId, allRead, formatDateLabel) {
  let lastSentIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].sender_id === currentUserId) {
      lastSentIndex = i;
      break;
    }
  }

  return messages.map((msg, index) => {
    const prevMsg = messages[index - 1];
    const nextMsg = messages[index + 1];
    
    const isMine = msg.sender_id === currentUserId;
    const msgDateLabel = formatDateLabel(msg.created_at);
    const prevMsgDateLabel = prevMsg ? formatDateLabel(prevMsg.created_at) : null;
    
    const showDate = !prevMsg || msgDateLabel !== prevMsgDateLabel;
    const isFirstOfGroup = !prevMsg || prevMsg.sender_id !== msg.sender_id || showDate;
    const isLastOfGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id;
    const isLastSent = index === lastSentIndex;
    const showReadReceipt = isMine && isLastSent && allRead;

    return {
      msg,
      isMine,
      isFirstOfGroup,
      isLastOfGroup,
      showDate,
      showReadReceipt,
      isLastSent
    };
  });
}

function MessageList({ messages, currentUserId, loading, allRead }) {
  const bottomRef = useRef(null);

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

  const processedMessages = useMessageMetadata(messages, currentUserId, allRead, formatDateLabel);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-0.5 flex flex-col">
      {processedMessages.map(({ msg, ...meta }) => (
        <MessageItem
          key={msg.id}
          msg={msg}
          allRead={allRead}
          formatDateLabel={formatDateLabel}
          formatTime={formatTime}
          {...meta}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;
