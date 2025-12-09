<script setup>
import { defineProps, defineEmits, ref, onBeforeUnmount, nextTick } from 'vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';  // 引入样式

const props = defineProps(['base_data'])
const emit = defineEmits(['updateValue'])

const editor = ref(null)// 编辑器实例
// 工具栏配置
const toolbarConfig = {
    excludeKeys: [
        'fullScreen',  //排除全屏按钮
        'insertImage',  // 排除图片按钮
        'insertVideo',  // 排除视频按钮
        'codeBlock'     // 排除代码块按钮
    ]
}
// 编辑器配置
const editorConfig = {
    placeholder: '请输入内容...',
}

const value_data = ref({
    fieIdValue: props.base_data.fieIdValue || '',
})

function updateValue() {
    emit('updateValue', value_data.value)
}

// 编辑器创建完成回调
function handleCreated(editorInstance) {
    editor.value = editorInstance;  // 保存实例
}

// 内容变化回调
function handleChange() {
    updateValue()
}

// 组件卸载前销毁编辑器（避免内存泄漏）
onBeforeUnmount(async () => {
    if (editor.value) {
        // 1. 销毁编辑器实例
        editor.value.destroy();
        editor.value = null;
        // 2. 等待DOM更新，清空容器内残留节点
        await nextTick();
        const container = document.querySelector('.wangeditor-container');
        if (container) container.innerHTML = ''; // 强制清空残留DOM
    }
})
</script>

<template>
    <div class="fieId-style">
        <div :id="props.base_data.fieIdId" class="fieId-box" :class="{'fieId-box-warning': !props.base_data.validate}">
            <div class="fieId-label">
                <span><span class="font-FF4A2B" v-if="props.base_data.isRequired">*</span>{{ props.base_data.fieIdName }}</span>
            </div>
            <div class="fieId-content">
                <div class="wangeditor-container">
                    <Toolbar
                      :editor="editor"
                      :defaultConfig="toolbarConfig"
                      style="border-bottom: 1px solid #ccc"
                    />
                    <Editor
                      v-model="value_data.fieIdValue"
                      :editor="editor"
                      :defaultConfig="editorConfig"
                      style="height: 200px; overflow-y: auto"
                      @onCreated="handleCreated"
                      @onChange="handleChange"
                    />
                </div>
            </div>
        </div>
        <div class="fieId-tips">{{ props.base_data.fieIdRemark }}</div>
    </div>
</template>

<style lang="scss" scoped>
.wangeditor-container {
    width: 100%;
    border: 1px solid #E8E8E8;
}
</style>