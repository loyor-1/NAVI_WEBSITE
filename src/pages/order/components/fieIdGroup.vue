<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import { useGetFieldGroupList } from '@/api'
import radio from './radio.vue'
import checkbox from './checkbox.vue';
import singleLine from './single_line.vue';
import multiLine from './multi_line.vue';
import richText from './rich_text.vue'
import integer from './integer.vue';
import float from './float.vue';
import uploadFile from './uploadFile.vue';
import range from './range.vue';
import timer from './timer.vue';

const props = defineProps(['base_data'])
const emit = defineEmits(['updateValue']);

const value_data = ref({
    fieldGroupRelevanceList: [],//字段信息数组
    formulaDetailList: [],//字段组计算价格公式
    fieldGroupValues: [],
    totalPrice: 0,
})

async function getFieldGroupList() {
    const res = await useGetFieldGroupList(props.base_data.fieldGroupId)
    value_data.value.fieldGroupRelevanceList = res.data.fieldGroupRelevanceList
    value_data.value.formulaDetailList = res.data.formulaDetailList
    value_data.value.fieldGroupValues = res.data.fieldGroupRelevanceList
}
getFieldGroupList()

function updateFieldGroupValue(item, index, value) {
    value_data.value.fieldGroupRelevanceList[index] = {
        ...item,
        ...value
    }
    value_data.value.fieldGroupValues = value_data.value.fieldGroupRelevanceList
    updateValue()
}

function updateValue() {
    emit('updateValue', value_data.value)
}
</script>

<template>
    <div class="field-group-item" v-for="(item, index) in value_data.fieldGroupRelevanceList" :key="item.fieIdId">
        <!-- 单选 -->
        <radio v-if="item.fieIdType == 1" :base_data="item" @updateValue="(value) => updateFieldGroupValue(item, index, value)"></radio>
        <!-- 多选 -->
        <checkbox v-else-if="item.fieIdType == 2" :base_data="item" @updateValue="(value) => updateFieldGroupValue(item, index, value)"></checkbox>
        <!-- 单行文本 -->
        <singleLine v-else-if="item.fieIdType == 3" :base_data="item" @updateValue="(value) => updateFieldGroupValue(item, index, value)"></singleLine>
        <!-- 多行文本 -->
        <multiLine v-else-if="item.fieIdType == 4" :base_data="item" @updateValue="(value) => updateFieldGroupValue(item, index, value)"></multiLine>
        <!-- 富文本 -->
        <richText v-else-if="item.fieIdType == 5" :base_data="item" @updateValue="(value) => updateFieldGroupValue(item, index, value)"></richText>
        <!-- 整数 -->
        <integer v-else-if="item.fieIdType == 6" :base_data="item" @updateValue="(value) => updateFieldGroupValue(item, index, value)"></integer>
        <!-- 浮点数 -->
        <float v-else-if="item.fieIdType == 7" :base_data="item" @updateValue="(value) => updateFieldGroupValue(item, index, value)"></float>
        <!-- 上传附件 -->
        <uploadFile v-else-if="item.fieIdType == 8" :base_data="item" @updateValue="(value) => updateFieldGroupValue(item, index, value)"></uploadFile>
        <!-- 数字范围 -->
        <range v-else-if="item.fieIdType == 9" :base_data="item" @updateValue="(value) => updateFieldGroupValue(item, index, value)"></range>
        <!-- 时间 -->
        <timer v-else-if="item.fieIdType == 14" :base_data="item" @updateValue="(value) => updateFieldGroupValue(item, index, value)"></timer>
    </div>
</template>

<style lang="scss" scoped>
.field-group-item {
    margin-bottom: 10px;
}

.field-group-item:last-child {
    margin-bottom: 0;
}
</style>