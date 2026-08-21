import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const API_ORIGIN = process.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const userA = {
  email: 'kanban.a@example.com',
  password: 'KanbanTest1!',
};

const userB = {
  email: 'kanban.b@example.com',
  password: 'KanbanTest2!',
};

async function loginApi(request: APIRequestContext, email: string, password: string): Promise<string> {
  const response = await request.post(`${API_ORIGIN}/api/v1/auth/login`, {
    data: { email, password },
  });
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { accessToken: string };
  return body.accessToken;
}

async function clearKanban(request: APIRequestContext, accessToken: string): Promise<void> {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const tasksRes = await request.get(`${API_ORIGIN}/api/v1/kanban/tasks`, { headers });
  const tasksBody = (await tasksRes.json()) as { tasks: Array<{ id: string }> };
  for (const task of tasksBody.tasks) {
    await request.delete(`${API_ORIGIN}/api/v1/kanban/tasks/${task.id}`, { headers });
  }

  const tagsRes = await request.get(`${API_ORIGIN}/api/v1/kanban/tags`, { headers });
  const tagsBody = (await tagsRes.json()) as { tags: Array<{ id: string }> };
  for (const tag of tagsBody.tags) {
    await request.delete(`${API_ORIGIN}/api/v1/kanban/tags/${tag.id}`, { headers });
  }
}

async function loginUi(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /log in|sign in/i }).click();
  await expect(page.getByRole('region', { name: /pending/i })).toBeVisible();
}

test.describe('kanban happy path', () => {
  test('A: tag, task, move, edit, delete; B: isolation; guest redirect', async ({
    page,
    browser,
    request,
  }) => {
    const tokenA = await loginApi(request, userA.email, userA.password);
    await clearKanban(request, tokenA);

    await page.goto('/');
    await expect(page).toHaveURL(/login/);

    await loginUi(page, userA.email, userA.password);

    await page.getByRole('button', { name: /add tag/i }).click();
    await page.getByRole('dialog', { name: /add tag/i }).getByLabel(/name/i).fill('Work');
    await page.getByRole('button', { name: /save|create/i }).click();
    await expect(page.getByRole('dialog', { name: /add tag/i })).toHaveCount(0);

    await page.getByRole('button', { name: /add task/i }).click();
    const taskDialog = page.getByRole('dialog', { name: /add task|new task/i });
    await taskDialog.getByLabel(/title/i).fill('Write specs');
    await taskDialog.getByLabel(/description/i).fill('Kanban catalog');
    await taskDialog.getByLabel(/tag/i).selectOption({ label: 'Work' });
    await taskDialog.getByLabel(/deadline/i).fill('2026-08-25');
    await taskDialog.getByRole('button', { name: /add item|add checklist/i }).click();
    await taskDialog.getByLabel(/item/i).first().fill('Draft README');
    await taskDialog.getByRole('button', { name: /save|create/i }).click();
    await expect(taskDialog).toHaveCount(0);

    const pending = page.getByRole('region', { name: /pending/i });
    const pendingCard = pending.getByRole('group', { name: /write specs/i });
    await expect(pendingCard.getByRole('button', { name: /write specs/i })).toBeVisible();
    await expect(pendingCard.getByText('Work')).toBeVisible();

    const movedToProgress = page.waitForResponse((response) => {
      return (
        response.url().includes('/api/v1/kanban/tasks/') &&
        response.request().method() === 'PATCH' &&
        response.ok()
      );
    });
    const inProgress = page.getByRole('region', { name: /in progress/i });
    await pendingCard.dragTo(inProgress);
    await movedToProgress;
    await expect(inProgress.getByRole('group', { name: /write specs/i })).toBeVisible();

    const movedToFinished = page.waitForResponse((response) => {
      return (
        response.url().includes('/api/v1/kanban/tasks/') &&
        response.request().method() === 'PATCH' &&
        response.ok()
      );
    });
    const finished = page.getByRole('region', { name: /finished/i });
    await inProgress.getByRole('group', { name: /write specs/i }).dragTo(finished);
    await movedToFinished;
    await expect(finished.getByRole('group', { name: /write specs/i })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('region', { name: /pending/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /finished/i }).getByRole('group', { name: /write specs/i })).toBeVisible();

    const bContext = await browser.newContext();
    const bPage = await bContext.newPage();
    await loginUi(bPage, userB.email, userB.password);
    await expect(bPage.getByText('Write specs')).toHaveCount(0);
    await expect(bPage.getByText('Work')).toHaveCount(0);
    await bContext.close();

    await page.getByRole('region', { name: /finished/i }).getByRole('button', { name: /write specs/i }).click();
    const editDialog = page.getByRole('dialog', { name: /edit task/i });
    await editDialog.getByLabel(/title/i).fill('Write specs v2');
    await editDialog.getByRole('checkbox').first().check();
    await editDialog.getByRole('button', { name: /save/i }).click();
    await expect(page.getByRole('group', { name: /write specs v2/i })).toBeVisible();

    await page.getByRole('group', { name: /write specs v2/i }).getByRole('button', { name: /write specs v2/i }).click();
    await page.getByRole('dialog', { name: /edit task/i }).getByRole('button', { name: /delete/i }).click();
    await page.getByRole('dialog', { name: /confirm/i }).getByRole('button', { name: /delete|confirm/i }).click();
    await expect(page.getByText('Write specs v2')).toHaveCount(0);
  });
});
