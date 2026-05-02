import { useState, useRef } from 'react';

/**
 * MessageInput — Le champ de saisie en bas du chat.
 * Gère : envoi par Enter, retour à la ligne par Shift+Enter, limite de caractères.
 */
function MessageInput({ onSend, onTyping, disabled }) {
  const [content, setContent] = useState('');
  const textareaRef           = useRef(null);
  const MAX_LENGTH             = 2000;

  const handleKeyDown = (e) => {
    // Enter seul = envoyer, Shift+Enter = saut de ligne
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length > MAX_LENGTH) return; // Blocage au-delà de la limite

    setContent(val);
    onTyping?.();

    // Auto-resize du textarea selon le contenu
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 150)}px`;
    }
  };

  const handleSend = () => {
    if (!content.trim() || disabled) return;
    onSend(content);
    setContent('');
    // Reset la hauteur du textarea
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const remaining = MAX_LENGTH - content.length;
  const isNearLimit = remaining < 200;

  return (
    <div className="shrink-0 bg-[#161b22] border-t border-white/5 px-4 py-3">
      <div className="flex items-end gap-3 bg-[#21262d] rounded-2xl border border-white/8 px-4 py-3 focus-within:border-green-500/40 transition-colors">
        {/* Textarea auto-resize */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Écrivez un message... (Entrée pour envoyer)"
          rows={1}
          className="flex-1 bg-transparent text-white/90 placeholder:text-white/25 text-sm outline-none resize-none leading-relaxed max-h-36 disabled:opacity-40"
        />

        {/* Compteur de caractères (visible seulement proche de la limite) */}
        {isNearLimit && (
          <span className={`text-xs shrink-0 mb-0.5 ${remaining < 50 ? 'text-red-400' : 'text-white/30'}`}>
            {remaining}
          </span>
        )}

        {/* Bouton Envoyer */}
        <button
          onClick={handleSend}
          disabled={!content.trim() || disabled}
          className="shrink-0 w-9 h-9 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      {/* Indications */}
      <p className="text-white/15 text-[10px] mt-1.5 ml-1">
        Entrée pour envoyer · Shift+Entrée pour un saut de ligne
      </p>
    </div>
  );
}

export default MessageInput;
