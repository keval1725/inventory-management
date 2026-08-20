import nx from '@nx/eslint-plugin';
import baseConfig from '../../../eslint.config.mjs';

export default [
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'inv',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          // `attribute` is allowed alongside `element` because a few primitives here
          // must attach to a specific host element to be correct — `th[inv-sort-header]`
          // puts `aria-sort` on the actual table header. Angular Material uses the
          // same shape (and the same kebab-case attribute style) for `button[mat-button]`.
          type: ['element', 'attribute'],
          prefix: 'inv',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },
];
