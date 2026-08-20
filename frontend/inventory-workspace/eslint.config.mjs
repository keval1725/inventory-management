import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            { sourceTag: 'scope:app', onlyDependOnLibsWithTags: ['type:feature', 'scope:shared'] },
            { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
            { sourceTag: 'scope:identity', onlyDependOnLibsWithTags: ['scope:identity', 'scope:shared'] },
            { sourceTag: 'scope:warehouse', onlyDependOnLibsWithTags: ['scope:warehouse', 'scope:shared'] },
            { sourceTag: 'scope:product', onlyDependOnLibsWithTags: ['scope:product', 'scope:shared'] },
            { sourceTag: 'scope:stock', onlyDependOnLibsWithTags: ['scope:stock', 'scope:shared'] },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:feature', 'type:data-access', 'type:ui', 'type:util', 'type:types'],
            },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:data-access', 'type:util', 'type:types'],
            },
            { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui', 'type:util', 'type:types'] },
            { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util', 'type:types'] },
            { sourceTag: 'type:types', onlyDependOnLibsWithTags: ['type:types'] },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
