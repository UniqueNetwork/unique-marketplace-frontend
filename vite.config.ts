import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import { config } from 'dotenv';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';

// Load environment variables
config({ path: '.env' });

// Plugin to ensure sdk-2 uses its nested @unique-nft/schemas
function sdk2SchemasPlugin(): Plugin {
  const sdk2SchemasPath = resolve(__dirname, 'node_modules/sdk-2/node_modules/@unique-nft/schemas');
  const sdk2SchemasIndex = resolve(sdk2SchemasPath, 'index.js');

  return {
    name: 'sdk2-schemas-plugin',
    enforce: 'pre',
    resolveId(id, importer) {
      // Check if this is @unique-nft/schemas being imported
      if (id === '@unique-nft/schemas' && importer) {
        // Check if the importer is from sdk-2
        if (importer.includes('node_modules/sdk-2')) {
          // Check if nested schemas exists
          if (existsSync(sdk2SchemasIndex)) {
            return sdk2SchemasIndex;
          }
        }
      }
      return null;
    },
  };
}

// Plugin to fix babel-plugin-macros and styled-components issues
function babelMacrosFixPlugin(): Plugin {
  return {
    name: 'babel-macros-fix-plugin',
    enforce: 'pre',
    resolveId(id, importer) {
      // Prevent babel-plugin-macros from trying to use Node.js resolve module
      if (id === 'resolve' || id === 'resolve/lib/async' || id.startsWith('resolve/')) {
        // Return a virtual module that doesn't use fs
        return '\0virtual:resolve';
      }
      // Provide a virtual babel-plugin-macros that works in browser
      // Match various import patterns
      if (id === 'babel-plugin-macros' || 
          id === 'babel-plugin-macros/dist/index.js' ||
          id.includes('babel-plugin-macros/dist/index')) {
        return '\0virtual:babel-plugin-macros';
      }
      // Also handle imports from styled-components
      if (importer && (importer.includes('styled-components') || importer.includes('node_modules')) && 
          (id === 'babel-plugin-macros' || id.includes('babel-plugin-macros'))) {
        return '\0virtual:babel-plugin-macros';
      }
      // Handle @babel/helper-module-imports imports from styled-components-macro
      // Create a virtual module that properly wraps the CommonJS module
      // But don't intercept if the import is coming from our virtual module itself
      if (id === '@babel/helper-module-imports' && 
          importer && 
          importer.includes('styled-components-macro') &&
          !importer.includes('virtual:babel-helper-module-imports')) {
        return '\0virtual:babel-helper-module-imports';
      }
      // Handle @babel/traverse imports from styled-components-macro
      // Create a virtual module that properly wraps the CommonJS module
      if (id === '@babel/traverse' && 
          importer && 
          importer.includes('styled-components-macro') &&
          !importer.includes('virtual:babel-traverse')) {
        return '\0virtual:babel-traverse';
      }
      // Handle babel-plugin-styled-components imports from styled-components-macro
      // Create a virtual module that properly wraps the CommonJS module
      if (id === 'babel-plugin-styled-components' && 
          importer && 
          importer.includes('styled-components-macro') &&
          !importer.includes('virtual:babel-plugin-styled-components')) {
        return '\0virtual:babel-plugin-styled-components';
      }
      // Handle react-is imports from styled-components browser ESM
      // Create a virtual module that properly wraps the CommonJS module
      if (id === 'react-is' && 
          importer && 
          (importer.includes('styled-components.browser.esm.js') || importer.includes('styled-components.esm.js')) &&
          !importer.includes('virtual:react-is')) {
        return '\0virtual:react-is';
      }
      // Handle shallowequal imports from styled-components browser ESM
      // Create a virtual module that properly wraps the CommonJS module
      if (id === 'shallowequal' && 
          importer && 
          (importer.includes('styled-components.browser.esm.js') || importer.includes('styled-components.esm.js')) &&
          !importer.includes('virtual:shallowequal')) {
        return '\0virtual:shallowequal';
      }
      return null;
    },
    load(id) {
      if (id === '\0virtual:resolve') {
        // Return a minimal resolve implementation that doesn't use fs
        return `
          export function resolve() {
            throw new Error('resolve is not available in browser');
          }
          export default { resolve };
        `;
      }
      if (id === '\0virtual:babel-plugin-macros') {
        // Return a minimal babel-plugin-macros implementation that styled-components expects
        // styled-components expects createMacro to be exported
        return `
          function createMacro(fn, options) {
            // Return the function as-is for browser environment
            // In browser, we don't need macro transformation
            return fn;
          }
          // Export as named export
          export { createMacro };
          // Also export as default for compatibility
          export default createMacro;
        `;
      }
      if (id === '\0virtual:babel-helper-module-imports') {
        // Create ES module wrapper that re-exports from the actual CommonJS module
        // Import from the package name - Vite will resolve and convert CommonJS to ES modules
        return `
          import * as _mod from '@babel/helper-module-imports';
          export const addDefault = _mod.addDefault;
          export const addNamed = _mod.addNamed;
          export const addNamespace = _mod.addNamespace;
          export const addSideEffect = _mod.addSideEffect;
          export const ImportInjector = _mod.ImportInjector;
          export const isModule = _mod.isModule;
        `;
      }
      if (id === '\0virtual:babel-traverse') {
        // Create ES module wrapper for @babel/traverse
        // It's imported as default export, so we need to provide that
        return `
          import * as _mod from '@babel/traverse';
          // Export as default for compatibility with styled-components-macro.esm.js
          export default _mod.default || _mod;
        `;
      }
      if (id === '\0virtual:babel-plugin-styled-components') {
        // Create ES module wrapper for babel-plugin-styled-components
        // It's imported as default export, so we need to provide that
        return `
          import * as _mod from 'babel-plugin-styled-components';
          // Export as default for compatibility with styled-components-macro.esm.js
          export default _mod.default || _mod;
        `;
      }
      if (id === '\0virtual:react-is') {
        // Create ES module wrapper for react-is
        // It exports named exports like typeOf, isElement, isValidElementType
        return `
          import * as _mod from 'react-is';
          export const typeOf = _mod.typeOf;
          export const isElement = _mod.isElement;
          export const isValidElementType = _mod.isValidElementType;
          // Also export all other exports
          export const ForwardRef = _mod.ForwardRef;
          export const Memo = _mod.Memo;
          export const isFragment = _mod.isFragment;
          export const isLazy = _mod.isLazy;
          export const isPortal = _mod.isPortal;
          export const isProfiler = _mod.isProfiler;
          export const isStrictMode = _mod.isStrictMode;
          export const isSuspense = _mod.isSuspense;
          // Export default for compatibility
          export default _mod.default || _mod;
        `;
      }
      if (id === '\0virtual:shallowequal') {
        // Create ES module wrapper for shallowequal
        // It's imported as default export
        return `
          import * as _mod from 'shallowequal';
          // Export as default for compatibility with styled-components.browser.esm.js
          export default _mod.default || _mod;
        `;
      }
      return null;
    },
    transform(code, id) {
      // Transform styled-components-macro.esm.js to fix @babel/helper-module-imports import
      if (id.includes('styled-components-macro.esm.js')) {
        // Replace the ES module import with a CommonJS-compatible import
        // The import statement: import{addDefault as e,addNamed as t}from"@babel/helper-module-imports"
        // needs to be handled by Vite's CommonJS plugin
        // We'll ensure the module is properly resolved
        return null; // Let Vite handle it normally
      }
      return null;
    },
  };
}

// Plugin to resolve imports without extensions (matching webpack behavior)
function resolveExtensionsPlugin(): Plugin {
  const extensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];
  const srcPath = resolve(__dirname, 'src');
  const aliases = ['pages', 'types', 'config', 'components', 'api', 'hooks', 'utils', 'collections', 'account', 'styles', 'static'];

  return {
    name: 'resolve-extensions-plugin',
    enforce: 'pre',
    resolveId(id, importer) {
      // Skip node_modules and scoped packages
      if (id.startsWith('@') || id.includes('node_modules')) {
        return null;
      }
      
      // Check if it's a path alias (pages/, types/, config/, etc.)
      const aliasMatch = id.match(/^(pages|types|config|components|api|hooks|utils|collections|account|styles|static)(\/|$)/);
      if (aliasMatch) {
        const aliasPath = resolve(srcPath, id);
        // Try to find file with extensions
        for (const ext of extensions) {
          const fullPath = aliasPath + ext;
          if (existsSync(fullPath)) {
            return fullPath;
          }
        }
        // Try index files
        for (const ext of extensions) {
          const indexPath = resolve(aliasPath, `index${ext}`);
          if (existsSync(indexPath)) {
            return indexPath;
          }
        }
      }
      return null;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
    }),
    // Fix babel-plugin-macros resolve issues (must be first)
    babelMacrosFixPlugin(),
    // Resolve imports without extensions (must be before other plugins)
    resolveExtensionsPlugin(),
    // SVG support - both as URL and React components
    svgr({
      svgrOptions: {
        exportType: 'default',
      },
      // Import SVG as URL by default, use ?react for React components
      include: '**/*.svg?react',
    }),
    sdk2SchemasPlugin(),
    // Node.js polyfills
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
      // Polyfill fs for babel-plugin-macros
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      // Ensure single React instance (critical for fixing hooks errors)
      react: resolve(__dirname, 'node_modules/react'),
      'react-dom': resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': resolve(__dirname, 'node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': resolve(__dirname, 'node_modules/react/jsx-dev-runtime'),
      'react-dom/client': resolve(__dirname, 'node_modules/react-dom/client'),
      // Ensure styled-components uses the same React
      'styled-components': resolve(__dirname, 'node_modules/styled-components'),
      // Path aliases (matching webpack resolve.modules with 'src')
      // These allow imports like 'pages/...' instead of 'src/pages/...'
      components: resolve(__dirname, 'src/components'),
      account: resolve(__dirname, 'src/account'),
      api: resolve(__dirname, 'src/api'),
      hooks: resolve(__dirname, 'src/hooks'),
      styles: resolve(__dirname, 'src/styles'),
      utils: resolve(__dirname, 'src/utils'),
      collections: resolve(__dirname, 'src/collections'),
      static: resolve(__dirname, 'src/static'),
      pages: resolve(__dirname, 'src/pages'),
      types: resolve(__dirname, 'src/types'),
      config: resolve(__dirname, 'src/config'),
    },
    // Ensure nested node_modules are resolved correctly
    // Dedupe React to prevent multiple instances (fixes hooks errors)
    dedupe: ['react', 'react-dom', 'styled-components'],
  },
  define: {
    // Support both process.env (for compatibility) and import.meta.env (Vite standard)
    'process.env': JSON.stringify(process.env),
    global: 'globalThis',
    'process.browser': 'true',
  },
  // Load env variables with VITE_ prefix (Vite standard)
  envPrefix: ['VITE_', 'REACT_APP_'],
  publicDir: 'public',
  optimizeDeps: {
    // Force pre-bundling of these dependencies
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@unique-nft/schemas',
      'sdk-2',
      '@polkadot/api',
      '@polkadot/util-crypto',
      '@tanstack/react-query',
      '@babel/helper-module-imports', // Ensure CommonJS conversion works
      '@babel/traverse', // Ensure CommonJS conversion works
      'babel-plugin-styled-components', // Ensure CommonJS conversion works
      'react-is', // Ensure CommonJS conversion works
      'shallowequal', // Ensure CommonJS conversion works
    ],
    // Exclude problematic packages from optimization
    exclude: [
      'babel-plugin-macros',
      'resolve',
      'styled-components', // Exclude styled-components to avoid babel-plugin-macros issues
    ],
    // Ensure single instance of React
    esbuildOptions: {
      resolveExtensions: ['.jsx', '.js', '.ts', '.tsx'],
      // Fix for styled-components and babel-plugin-macros
      plugins: [],
    },
    // CommonJS options for better compatibility
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'polkadot': ['@polkadot/util', '@polkadot/react-identicon'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});

