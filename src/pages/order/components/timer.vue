<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const props = defineProps(['base_data'])
const emit = defineEmits(['updateValue']);

const value_data = ref({
    duration: 0,
})

function updateValue() {
    emit('updateValue', value_data.value)
}
</script>

<template>
    <div class="fieId-box">
        <div class="fieId-label">{{ props.base_data.fieIdName }}</div>
        <div class="fieId-content">
            <el-input-number :min="0" :precision="1" :step="0.5" step-strictly v-model="value_data.duration" @change="updateValue"/>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>