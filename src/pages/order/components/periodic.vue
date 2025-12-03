<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import periodicTable from './periodic_table.vue';

const props = defineProps(['base_data'])
const emit = defineEmits(['updateValue'])
const periodicTableRef = ref('null')

const value_data = ref({
    fieIdValue: '',
})

function updatePeriodic(list) {
    value_data.value.fieIdValue = list.join(',')
    updateValue()
}

function updateValue() {
    emit('updateValue', value_data.value)
}

function openPeriodicTable() {
    periodicTableRef.value.showPeriodicTable(true)
}
</script>

<template>
    <div class="fieId-box" :class="{'fieId-box-warning': !props.base_data.validate}">
        <div class="fieId-label">
            <span><span class="font-FF4A2B" v-if="props.base_data.isRequired">*</span>{{ props.base_data.fieIdName }}</span>
        </div>
        <div class="fieId-content">
            <div v-if="value_data.fieIdValue">您已选择：{{ value_data.fieIdValue }}</div>
            <div class="custom-button" @click="openPeriodicTable">选择元素</div>
        </div>
    </div>

    <periodicTable style="margin-top: 180px;" ref="periodicTableRef" :data="base_data" @updatePeriodic="updatePeriodic"></periodicTable>
</template>

<style lang="scss" scoped>
.custom-button {
    width: 100px;
    height: 40px;
}
</style>