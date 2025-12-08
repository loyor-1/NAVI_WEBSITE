<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const props = defineProps(['base_data'])
const emit = defineEmits(['updateValue']);

const value_data = ref({
    fieIdValue: 0,
    fieldValueRange: 0,
})

function initValueData() {
    if(props.base_data.fieIdValue) {
        value_data.value.fieIdValue = Number(props.base_data.fieIdValue)
    } else if(props.base_data.detectionRangeMin) {
        value_data.value.fieIdValue = Number(props.base_data.detectionRangeMin)
    }
    if(props.base_data.fieldValueRange) {
        value_data.value.fieldValueRange = Number(props.base_data.fieldValueRange)
    } else if(props.base_data.detectionRangeMax) {
        value_data.value.fieldValueRange = Number(props.base_data.detectionRangeMax)
    }
    emit('updateValue', value_data.value)
}
initValueData()

function updateValue() {
    if(value_data.value.fieIdValue > value_data.value.fieldValueRange) {
        value_data.value.fieIdValue = props.base_data.detectionRangeMin
    } 
    emit('updateValue', value_data.value)
}
</script>

<template>
    <div class="fieId-style">
        <div :id="props.base_data.fieIdId" class="fieId-box" :class="{'fieId-box-warning': !props.base_data.validate}">
            <div class="fieId-label">
                <span><span class="font-FF4A2B" v-if="props.base_data.isRequired">*</span>{{ props.base_data.fieIdName }}</span>
            </div>
            <div class="fieId-content">
                <el-input-number :min="props.base_data.detectionRangeMin" :max="props.base_data.detectionRangeMax" :precision="2" :step="0.01" step-strictly v-model="value_data.fieIdValue" @change="updateValue"/>
                <div>~</div>
                <el-input-number :min="props.base_data.detectionRangeMin" :max="props.base_data.detectionRangeMax" :precision="2" :step="0.01" step-strictly v-model="value_data.fieldValueRange" @change="updateValue"/>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>