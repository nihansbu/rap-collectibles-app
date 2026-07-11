import { createContext, useContext, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { X } from "lucide-react";

export type IconInspectDetails = {
  src: string;
  title: string;
  subtitle?: string;
};

const IconInspectContext = createContext<((details: IconInspectDetails) => void) | null>(null);

export function IconInspectProvider({ children }: { children: ReactNode }) {
  const [details, setDetails] = useState<IconInspectDetails | null>(null);

  useEffect(() => {
    if (!details) return;

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setDetails(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [details]);

  return (
    <IconInspectContext.Provider value={setDetails}>
      {children}
      {details && <IconInspectDialog details={details} onClose={() => setDetails(null)} />}
    </IconInspectContext.Provider>
  );
}

export function InspectableImage({
  src,
  title,
  subtitle,
  alt = "",
  className,
  draggable = false,
}: {
  src: string;
  title: string;
  subtitle?: string;
  alt?: string;
  className?: string;
  draggable?: boolean;
}) {
  const inspect = useContext(IconInspectContext);

  function openInspect() {
    inspect?.({ src, title, subtitle });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLImageElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.stopPropagation();
    openInspect();
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      draggable={draggable}
      tabIndex={0}
      aria-label={`Inspect ${title}`}
      title={`Inspect ${title}`}
      onClick={(event) => {
        event.stopPropagation();
        openInspect();
      }}
      onKeyDown={handleKeyDown}
    />
  );
}

function IconInspectDialog({ details, onClose }: { details: IconInspectDetails; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    return () => previousFocus?.focus();
  }, []);

  return (
    <div className="icon-inspect-backdrop" role="presentation" onClick={onClose}>
      <section
        className="icon-inspect-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Inspect ${details.title}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button ref={closeRef} className="icon-inspect-close" onClick={onClose} aria-label="Close image preview">
          <X size={20} />
        </button>
        <div className="icon-inspect-stage">
          <img src={details.src} alt={details.title} draggable="false" />
        </div>
        <strong>{details.title}</strong>
        {details.subtitle && <small>{details.subtitle}</small>}
        <span className="icon-inspect-hint">Tap outside to close</span>
      </section>
    </div>
  );
}
