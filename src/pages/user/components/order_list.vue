<script setup>
import { ref, reactive, watch } from 'vue'
import { useGetOrderList } from '@/api'
import { moneyKey, orderStatus } from '@/utils/order'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import mitt_bus from '@/utils/mitt_bus'

const emit = defineEmits(['emitChangeShowPage'])
const router = useRouter()

const loading = ref(false)
const total = ref(0)
const status_value = ref(0)
const order_list = ref([])//订单列表

//订单列表接口参数
const order_code = ref('')//临时存储订单号
const params = ref({
    pageNum: 1,
    pageSize: 10,
    orderCode: '',
    status: '',
    prepaidPayment: '',//支付方式
})
//累计检测金额
const total_cost = ref({
    client: 0,
    team: 0,
    total: 0,
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
        getOrderList()
    },
    { 
        deep: true,
        immediate: true,
    }
)

//订单按钮的显示与隐藏
function cancel_order(item) {
	const arr = ['待议价', '待支付', '待审核', '待寄样', '待取样']
	return arr.includes(orderStatus(item))
}
function pay_order(item) {
	const arr = ['待支付']
	return arr.includes(orderStatus(item)) && item.bargainStatus != 1
}
function upload_pack(item) {
	const arr = ['待寄样']
	return arr.includes(orderStatus(item))
}
function price_objection(item) {
	const arr = ['待核对']
	return arr.includes(orderStatus(item))
}
function confirm_result(item) {
	const arr = ['待核对']
	return arr.includes(orderStatus(item))
}
function download_result(item) {
	const arr = ['已完成', '回运']
	return arr.includes(orderStatus(item))
}
function again_order(item) {
	const arr = ['已完成']
	return arr.includes(orderStatus(item))
}
function apply_service(item) {
	const arr = ['回运', '已完成']
	return arr.includes(orderStatus(item))
}
function show_invoice(item) {
	const arr = ['已完成']
	return arr.includes(orderStatus(item)) && item.billStatus == 2 && (item.prepaidPayment != 1 || item.prepaidPayment != 2)
}
function connect_kefu(item) {
	const arr = ['售后', '回运']
	return arr.includes(orderStatus(item))
}

//获取订单列表
async function getOrderList() {
    loading.value = true
    try {
        const res = await useGetOrderList(params.value)
        res.data.data.list.forEach(item => {
            item.equipment_pic = (item.fileList && item.fileList.length) ? import.meta.env.VITE_FILE_API + item.fileList[0].url : ''
        })
        order_list.value = res.data.data.list
        total_cost.value = {
            client: (+res.data.data.clientStat).toFixed(2),
			team: (+res.data.data.teamStat).toFixed(2),
			total: (+res.data.data.clientStat + +res.data.data.teamStat).toFixed(2),
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
    params.value.orderCode = order_code.value
}

//订单状态筛选
function changeStatus(value) {
    status_value.value = value
    params.value.orderCode = order_code.value
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

//复制订单号
function copyOrderCode(orderCode) {
    try {
        // 写入剪贴板
        navigator.clipboard.writeText(orderCode)
        ElMessage.success('复制成功！')
    } catch (err) {
        ElMessage.error('复制失败，请稍后重试！')
        console.log(err)
    }
}

//前往订单详情
function emitChangeShowPage(order_id) {
    const data = {
        component: 'orderDetail',
        index: 1,
        order_id
    }
    emit('emitChangeShowPage', data)
}

// 前往支付订单
async function toPayOrder(data) {
    await router.push({
        path: '/pay_order',
        query: {
            equipment_id: data.subEquipmentId
        }
    })
    mitt_bus.emit('payOrder', { from: 'order_list', data: data.orderId })
}

</script>

<template>
    <!-- 订单列表 -->
    <div>
        <div class="page-main flex-center">
            <div class="utils-box">
                <div class="search-box flex-center">
                    <el-input v-model="order_code" placeholder="请输入订单号">
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
            <el-scrollbar>
                <div class="order-box" v-loading="loading" v-if="order_list.length">
                    <div class="order-card" v-for="item in order_list" :key="item.orderId" @click="emitChangeShowPage(item.orderId)">
                        <div class="card-head flex-center">
                            <div class="order-code flex-center" @click.stop="copyOrderCode(item.orderCode)">
                                <span>{{ item.orderCode }}</span>
                                <el-icon><DocumentCopy /></el-icon>
                            </div>
                            <div>{{ orderStatus(item) }}</div>
                        </div>
                        <div class="card-footer flex-center">
                            <div class="img-box flex-center">
                                <el-image class="card-img" :src="item.equipment_pic">
                                    <template #error>
                                        <img class="card-img" src="@/assets/img/fail_pic.png" />
                                    </template>
                                </el-image>
                            </div>
                            <div class="order-info">
                                <div>检测项目：{{ item.equipmentName }}</div>
                                <div>
                                    <span>订单金额：</span>
                                    <span v-if="orderStatus(item) == '待议价'">订单未完成议价</span>
                                    <span class="font-FF4A2B font-600" v-else>￥{{ item[moneyKey(item)] }}</span>
                                    <span style="margin-left: 5px" v-if="item.prepaidPayment">{{ getDictLabel('prepaid_payment', item.prepaidPayment) }}</span>
                                </div>
                                <div class="invoice flex-center" v-if="orderStatus(item) == '已完成'">
                                    <span>发票状态：</span>
                                    <span>{{ getDictLabel('bill_status', item.billStatus) }}</span>
                                    <el-tooltip content="无需开票：预存支付的订单，包括团队预存和个人预存" placement="top">
                                        <el-icon style="margin-left: 5px; vertical-align: middle"><QuestionFilled /></el-icon>
                                    </el-tooltip>
                                </div>
                                <div v-if="item.clientManager">客户经理：{{ item.clientManager || '--' }}({{ item.clientManagerPhoneNumber || '--' }})</div>
                                <div v-if="item.orderDate">下单时间：{{ item.orderDate || '--' }}</div>
                            </div>
                        </div>
                        <div class="button-box flex-center">
                            <div class="custom-button" v-if="pay_order(item)" @click.stop="toPayOrder(item)">立即支付</div>
                            <div class="default-button" v-if="upload_pack(item)" @click.stop="">上传包裹信息</div>
                            <div class="default-button" v-if="cancel_order(item)" @click.stop="">取消订单</div>
                            <div class="default-button" v-if="price_objection(item)" @click.stop="">价格疑异</div>
                            <div class="custom-button" v-if="again_order(item)" @click.stop="">再来一单</div>
                            <div class="default-button" v-if="show_invoice(item)" @click.stop="">查看发票</div>
                            <!-- 弹出确认结果弹框 -->
                            <div class="custom-button" v-if="confirm_result(item)" @click.stop="">
                                <span class="font-mini">下载实验数据</span>
                                <img class="new-icon" src="@/assets/svg/new.svg" alt="">
                            </div>
                            <!-- 直接下载结果 -->
                            <div class="custom-button" v-if="download_result(item)" @click.stop="">
                                <span class="font-mini">下载实验数据</span>
                                <img class="new-icon" src="@/assets/svg/new.svg" alt="">
                            </div>
                            <div class="default-button" v-if="apply_service(item)" @click.stop="">申请售后</div>
                        </div>
                    </div>
                </div>
                <div class="order-box order-box-null flex-center font-middle font-5D5D5D" v-loading="loading" v-else>
                    暂无订单信息...
                </div>
            </el-scrollbar>
        </div>
        <div class="pagination-box">
            <div class="flex-center">
                <el-tooltip effect="dark" :content="`个人累计检测金额： ￥${ total_cost.client } / 团队累计检测金额： ￥${ total_cost.team } `" placement="top">
                    <el-icon><WarningFilled /></el-icon>
                </el-tooltip>
                <span style="margin-left: 5px">累计检测金额： </span>
                <span class="font-FF4A2B">￥{{ total_cost.total }} </span>
            </div>
            <el-pagination
              v-model:current-page="params.pageNum"
              v-model:page-size="params.pageSize"
              :page-sizes="[10, 20, 30, 50]"
              :background="true"
              layout="total, sizes, prev, pager, next"
              :total="total"
            />
        </div>
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
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: flex-start;
    align-content: flex-start;
    width: calc((88vw - 30px) * 0.78 * 0.82);
    min-width: 791px;
    min-height: calc(100vh - 350px);
    padding: 15px;
    .order-card {
        overflow: hidden;
        width: calc((100% - 15px) / 2);
        height: fit-content;
        border-radius: 10px;
        border: 1px solid #cccccc;
        .card-head {
            justify-content: space-between;
            height: 40px;
            padding: 0 10px;
            background-color: #94C9FF30;
            .order-code {
                cursor: pointer;
                column-gap: 5px;
            }
            .order-code:hover {
                color: #94C9FF;
            }
        }
        .card-footer {
            column-gap: 10px;
            justify-content: flex-start;
            padding: 5px 10px;
            background-color: #FFFFFF;
            .img-box {
                width: calc((100% - 15px) / 2 * 0.2);
                min-width: 78px;
                padding: 15px 0;
                background: url('@/assets/img/equipment_background.png');
                background-size: cover;
                background-color: transparent;
                .card-img {
                    width: 100%;
                    height: 100%;
                }
            }
            .order-info {
                min-height: 120px;
                .invoice {
                    justify-content: flex-start;
                }
            }
        }
        .button-box {
            flex-wrap: wrap;
            gap: 15px;
            justify-content: flex-end;
            min-height: 50px;
            padding: 5px 10px;
            background-color: #FFFFFF;
            .custom-button {
                position: relative;
                height: 40px;
                padding: 0 15px;
                font-size: clamp(10px, 0.6vw, 24px);
                .new-icon {
                    position: absolute;
                    top: -50%;
                    right: 0;
                    width: 25%;
                }
            }
            .default-button {
                height: 40px;
                padding: 0 15px;
                font-size: clamp(10px, 0.6vw, 24px);
            }
        }
    }
}
.order-box-null {
    justify-content: center;
    align-content: center;
}

.pagination-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: calc((88vw - 30px) * 0.78);
    min-width: 965px;
    height: 60px;
    padding: 0 15px;
    border-top: 1px solid #cccccc;
}
</style>