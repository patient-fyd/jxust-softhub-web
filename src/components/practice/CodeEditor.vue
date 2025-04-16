<template>
  <div class="code-editor-container">
    <Codemirror
      v-model="code"
      :style="{ height: '100%' }"
      :tab-size="2"
      :indent-with-tab="true"
      :extensions="extensions"
      :autofocus="true"
      @ready="handleReady"
      @change="handleChange"
      @focus="handleFocus"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, shallowRef } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';

export default defineComponent({
  name: 'CodeEditor',
  components: {
    Codemirror
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'javascript'
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'focus'],
  setup(props, { emit }) {
    // 本地代码值
    const code = ref(props.modelValue);
    
    // 编辑器实例引用
    const view = shallowRef();
    
    // 根据语言获取相应的语言扩展
    const getLanguageExtension = (lang: string) => {
      switch (lang) {
        case 'javascript':
          return javascript();
        case 'python':
          return python();
        case 'cpp':
        case 'c++':
          return cpp();
        case 'java':
        case 'csharp':
          return cpp(); // 暂时使用cpp作为Java和C#的语法高亮
        default:
          return javascript();
      }
    };
    
    // CodeMirror扩展（语言和主题）
    const extensions = computed(() => {
      const exts = [
        getLanguageExtension(props.language),
        oneDark
      ];
      
      if (props.readOnly) {
        exts.push(EditorState.readOnly.of(true));
      }
      
      return exts;
    });
    
    // 当编辑器准备好时触发
    const handleReady = (payload: any) => {
      view.value = payload.view;
      
      // 确保编辑器获得焦点
      setTimeout(() => {
        if (view.value) {
          view.value.focus();
        }
      }, 100);
    };
    
    // 代码变化时触发
    const handleChange = (value: string) => {
      code.value = value;
      emit('update:modelValue', value);
    };
    
    // 获取焦点时触发
    const handleFocus = () => {
      emit('focus');
    };
    
    // 监听props.modelValue的变化，更新本地code值
    watch(() => props.modelValue, (newValue) => {
      if (newValue !== code.value) {
        code.value = newValue;
      }
    });
    
    // 监听语言变化，不需要做什么，因为extensions是computed属性
    
    return {
      code,
      extensions,
      handleReady,
      handleChange,
      handleFocus
    };
  }
});
</script>

<style>
.code-editor-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
  border-radius: 4px;
  overflow: hidden;
}

/* 确保编辑器占满容器 */
.cm-editor {
  height: 100%;
}

/* 编辑器文本区域样式 */
.cm-scroller {
  overflow: auto;
  font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

/* 确保光标可见 */
.cm-cursor {
  border-left: 2px solid #fff !important;
  z-index: 10;
}

/* 确保选中文本背景清晰可见 */
.cm-selectionBackground {
  background-color: rgba(100, 100, 255, 0.3) !important;
}

/* 当前行高亮 */
.cm-activeLine {
  background-color: rgba(255, 255, 255, 0.07) !important;
}
</style>