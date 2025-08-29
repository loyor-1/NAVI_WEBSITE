<script setup>
import { ref, reactive, watch } from 'vue';
import { useGetOrderList } from '@/api'

const loading = ref(false)
const total = ref(0)
const status_value = ref(0)
const order_list = ref([])//订单列表

//订单列表接口参数
const orderCode = ref('')//临时存储订单号
const params = ref({
    pageNum: 1,
    pageSize: 10,
    orderCode: '',
    status: '',
    prepaidPayment: '',//支付方式
})
//累计检测金额
const total_cost = ref({
    user: 0,
    team: 0,
})
//支付方式筛选条件
const payment_list = reactive([
    { label: "全部", value: '' },
    { label: "个人预存", value: 1 },
    { label: "团队预存", value: 2 },
    { label: "支付宝", value: 3 },
    { label: "微信", value: 4 },
    { label: "个人信用", value: 5 },
    { label: "团队信用", value: 6 },
])
//订单状态筛选列表
const status_list = reactive([
    { label: '全部订单', value: 0 },
	{ label: '待支付', value: 1 },
	{ label: '待审核', value: 10 },
	{ label: '待寄样/取样', value: -1},
	{ label: '已寄样/取样', value: -2 },
	{ label: '待实验', value: 4 },
	{ label: '实验中', value: 5 },
	{ label: '待核对', value: 12 },
	{ label: '已取消', value: 8 },
	{ label: '售后/回运', value: -3 },
	{ label: '已完成',  value: -4 },
	{ label: '申请开票', value: 9},
])

watch(
    params,
    () => {
        console.log(111)
        getOrderList()
    },
    { 
        deep: true,
        immediate: true,
    }
)

//获取订单列表
async function getOrderList() {
    loading.value = true
    try {
        const res = await useGetOrderList(params.value)
        order_list.value = res.data.data.list
        total_cost.value = {
            user: res.data.data.clientStat,
            team: res.data.data.teamStat,
        }
        total.value = res.data.data.total
        loading.value = false
    }
    catch(err) {
        console.log(err)
        loading.value = false
    }
}

//订单号搜索
function inputOrderCode() {
    params.value.orderCode = orderCode.value
}

//订单状态筛选
function changeStatus(value) {
    status_value.value = value
    const { pageNum, pageSize, prepaidPayment, orderCode } = params.value
    const new_params = {
        pageNum,
        pageSize,
        prepaidPayment,
        orderCode,
    }
    if(value > 0) {
        new_params.status = value
    } else if(value == 0) {
        new_params.status = ''
    } else {
        switch(value) {
            case -1:
                new_params.customWaitStatus = true
                break
            case -2:
                new_params.customHasStatus = true
                break
            case -3:
                new_params.status = 7
				new_params.customBackStatus = true
                break
            case -4:
                new_params.status = 7
				new_params.noAfterSalesStatus = '1'
				new_params.noRecycleStatus = '2'
                break
        }
    }
    params.value = new_params
}

</script>

<template>
    <div class="page-main flex-center">
        <div class="utils-box">
            <div class="search-box flex-center">
                <el-input v-model="orderCode" placeholder="请输入订单号">
                    <template #append>
                        <el-button @click="inputOrderCode">
                            <el-icon><Search /></el-icon>
                        </el-button>
                    </template>
                </el-input>
                <el-select v-model="params.prepaidPayment" placeholder="选择支付方式">
                    <el-option v-for="item in payment_list" :key="item.value" :label="item.label" :value="item.value"/>
                </el-select>
            </div>
            <div class="menu-box">
                <el-scrollbar>
                    <div class="default-button" :class="{'default-button-active': status_value == item.value}" v-for="(item, index) in status_list" :key="index" @click="changeStatus(item.value)"> {{ item.label }} </div>
                </el-scrollbar>
            </div>
        </div>
        <div class="order-box" v-loading="loading">
            订单区
        </div>
    </div>
    <div class="pagination-box">
        <el-pagination
          v-model:current-page="params.pageNum"
          v-model:page-size="params.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :background="true"
          layout="total, sizes, prev, pager, next"
          :total="total"
        >
            <template #prev>
    <span>上一页</span>
  </template>
  <template #next>
    <span>下一页</span>
  </template>
        </el-pagination>
    </div>
</template>

<style lang="scss" scoped>
.page-main {
    width: calc((88vw - 30px) * 0.78);
    min-width: 965px;
    height: calc(100vh - 350px);
}

.utils-box {
    width: calc((88vw - 30px) * 0.78 * 0.18);
    min-width: 174px;
    height: calc(100vh - 350px);
    border-right: 1px solid #cccccc;
    .search-box {
        flex-direction: column;
        justify-content: space-around;
        height: 100px;
        padding: 0 15px;
        border-bottom: 1px solid #cccccc;
    }
    .menu-box {
        width: calc((88vw - 30px) * 0.78 * 0.18);
        height: calc(100vh - 450px);
        padding: 15px 0;
        .default-button {
            width: calc(100% - 30px);
            height: 40px;
            margin: 0 auto 15px;
        }
    }
}

.order-box {
    width: 82%;
    min-width: 791px;
    height: calc(100vh - 350px);
}

.pagination-box {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: calc((88vw - 30px) * 0.78);
    min-width: 965px;
    height: 60px;
    padding: 0 15px;
    border-top: 1px solid #cccccc;
}
</style>