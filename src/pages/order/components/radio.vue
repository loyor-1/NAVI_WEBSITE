<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const props = defineProps(['base_data'])
const emit = defineEmits(['updateValue']);

const value_data = ref({
    fieIdValue: props.base_data.fieIdValue || '',
    optionId: props.base_data.optionId || [],
    valueId: props.base_data.valueId || '',
})

function changeRadio(data) {
    value_data.value.fieIdValue = data.optionName
    value_data.value.optionId = [ data.optionId ]
    value_data.value.valueId = data.optionId.toString()
    updateValue()
}

function updateValue() {
    emit('updateValue', value_data.value)
}
</script>

<template>
    <div class="fieId-box">
        <div class="fieId-label">{{ props.base_data.fieIdName }}</div>
        <div class="fieId-content">
            <div class="radio" :class="{'radio-active': item.optionId == value_data.valueId}" v-for="item in props.base_data.options" :key="item.optionId" @click="changeRadio(item)">{{ item.optionName }}</div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.radio {
    cursor: default;
    min-width: 150px;
    height: fit-content;
    padding: 8px;
    text-align: center;
    border-radius: 10px;
    border: 1px solid #E8E8E8;
}

.radio-active {
    color: #5CC300;
    border-color: #5CC300;
    background-color: #5CC30030;
}
</style>