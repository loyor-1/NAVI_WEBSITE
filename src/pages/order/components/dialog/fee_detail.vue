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
    console.log('fee_detail.value', fee_detail.value)
    show.value = true
}

defineExpose({init})
</script>

<template>
    <el-dialog v-model="show" title="费用明细" width="650px" center>
        <div v-for="(item, index) in fee_detail" :key="index">
            <div class="detail-box" v-if="item.price">
                <div class="detail-box-title flex-center">
                    <div>{{ item.sample_name }}</div>
                    <div>总计：{{ item.price }}</div>
                </div>
                <div>
                    <div class="detail-box-content flex-center" v-for="(i, idx) in item.detail_list" :key="`${index}-${idx}`">
                        <div class="content-label flex-center">
                            <el-icon><CaretRight /></el-icon>
                            <span style="margin-left: 5px;">{{ i.label }}</span>
                        </div>
                        <div class="content-value">{{ i.value }}</div>
                    </div>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<style lang="scss" scoped>
.detail-box {
    border: 1px solid #cccccc;
}
.detail-box-title {
    justify-content: space-between;
    height: 40px;
    padding: 0 15px;
    background-color: #94C9FF80;
}
.detail-box-content {
    justify-content: space-between;
    padding: 5px 30px;
    .content-label {
        justify-content: flex-start;
        width: 70%;
    }
    .content-value {
        width: 30%;
        text-align: right;
    }
}
</style>
