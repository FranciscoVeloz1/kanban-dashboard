import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTag,
  createTask,
  deleteTask,
  listTags,
  listTasks,
  patchTask,
  type CreateTaskBody,
  type PatchTaskBody,
} from '../api/kanban';
import type { KanbanTask, KanbanTaskStatus } from '../types/kanban';
import { groupTasks } from '../utils/group-tasks';

export const KANBAN_TASKS_KEY = ['kanban', 'tasks'] as const;
export const KANBAN_TAGS_KEY = ['kanban', 'tags'] as const;

type TasksCache = {
  tasks: KanbanTask[];
};

export function useKanbanBoard() {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: KANBAN_TASKS_KEY,
    queryFn: listTasks,
  });

  const tagsQuery = useQuery({
    queryKey: KANBAN_TAGS_KEY,
    queryFn: listTags,
  });

  const moveMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: KanbanTaskStatus }) => {
      return patchTask(taskId, { status });
    },
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: KANBAN_TASKS_KEY });
      const previous = queryClient.getQueryData<TasksCache>(KANBAN_TASKS_KEY);
      if (previous === undefined) {
        return { previous };
      }

      queryClient.setQueryData<TasksCache>(KANBAN_TASKS_KEY, {
        tasks: previous.tasks.map((item) => {
          if (item.id !== taskId) {
            return item;
          }

          return { ...item, status };
        }),
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(KANBAN_TASKS_KEY, context.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData<TasksCache>(KANBAN_TASKS_KEY, (current) => {
        if (current === undefined) {
          return { tasks: [data.task] };
        }

        return {
          tasks: current.tasks.map((item) => {
            if (item.id !== data.task.id) {
              return item;
            }

            return data.task;
          }),
        };
      });
    },
  });

  const createTagMutation = useMutation({
    mutationFn: (name: string) => {
      return createTag({ name });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: KANBAN_TAGS_KEY });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (body: CreateTaskBody) => {
      return createTask(body);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: KANBAN_TASKS_KEY });
    },
  });

  const saveTaskMutation = useMutation({
    mutationFn: ({ taskId, body }: { taskId: string; body: PatchTaskBody }) => {
      return patchTask(taskId, body);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: KANBAN_TASKS_KEY });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => {
      return deleteTask(taskId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: KANBAN_TASKS_KEY });
    },
  });

  const tasks = tasksQuery.data?.tasks ?? [];
  const tags = tagsQuery.data?.tags ?? [];
  const error = tasksQuery.error ?? tagsQuery.error ?? null;
  const isLoading = error === null && (tasksQuery.isPending || tagsQuery.isPending);

  const retry = () => {
    void tasksQuery.refetch();
    void tagsQuery.refetch();
  };

  const moveTask = async (taskId: string, status: KanbanTaskStatus) => {
    const current = tasks.find((item) => item.id === taskId);
    if (current === undefined || current.status === status) {
      return;
    }

    try {
      await moveMutation.mutateAsync({ taskId, status });
    } catch {
      // Cache already reverted in onError.
    }
  };

  return {
    tasks,
    tags,
    grouped: groupTasks(tasks),
    isLoading,
    error,
    retry,
    moveTask,
    createTag: createTagMutation.mutateAsync,
    createTask: createTaskMutation.mutateAsync,
    saveTask: (taskId: string, body: PatchTaskBody) => {
      return saveTaskMutation.mutateAsync({ taskId, body });
    },
    removeTask: deleteTaskMutation.mutateAsync,
    tagBusy: createTagMutation.isPending,
    taskBusy:
      createTaskMutation.isPending ||
      saveTaskMutation.isPending ||
      deleteTaskMutation.isPending,
  };
}
