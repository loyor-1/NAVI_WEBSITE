<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const props = defineProps(['base_data'])
const emit = defineEmits(['updateValue']);

const value_data = ref({
    fieIdValue: 0,
})

function initValueData() {
    if(props.base_data.fieIdValue) {
        value_data.value.fieIdValue = Number(props.base_data.fieIdValue)
    } else if(props.base_data.detectionRangeMin) {
        value_data.value.fieIdValue = Number(props.base_data.detectionRangeMin)
    }
    updateValue()
}
initValueData()

function updateValue() {
    emit('updateValue', value_data.value)
}
</script>

<template>
    <div class="fieId-box">
        <div class="fieId-label">{{ props.base_data.fieIdName }}</div>
        <div class="fieId-content">
            <el-input-number :min="props.base_data.detectionRangeMin" :max="props.base_data.detectionRangeMax" :step="1" step-strictly v-model="value_data.fieIdValue" @change="updateValue"/>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>