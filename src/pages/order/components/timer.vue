<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps(['base_data'])
const emit = defineEmits(['updateValue']);

const value_data = ref({
    duration: 0,
    fieIdValue: 0,
})

watch(
    () => props.base_data,
    (newValue) => {
        value_data.value.duration = Number(newValue.duration)
        value_data.value.fieIdValue = Number(newValue.fieIdValue)
    },
    {
        immediate: true,
        deep: true,
    }
)

function updateValue() {
    value_data.value.fieIdValue = value_data.value.duration
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
                <el-input-number :min="0" :precision="1" :step="0.5" step-strictly v-model="value_data.duration" @change="updateValue"/>
            </div>
        </div>
        <div class="fieId-tips">{{ props.base_data.fieIdRemark }}</div>
    </div>
</template>

<style lang="scss" scoped>

</style>