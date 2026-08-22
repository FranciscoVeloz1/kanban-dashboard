import { useState, type FormEvent } from 'react';
import type { KanbanTag, KanbanTask } from '../../../types/kanban';
import { ConfirmDialog } from '../ConfirmDialog';
import styles from './TaskFormDialog.module.css';

export type TaskFormValues = {
  title: string;
  description: string;
  tagId: string | null;
  deadline: string | null;
  checklist: { id: string; text: string; done: boolean }[];
};

type TaskFormDialogProps = {
  mode: 'create' | 'edit';
  tags: KanbanTag[];
  task?: KanbanTask;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  busy?: boolean;
  error?: string | null;
};

type ChecklistDraft = {
  id: string;
  text: string;
  done: boolean;
};

function draftsFromTask(task: KanbanTask | undefined): ChecklistDraft[] {
  if (task === undefined) {
    return [];
  }

  return task.checklist.map((item) => {
    return { id: item.id, text: item.text, done: item.done };
  });
}

export function TaskFormDialog({
  mode,
  tags,
  task,
  onClose,
  onSubmit,
  onDelete,
  busy = false,
  error = null,
}: TaskFormDialogProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [tagId, setTagId] = useState(task?.tag?.id ?? '');
  const [deadline, setDeadline] = useState(task?.deadline ?? '');
  const [checklist, setChecklist] = useState<ChecklistDraft[]>(() => draftsFromTask(task));
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [checklistError, setChecklistError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTitle = title.trim();
    const nextDescription = description.trim();
    let valid = true;

    if (nextTitle.length === 0) {
      setTitleError('Title is required');
      valid = false;
    } else {
      setTitleError(null);
    }

    if (nextDescription.length === 0) {
      setDescriptionError('Description is required');
      valid = false;
    } else {
      setDescriptionError(null);
    }

    const emptyItem = checklist.some((item) => item.text.trim().length === 0);
    if (emptyItem) {
      setChecklistError('Checklist item text is required');
      valid = false;
    } else {
      setChecklistError(null);
    }

    if (!valid) {
      return;
    }

    void onSubmit({
      title: nextTitle,
      description: nextDescription,
      tagId: tagId.length === 0 ? null : tagId,
      deadline: deadline.length === 0 ? null : deadline,
      checklist: checklist.map((item) => {
        return { id: item.id, text: item.text.trim(), done: item.done };
      }),
    });
  };

  if (confirmOpen) {
    return (
      <ConfirmDialog
        open
        title="Confirm delete"
        message="Delete this task? This cannot be undone."
        confirmLabel="Delete"
        busy={busy}
        onCancel={() => {
          setConfirmOpen(false);
        }}
        onConfirm={() => {
          setConfirmOpen(false);
          void onDelete?.();
        }}
      />
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label className={styles.field} htmlFor="task-title">
        Title
        <input
          id="task-title"
          className="control"
          name="title"
          value={title}
          disabled={busy}
          aria-invalid={titleError !== null}
          onChange={(event) => {
            setTitle(event.currentTarget.value);
            setTitleError(null);
          }}
        />
      </label>
      {titleError === null ? null : (
        <p className={styles.error} role="alert">
          {titleError}
        </p>
      )}

      <label className={styles.field} htmlFor="task-description">
        Description
        <textarea
          id="task-description"
          className="control"
          name="description"
          value={description}
          disabled={busy}
          rows={4}
          aria-invalid={descriptionError !== null}
          onChange={(event) => {
            setDescription(event.currentTarget.value);
            setDescriptionError(null);
          }}
        />
      </label>
      {descriptionError === null ? null : (
        <p className={styles.error} role="alert">
          {descriptionError}
        </p>
      )}

      <label className={styles.field} htmlFor="task-tag">
        Tag
        <select
          id="task-tag"
          className="control"
          name="tag"
          value={tagId}
          disabled={busy}
          onChange={(event) => {
            setTagId(event.currentTarget.value);
          }}
        >
          <option value="">None</option>
          {tags.map((tag) => {
            return (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            );
          })}
        </select>
      </label>

      <label className={styles.field} htmlFor="task-deadline">
        Deadline
        <input
          id="task-deadline"
          className="control"
          type="date"
          name="deadline"
          value={deadline}
          disabled={busy}
          onChange={(event) => {
            setDeadline(event.currentTarget.value);
          }}
        />
      </label>

      <fieldset className={styles.checklist}>
        <legend>Checklist</legend>
        {checklist.length === 0 ? (
          <p className={styles.hint}>No checklist items yet.</p>
        ) : (
          checklist.map((item, index) => {
            return (
              <div key={item.id} className={styles.item}>
                <input
                  type="checkbox"
                  checked={item.done}
                  disabled={busy}
                  aria-label={`Done ${index + 1}`}
                  onChange={(event) => {
                    const done = event.currentTarget.checked;
                    setChecklist((current) => {
                      return current.map((entry) => {
                        if (entry.id !== item.id) {
                          return entry;
                        }

                        return { ...entry, done };
                      });
                    });
                  }}
                />
                <label className={styles.itemLabel} htmlFor={`checklist-item-${item.id}`}>
                  Item {index + 1}
                  <input
                    id={`checklist-item-${item.id}`}
                    className="control"
                    value={item.text}
                    disabled={busy}
                    onChange={(event) => {
                      const text = event.currentTarget.value;
                      setChecklistError(null);
                      setChecklist((current) => {
                        return current.map((entry) => {
                          if (entry.id !== item.id) {
                            return entry;
                          }

                          return { ...entry, text };
                        });
                      });
                    }}
                  />
                </label>
                <button
                  type="button"
                  className={styles.secondary}
                  disabled={busy}
                  aria-label={`Remove item ${index + 1}`}
                  onClick={() => {
                    setChecklist((current) => current.filter((entry) => entry.id !== item.id));
                  }}
                >
                  Remove
                </button>
              </div>
            );
          })
        )}
        {checklistError === null ? null : (
          <p className={styles.error} role="alert">
            {checklistError}
          </p>
        )}
        <button
          type="button"
          className={styles.secondary}
          disabled={busy}
          onClick={() => {
            setChecklist((current) => {
              return [...current, { id: crypto.randomUUID(), text: '', done: false }];
            });
          }}
        >
          Add item
        </button>
      </fieldset>

      {error === null ? null : (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        {mode === 'edit' && onDelete !== undefined ? (
          <button
            type="button"
            className={styles.danger}
            disabled={busy}
            onClick={() => {
              setConfirmOpen(true);
            }}
          >
            Delete
          </button>
        ) : null}
        <button type="button" className={styles.secondary} onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className={styles.primary} disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
