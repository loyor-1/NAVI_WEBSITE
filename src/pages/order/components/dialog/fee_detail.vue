<script setup>
import { ref } from 'vue'
import { reduceTotalMoney } from '@/utils/order'


const show = ref(false)
const fee_detail = ref([])
const bargain_status = ref(false)
const total_cost = ref('0.00')

function init(appoint_data, service_price_data, discount_data) {
    // 【字段费用】【服务费用】【优惠费用】数组的字段需要与 reduceTotalMoney 函数内定义的 fee_detail 的字段一致，且格式一致,如下：
    // [
    //     {
    //         sample_name: '服务费用',
    //         price: '',
    //         detail_list: [],
    //     }
    // ]

    let global_detail = []
    let groups_detail = []
    let service_detail = []
    let discount_detail = []

    if(appoint_data) {
        global_detail = reduceTotalMoney(appoint_data, 'global').fee_detail
        groups_detail = reduceTotalMoney(appoint_data, 'groups').fee_detail
        const global_bargain_status = reduceTotalMoney(appoint_data, 'groups').bargain_status
        const groups_bargain_status = reduceTotalMoney(appoint_data, 'groups').bargain_status
        bargain_status.value = global_bargain_status || groups_bargain_status
    }
    if(service_price_data) {
        service_detail = service_price_data
    }
    if(discount_data) {
        discount_detail = discount_data
    }
    fee_detail.value = [...global_detail, ...groups_detail, ...service_detail, ...discount_detail]
    total_cost.value = appoint_data.totalCost || ''
    show.value = true
}

defineExpose({init})
</script>

<template>
    <el-dialog v-model="show" title="费用明细" width="650px" center>
        <div class="dialog">
            <el-scrollbar>
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
            </el-scrollbar>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <span v-if="bargain_status">当前订单包含待议价选项，具体金额请下单后联系客服</span>
                <span v-else>
                    <span>订单总金额：</span>
                    <span class="font-FF4A2B">￥{{ total_cost }}</span>
                </span>

            </div>
        </template>
    </el-dialog>
</template>

<style lang="scss" scoped>
.dialog {
    height: 50vh;
    padding: 5px;
    border: 1px solid #cccccc;
}
.detail-box {
    margin-bottom: 10px;
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
        width: 60%;
    }
    .content-value {
        width: 40%;
        text-align: right;
    }
}
.dialog-footer {
    padding: 15px 0;
    background-color: #F4F7FA;
}
</style>
