/**
 * Shell navigation contract. The shell lives in `shared/ui` (`type:ui`) so it
 * cannot reach into a store; the app supplies this structure as an input.
 */
export interface NavItem {
  label: string;
  route: string;
  /** Key into the `inv-icon` sprite. */
  icon: string;
}

export interface NavSection {
  /** Section eyebrow, e.g. "Catalogue". Omit for an ungrouped block. */
  label?: string;
  items: NavItem[];
}
