import { useEffect, useRef } from "react";
import styles from "./Modal.module.css";

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<Props> = ({ title, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      "button, input, select, textarea"
    );
    focusable?.[0]?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} ref={modalRef}>
        <header className={styles.header}>
          <h3>{title}</h3>
          <button onClick={onClose}>✕</button>
        </header>
        <section className={styles.body}>{children}</section>
      </div>
    </div>
  );
};

export default Modal;
