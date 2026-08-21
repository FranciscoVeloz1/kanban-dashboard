import { useState } from 'react';
import { ApiError } from '../../api/types';
import { KanbanBoard } from '../../components/board/KanbanBoard';
import { TagFormDialog } from '../../components/forms/TagFormDialog';
import { TaskFormDialog, type TaskFormValues } from '../../components/forms/TaskFormDialog';
import { useKanbanBoard } from '../../hooks/useKanbanBoard';
import styles from './BoardPage.module.css';

function errorMessage(cause: unknown): string {
  if (cause instanceof ApiError) {
    return cause.message;
  }

  if (cause instanceof Error) {
    return cause.message;
  }

  return 'Could not save.';
}

export function BoardPage() {
  const {
    tasks,
    tags,
    grouped,
    isLoading,
    error,
    retry,
    moveTask,
    createTag,
    createTask,
    saveTask,
    removeTask,
    tagBusy,
    taskBusy,
  } = useKanbanBoard();
  const [tagOpen, setTagOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tagError, setTagError] = useState<string | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);

  const editingTask = tasks.find((item) => item.id === editingId);

  const closeTag = () => {
    setTagOpen(false);
    setTagError(null);
  };

  const closeTask = () => {
    setTaskOpen(false);
    setEditingId(null);
    setTaskError(null);
  };

  const handleTaskSubmit = async (values: TaskFormValues) => {
    try {
      if (editingId === null) {
        await createTask({
          title: values.title,
          description: values.description,
          tagId: values.tagId,
          deadline: values.deadline,
          checklist: values.checklist,
        });
      } else {
        await saveTask(editingId, {
          title: values.title,
          description: values.description,
          tagId: values.tagId,
          deadline: values.deadline,
          checklist: values.checklist,
        });
      }

      closeTask();
    } catch (cause) {
      setTaskError(errorMessage(cause));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            setTagError(null);
            setTagOpen(true);
          }}
        >
          Add tag
        </button>
        <button
          type="button"
          className={styles.actionPrimary}
          onClick={() => {
            setEditingId(null);
            setTaskError(null);
            setTaskOpen(true);
          }}
        >
          Add task
        </button>
      </div>

      <KanbanBoard
        grouped={grouped}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        onMove={(taskId, status) => {
          void moveTask(taskId, status);
        }}
        onOpenTask={(taskId) => {
          setTaskError(null);
          setEditingId(taskId);
          setTaskOpen(true);
        }}
      />

      <TagFormDialog
        key={tagOpen ? 'open' : 'closed'}
        open={tagOpen}
        onClose={closeTag}
        busy={tagBusy}
        error={tagError}
        onSubmit={async ({ name }) => {
          try {
            await createTag(name);
            closeTag();
          } catch (cause) {
            setTagError(errorMessage(cause));
          }
        }}
      />

      <TaskFormDialog
        key={editingId ?? 'create'}
        open={taskOpen}
        mode={editingId === null ? 'create' : 'edit'}
        tags={tags}
        task={editingTask}
        busy={taskBusy}
        error={taskError}
        onClose={closeTask}
        onSubmit={handleTaskSubmit}
        onDelete={
          editingId === null
            ? undefined
            : async () => {
                try {
                  await removeTask(editingId);
                  closeTask();
                } catch (cause) {
                  setTaskError(errorMessage(cause));
                }
              }
        }
      />
    </div>
  );
}
