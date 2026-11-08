import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, description, busy = false, children }) {
  const dialog = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      dialog.current?.close();
      return;
    }
    const previousOverflow = document.body.style.overflow;
    dialog.current?.showModal();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  function close() {
    if (!busy) onClose();
  }

  return (
    <dialog ref={dialog} aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}
      onCancel={event => { event.preventDefault(); close(); }}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
      }}
      className="request-modal m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-0 text-fg shadow-2xl backdrop:bg-ink-950/60 backdrop:backdrop-blur-sm">
      <div className="p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-line pb-5">
          <div>
            <h2 id={titleId} className="text-xl font-bold tracking-tight">{title}</h2>
            {description && <p id={descriptionId} className="mt-2 text-sm leading-6 text-muted">{description}</p>}
          </div>
          <button type="button" onClick={close} disabled={busy} aria-label="Close dialog"
            className="theme-toggle shrink-0 focus-visible:outline-2 focus-visible:outline-brand-500 disabled:opacity-50"><X size={20} /></button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
