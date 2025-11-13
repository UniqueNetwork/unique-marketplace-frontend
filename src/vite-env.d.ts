/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

// SVG as URL (default)
declare module '*.svg' {
  const src: string;
  export default src;
}

// SVG as React component (with ?react suffix)
declare module '*.svg?react' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

