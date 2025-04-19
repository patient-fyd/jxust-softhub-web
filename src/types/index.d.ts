declare module '@kangc/v-md-editor' {
  import { App, Component } from 'vue';
  
  interface VMdEditor extends Component {
    use: (plugin: any, options?: any) => void;
  }
  
  const editor: VMdEditor;
  export default editor;
}

declare module '@kangc/v-md-editor/lib/theme/github.js' {
  const theme: any;
  export default theme;
}

declare module '@kangc/v-md-editor/lib/preview' {
  import { Component } from 'vue';
  const VMdPreview: Component;
  export default VMdPreview;
}

declare module 'vue-codemirror' {
  import { Component } from 'vue';
  
  export const Codemirror: Component;
} 