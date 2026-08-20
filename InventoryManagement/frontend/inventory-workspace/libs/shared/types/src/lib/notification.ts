/**
 * Cross-cutting user feedback. Raised from anywhere — an effect after a
 * successful write, or the error interceptor after a failed request — and
 * rendered once, by the shell.
 */
export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  kind: ToastKind;
  /** What happened, in the same words as the action that caused it ("Warehouse added"). */
  message: string;
  /** Optional second line: what to do about it, when the message alone isn't actionable. */
  detail?: string;
}
