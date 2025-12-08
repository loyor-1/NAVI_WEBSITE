<script setup>
import { defineProps, defineEmits, ref, onMounted, onUnmounted } from 'vue'
import { useGetFieldGroupList } from '@/api'
import radio from './radio.vue'
import singleLine from './single_line.vue';
import multiLine from './multi_line.vue';
import richText from './rich_text.vue'
import integer from './integer.vue';
import float from './float.vue';
import uploadFile from './upload_file.vue';
import range from './range.vue';
import timer from './timer.vue';
import mitt_bus from '@/utils/mitt_bus';

const props = defineProps(['base_data'])
const emit = defineEmits(['updateValue']);

const value_data = ref({
    formulaDetailList: [],//字段组计算价格公式
    fieldGroupValues: [],
    reservePointMethod: undefined,//价格保留规则 1 保留两位 2向上取整
    totalPrice: 0,
})

//获取字段组内的字段信息
async function getFieldGroupList() {
    const res = await useGetFieldGroupList(props.base_data.fieldGroupId)
    value_data.value.reservePointMethod = res.data.reservePointMethod
    value_data.value.formulaDetailList = res.data.formulaDetailList
    value_data.value.fieldGroupValues = res.data.fieldGroupRelevanceList.map(item => {
        item.validate = true
        if(item.fieIdType == 13){
			item.fieIdValue = item.basicValue
		}
        return item
    })
}
getFieldGroupList()

//更新字段组的校验信息
function validateFieldGroups(field_group_values) {
    value_data.value.fieldGroupValues.forEach(item => {
        const list_data = field_group_values.find(i => i.fieIdId == item.fieIdId)
        if(list_data) {
            item.validate = list_data.validate
        } else {
            item.validate = true
        }
    })
}

//更新字段组的值
function updateFieldGroupValue(item, index, value) {
    const new_value = {
        ...item,
        ...value
    }
    value_data.value.fieldGroupValues[index] = new_value
    updateValue()
}

function updateValue() {
    emit('updateValue', value_data.value)
}

onMounted(() => {
    mitt_bus.on('updateFieldGroupValues', validateFieldGroups)
})

onUnmounted(() => {
    mitt_bus.off('updateFieldGroupValues')
})
</script>

<template>
    <div class="field-group-item" v-for="(item, index) in value_data.fieldGroupValues" :key="item.fieIdId">
        <!-- 单选 -->
        <radio v-if="item.fieIdType == 1" :base_data="item" @updateValue="(value) => updateFieldGroupValue(item, index, value)"></radio>
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