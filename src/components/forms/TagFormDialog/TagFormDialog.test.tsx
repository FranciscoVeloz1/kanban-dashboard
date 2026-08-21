import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TagFormDialog } from './index';

describe('TagFormDialog', () => {
  it('does not submit an empty name', () => {
    const onSubmit = vi.fn();

    render(<TagFormDialog open onClose={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a trimmed name', () => {
    const onSubmit = vi.fn();

    render(<TagFormDialog open onClose={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: '  Work  ' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Work' });
  });
});
