<script setup>
import { ref } from 'vue'
import { reduceTotalMoney } from '@/utils/order'


const show = ref(false)
const fee_detail = ref([])

function init(data) {
    const global_detail = reduceTotalMoney(data, 'global').fee_detail
    const groups_detail = reduceTotalMoney(data, 'groups').fee_detail
    // 【服务费用】【优惠费用】数组的字段需要与 reduceTotalMoney 函数内定义的 fee_detail 的字段一致，且格式一致
    const service_detail = [
        {
            sample_name: '服务费用',
            price: '',
            detail_list: [],
        }
    ]
    const discount_detail = [
        {
            sample_name: '优惠费用',
            price: '',
            detail_list: [],
        }
    ]
    fee_detail.value = [...global_detail, ...groups_detail, ...service_detail, ...discount_detail]
    show.value = true
}

defineExpose({init})
</script>

<template>
    <el-dialog v-model="show" title="费用明细" width="650px" center>
        <div v-for="(item, index) in fee_detail" :key="index">
            <div>{{ item.sample_name }}</div>
            <div>
                <div v-for="(i, idx) in item.detail_list" :key="`${index}-${idx}`">
                    <div>{{ i.label }}</div>
                    <div>{{ i.value }}</div>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<style lang="scss" scoped>

</style>