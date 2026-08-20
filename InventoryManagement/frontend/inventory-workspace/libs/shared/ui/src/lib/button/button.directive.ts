import { booleanAttribute, computed, Directive, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'ghost-inverse' | 'danger' | 'danger-quiet';
export type ButtonSize = 'sm' | 'md' | 'lg';

const Variants: Record<ButtonVariant, string> = {
  // Stamped ink, not a SaaS blue — the primary action reads like a mark made on paper.
  primary: 'bg-ink text-white hover:bg-ink-700 active:bg-ink-800',
  secondary: 'border border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-sunken',
  ghost: 'text-steel-700 hover:bg-surface-sunken hover:text-ink',
  // For the ink plane — the sidebar. `ghost` is unreadable there.
  'ghost-inverse': 'text-steel-300 hover:bg-ink-700 hover:text-white',
  danger: 'bg-danger text-white hover:bg-danger-700',
  'danger-quiet': 'text-danger hover:bg-danger-100',
};

const Sizes: Record<ButtonSize, string> = {
  sm: 'h-7 px-2 text-xs',
  md: 'h-8 px-3 text-base',
  lg: 'h-9 px-4 text-md',
};

const IconOnlySizes: Record<ButtonSize, string> = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-9 w-9',
};

/**
 * Applied to a real `<button>` or `<a>` rather than wrapping one, so native
 * semantics, `disabled`, form submission and routing all keep working.
 * The focus ring is deliberately absent here — one global `:focus-visible`
 * treatment covers the whole app (see styles.css).
 */
@Directive({
  selector: 'button[invButton], a[invButton]',
  standalone: true,
  host: { '[class]': 'classes()' },
})
export class ButtonDirective {
  readonly variant = input<ButtonVariant>('secondary');
  readonly size = input<ButtonSize>('md');
  /** Square padding for a glyph-only button. Remember to give it an `aria-label`. */
  readonly iconOnly = input(false, { transform: booleanAttribute });

  readonly classes = computed(() =>
    [
      'inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded',
      'font-medium transition-colors duration-150',
      'disabled:pointer-events-none disabled:opacity-45',
      Variants[this.variant()],
      this.iconOnly() ? IconOnlySizes[this.size()] : Sizes[this.size()],
    ].join(' '),
  );
}
