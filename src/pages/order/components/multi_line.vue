<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps(['base_data'])
const emit = defineEmits(['updateValue'])

const value_data = ref({
    fieIdValue: props.base_data.fieIdValue || '',
})

watch(
    () => props.base_data,
    (newValue) => {
        value_data.value.fieIdValue = newValue.fieIdValue
    },
    {
        immediate: true,
        deep: true,
    }
)

function updateValue() {
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
                <el-input type="textarea" resize="none" :rows="4" placeholder="请输入" v-model="value_data.fieIdValue" @input="updateValue"/>
            </div>
        </div>
        <div class="fieId-tips">{{ props.base_data.fieIdRemark }}</div>
    </div>
</template>

<style lang="scss" scoped>

</style>