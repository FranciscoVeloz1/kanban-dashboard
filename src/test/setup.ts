import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

if (typeof HTMLDialogElement !== 'undefined') {
  if (HTMLDialogElement.prototype.showModal === undefined) {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.open = true;
    };
  }

  if (HTMLDialogElement.prototype.close === undefined) {
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };
  }
}

afterEach(() => {
  document.querySelectorAll('dialog').forEach((node) => {
    if (node instanceof HTMLDialogElement && node.open) {
      node.close();
    }

    node.remove();
  });
});
