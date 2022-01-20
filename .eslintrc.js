module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
        jest: true,
        node: true
    },
    extends: [
        "eslint:recommended",
        require.resolve('eslint-config-standard'),
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
    ],
    ignorePatterns: [
        '.eslintrc.js',
        '.github/**',
        '.vscode/**',
        '.yarn/**',
        '**/build/*',
        '**/coverage/*',
        '**/node_modules/*'
    ],
    overrides: [{
        files: ['*.js', '*.cjs', '*.mjs'],
        rules: {
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off', //тоже ничего не делает?
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',// ничего не делает?
            '@typescript-eslint/restrict-plus-operands': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            "sort-keys-fix/sort-keys-fix": "warn" // сама добавила для автоматической сортировки ключей
        }
    }],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        extraFileExtensions: ['.cjs', '.mjs'],
        warnOnUnsupportedTypeScriptVersion: false,
        project: [
            './tsconfig.json'
        ],
        ecmaFeatures: {
            "jsx": true
        },
        ecmaVersion: 12
    },
    plugins: [
        '@typescript-eslint',
        'header',
        'import',
        'import-newlines',
        'react-hooks',
        'simple-import-sort',
        'sort-destructure-keys',
        "sort-keys-fix",// сама добавила
        "react",
    ],
    rules: {
        // required as 'off' since typescript-eslint has own versions
        indent: 'off',
        'no-use-before-define': 'off',
        '@typescript-eslint/indent': ['error', 2],
        // rules from semistandard (don't include it, has standard dep version mismatch)
        semi: [2, 'always'],
        'camelcase':'warn',// удаление вернет error
        'no-extra-semi': 2,
        // specific overrides
        '@typescript-eslint/no-non-null-assertion': 'warn', //вернуть в error после правок
        '@typescript-eslint/type-annotation-spacing': 'error',
        '@typescript-eslint/no-floating-promises': 'warn', // при удалении переключится в error
        '@typescript-eslint/no-unsafe-return': 'warn',// при удалении переключится в error
        '@typescript-eslint/no-unsafe-argument': 'warn', // при удалении переключится в error
        '@typescript-eslint/no-unsafe-assignment':'warn',// при удалении переключится в error
        '@typescript-eslint/ban-ts-comment': 'warn', // при удалении переключится в error
        '@typescript-eslint/no-unsafe-call': 'warn', // при удалении переключится в error
        '@typescript-eslint/no-unsafe-member-access': 'warn', // при удалении переключится в error
        '@typescript-eslint/restrict-template-expressions':'warn', // при удалении переключится в error
        'react/display-name':'warn',
        'arrow-parens': ['error', 'always'],
        'default-param-last': [0], // conflicts with TS version (this one doesn't allow TS ?)
        
        // если нужен header, то его можно здесь прописать
        // 'header/header': [2, 'line', [
        //     { pattern: ' Copyright \\d{4}(-\\d{4})? @polkadot/' },
        //     ' SPDX-License-Identifier: Apache-2.0'
        // ], 2],
        'import-newlines/enforce': ['error', 2048],
        'jsx-quotes': ['error', 'prefer-single'],
        'react/prop-types': [0], // this is a completely broken rule
        'react/jsx-key':'warn', //удалив, вернется error
        'object-curly-newline': ['error', {
            ImportDeclaration: 'never',
            ObjectPattern: 'never'
        }],
        'padding-line-between-statements': [
            'error',
            { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
            { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
            { blankLine: 'always', prev: '*', next: 'block-like' },
            { blankLine: 'always', prev: 'block-like', next: '*' },
            { blankLine: 'always', prev: '*', next: 'function' },
            { blankLine: 'always', prev: 'function', next: '*' },
            { blankLine: 'always', prev: '*', next: 'try' },
            { blankLine: 'always', prev: 'try', next: '*' },
            { blankLine: 'always', prev: '*', next: 'return' },
            { blankLine: 'always', prev: '*', next: 'import' },
            { blankLine: 'always', prev: 'import', next: '*' },
            { blankLine: 'any', prev: 'import', next: 'import' }
        ],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn', //после исправлений вернуть в error
        'react/jsx-closing-bracket-location': [1, 'tag-aligned'],
        'react/jsx-first-prop-new-line': [1, 'multiline-multiprop'],
        'react/jsx-fragments': 'error',
        'react/jsx-max-props-per-line': [1, {
            maximum: 1,
            when: 'always'
        }],
        'react/jsx-no-bind': 1, //после правок переключить в 2
        'react/jsx-sort-props': [1, {
            noSortAlphabetically: false
        }],
        'react/jsx-tag-spacing': [2, {
            closingSlash: 'never',
            beforeSelfClosing: 'always',
            afterOpening: 'never',
            beforeClosing: 'never'
        }],
        'sort-destructure-keys/sort-destructure-keys': [2, {
            caseSensitive: true
        }],
        'simple-import-sort/imports': [2, {
            groups: [
                ['^\u0000'], // all side-effects (0 at start)
                ['\u0000$', '^@polkadot.*\u0000$', '^\\..*\u0000$'], // types (0 at end)
                ['^[^/\\.]'], // non-polkadot
                ['^@polkadot'], // polkadot
                ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'] // local (. last)
            ]
        }],
        "sort-keys-fix/sort-keys-fix": "warn",
        'sort-keys': 'error',
        'no-void': 'off',
        // needs to be switched on at some point
        '@typescript-eslint/no-explicit-any': 'off',
        // this seems very broken atm, false positives
        '@typescript-eslint/unbound-method': 'off',
        // suppress errors for missing 'import React' in files
        "react/react-in-jsx-scope": "off",
        "@typescript-eslint/no-unused-vars": "warn",//вернуть в error
        "@typescript-eslint/no-explicit-any": "warn",//вернуть в error
        "@typescript-eslint/no-empty-function": "off",
        '@typescript-eslint/no-var-requires': 'off'
    },
    settings: {
        'import/extensions': ['.js', '.ts', '.tsx'],
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx']
        },
        'import/resolver': require.resolve('eslint-import-resolver-node'),
        react: {
            version: 'detect'
        }
    }
};
