<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps(['base_data'])
const emit = defineEmits(['updateValue']);

const show_tips = ref(undefined)
const fieIdValue_list = ref([])
const value_data = ref({
    fieIdValue: props.base_data.fieIdValue || '',
    optionId: props.base_data.optionId || [],
    valueId: props.base_data.valueId || '',
})

watch(
    () => props.base_data,
    (newValue) => {
        value_data.value.fieIdValue = newValue.fieIdValue || ''
        value_data.value.optionId = newValue.optionId || []
        value_data.value.valueId = newValue.valueId || ''
    },
    {
        immediate: true,
        deep: true,
    }
)

function changeCheckbox(data) {
    const index_optionId = value_data.value.optionId.findIndex(item => item == data.optionId)
    const index_fieIdValue = fieIdValue_list.value.findIndex(item => item == data.optionName)
    if(index_optionId >= 0) {
        value_data.value.optionId.splice(index_optionId, 1)
    } else {
        value_data.value.optionId.push(data.optionId)
    }
    if(index_fieIdValue >= 0) {
        fieIdValue_list.value.splice(index_fieIdValue, 1)
    } else {
        fieIdValue_list.value.push(data.optionName)
    }
    value_data.value.fieIdValue = fieIdValue_list.value.join(',')
    value_data.value.valueId = value_data.value.optionId.join(',')
    updateValue()
}

function updateValue() {
    emit('updateValue', value_data.value)
}

function showTips(data) {
    if(data.optionExplain) {
        show_tips.value = data.optionId
    } else {
        show_tips.value = undefined
    }
}

function hideTips() {
    show_tips.value = undefined
}
</script>

<template>
    <div class="fieId-style">
        <div :id="props.base_data.fieIdId" class="fieId-box" :class="{'fieId-box-warning': !props.base_data.validate}">
            <div class="fieId-label">
                <span><span class="font-FF4A2B" v-if="props.base_data.isRequired">*</span>{{ props.base_data.fieIdName }}</span>
            </div>
            <div class="fieId-content">
                <div class="radio" :class="{'radio-active': value_data.optionId.some(i => i == item.optionId)}" v-for="item in props.base_data.options" :key="item.optionId" @click="changeCheckbox(item)" @mouseenter="showTips(item)" @mouseleave="hideTips">
                    <div>{{ item.optionName }}</div>
                    <div class="option-tips" v-show="show_tips == item.optionId">{{ item.optionExplain }}</div>
                    <div class="tips-icon" v-show="show_tips == item.optionId"></div>
                </div>
            </div>
        </div>
        <div class="fieId-tips">{{ props.base_data.fieIdRemark }}</div>
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