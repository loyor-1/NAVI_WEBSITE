<script setup>
import { computed } from 'vue'

const emits = defineEmits(['update:modelValue', 'close'])

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true,
        default: false
    },
    show_close: {
        type: Boolean,
        default: true
    },
    width: {
        type: String,
        default: '500px',
    },
    background_color: {
        type: String,
        default: '#FFFFFF'
    },
})

const visible = computed({
    get() {
        return props.modelValue;
    },
    set(newValue) {
        emits('update:modelValue', newValue);
    }
})

function closeDialog() {
    visible.value = false
    emits('close')
}

</script>

<template>
    <div class="modal" v-show="visible">
        <div class="custom-dialog" :style="{width, backgroundColor: background_color}">
            <div class="background">
                <slot name="background"></slot>
            </div>
            <el-icon class="close-icon" v-show="show_close" @click="closeDialog"><Close /></el-icon>
            <div class="content">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@keyframes show_custom_dialog {
    0% {
        transform: scale(0.8);
        opacity: 0;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}
.modal {
    z-index: 9999999999;
    position: fixed !important;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0,0,0,0.5);
}

.custom-dialog {
    animation: show_custom_dialog 0.2s linear forwards;
    position: relative;
    margin: 15vh auto;
    min-height: 50px;
    border-radius: 5px;
}

.background {
    z-index: -1;
    position: absolute;
    top: 0;
    left: 0;
}

.close-icon {
    z-index: 2;
    position: absolute;
    right: 15px;
    top: 15px;
    transform: scale(1.2);
    :hover {
        color: red;
    }
}

.content {
    z-index: 1;
    width: 100%;
    height: 100%;
}
</style>