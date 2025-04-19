declare module '@kangc/v-md-editor/lib/codemirror-editor' {
  import { Component } from 'vue';
  const component: Component;
  export default component;
}

declare module '@kangc/v-md-editor/lib/theme/github.js' {
  const theme: any;
  export default theme;
}

declare module 'prismjs' {
  const Prism: any;
  export default Prism;
}

declare module 'codemirror' {
  const Codemirror: any;
  export default Codemirror;
}

declare module 'codemirror/mode/markdown/markdown';
declare module 'codemirror/mode/javascript/javascript';
declare module 'codemirror/mode/css/css';
declare module 'codemirror/mode/html/html';
declare module 'codemirror/addon/edit/closebrackets';
declare module 'codemirror/addon/edit/closetag';
declare module 'codemirror/addon/display/placeholder';
declare module 'codemirror/addon/selection/active-line';
declare module 'codemirror/addon/scroll/simplescrollbars'; 