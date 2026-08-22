import { useEffect, useId, useRef, type ReactNode } from 'react';
import styles from './Modal.module.css';

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  busy?: boolean;
  children: ReactNode;
  footer?: ReactNode;
};

let openDialogCount = 0;

export function Modal({ open, title, onClose, busy = false, children, footer }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const element = dialogRef.current;
    if (element === null) {
      return;
    }

    let frameOuter = 0;
    let frameInner = 0;

    if (open) {
      if (!element.open) {
        element.showModal();
      }

      element.classList.remove(styles.entered);
      frameOuter = requestAnimationFrame(() => {
        frameInner = requestAnimationFrame(() => {
          element.classList.add(styles.entered);
        });
      });
    } else if (element.open) {
      element.classList.remove(styles.entered);
      element.close();
    }

    return () => {
      cancelAnimationFrame(frameOuter);
      cancelAnimationFrame(frameInner);
      element.classList.remove(styles.entered);
      if (element.open) {
        element.close();
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    openDialogCount += 1;
    document.body.style.overflow = 'hidden';

    return () => {
      openDialogCount -= 1;
      if (openDialogCount === 0) {
        document.body.style.overflow = '';
      }
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-busy={busy || undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (busy) {
          return;
        }

        onClose();
      }}
      onClick={(event) => {
        if (busy) {
          return;
        }

        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className={styles.panel}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <div className={styles.body}>{children}</div>
        {footer === undefined ? null : <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}
