import { useState, type FormEvent } from 'react';
import { Modal } from '../Modal';
import styles from './TagFormDialog.module.css';

type TagFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (body: { name: string }) => void | Promise<void>;
  busy?: boolean;
  error?: string | null;
};

export function TagFormDialog({
  open,
  onClose,
  onSubmit,
  busy = false,
  error = null,
}: TagFormDialogProps) {
  const [name, setName] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setFieldError('Name is required');
      return;
    }

    void onSubmit({ name: trimmed });
  };

  return (
    <Modal
      open={open}
      title="Add tag"
      onClose={onClose}
      busy={busy}
      footer={
        <>
          <button type="button" className={styles.secondary} onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" form="tag-form" className={styles.primary} disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <form id="tag-form" className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.field} htmlFor="tag-name">
          Name
          <input
            id="tag-name"
            className="control"
            name="name"
            value={name}
            disabled={busy}
            aria-invalid={fieldError !== null || error !== null}
            onChange={(event) => {
              setName(event.currentTarget.value);
              setFieldError(null);
            }}
          />
        </label>
        {fieldError === null ? null : (
          <p className={styles.error} role="alert">
            {fieldError}
          </p>
        )}
        {error === null ? null : (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
