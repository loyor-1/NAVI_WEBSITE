<script setup>
import { ref, watch } from 'vue'
import { useGetTeamOrderList, useGetOrderInvoice, useGetOrderInfo, useGetDownLoadUrl, useOrderCheck } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { moneyKey, orderStatus } from '@/utils/order'
import { useRoute } from 'vue-router'
import { getTeamInfo } from '@/utils/auth'

const route = useRoute()
const team_info = getTeamInfo()

const loading = ref(false)
const result_dialog = ref(false)
const date_list = ref([])//临时存储下单时间筛选
const order_list = ref([])//订单列表
const total_cost = ref(0)
const total = ref(0)
const status_value = ref(0)
const result_file_list = ref([])//实验结果列表

//订单状态筛选列表
const status_list = [
    { label: '全部订单', value: 0 },
	{ label: '待审核', value: 10 },
	{ label: '待寄样/取样', value: -1 },
	{ label: '已寄样/取样', value: -2},
	{ label: '待实验', value: 4 },
	{ label: '实验中', value: 5 },
	{ label: '待核对', value: 12 },
	{ label: '已取消', value: 8 },
	{ label: '售后/回运', value: -3 },
	{ label: '已完成', value: -4 },
	{ label: '申请开票',  value: 9 },
]
//订单列表接口参数
const params = ref({
    teamId: undefined,
    orderCode: '',
    equipmentName: '',
    clientName: '',
    orderDateBegin: '',
    orderDateEnd: '',
})

watch(
    () => route,
    (to, from) => {
        switch(to.query.type) {
            case 'searchOrder':
                const values = JSON.parse(to.query.values)
                for(let key in values) {
                    params.value[key] = values[key]
                }
                getOrderList()
                break
        }
    },
    {
        deep: true,
        immediate: true,
    }
)

function operate_button(item) {
    const arr = ['待审核']
	return arr.includes(orderStatus(item))
}

function show_invoice(item) {
	const arr = ['已完成']
	return arr.includes(orderStatus(item)) && item.billStatus == 2 && item.prepaidPayment != 1 && item.prepaidPayment != 2
}

function download_result(item) {
	const arr = ['已完成', '回运']
	return arr.includes(orderStatus(item))
}

//获取订单列表
async function getOrderList() {
    loading.value = true
    try {
        const res = await useGetTeamOrderList(params.value)
        res.data.data.list.forEach(item => {
            item.equipment_pic = (item.fileList && item.fileList.length) ? import.meta.env.VITE_FILE_API + item.fileList[0].url : ''
        })
        order_list.value = res.data.data.list
        total_cost.value = res.data.data.teamStat
        total.value = res.data.data.total
        loading.value = false
    }
    catch(err) {
        console.log(err)
        loading.value = false
    }
}

//下单日期筛选
function changeDate(e) {
    params.value.orderDateBegin = e ? e[0] : ''
    params.value.orderDateEnd = e ? e[1] : ''
    getOrderList()
}

//订单状态筛选
async function changeStatus(value) {
    status_value.value = value
    const { orderCode, equipmentName, clientName, orderDateBegin, orderDateEnd } = params.value
    params.value = {
        teamId: team_info.teamId,
        pageNum: 1,
        pageSize: 10,
        orderCode,
        equipmentName,
        clientName,
        orderDateBegin,
        orderDateEnd,
    }
    if(value > 0) {
        params.value.status = value
    } else if(value == 0) {
        params.value.noStatuss = value
    } else {
        switch(value) {
            case -1:
                params.value.customWaitStatus = true
                break
            case -2:
                params.value.customHasStatus = true
                break
            case -3:
                params.value.status = 7
				params.value.customBackStatus = true
                break
            case -4:
                params.value.status = 7
				params.value.noAfterSalesStatus = '1'
				params.value.noRecycleStatus = '2'
                break
        }
    }
    getOrderList()
}
changeStatus(0)

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

// 团队订单审核
function checkOrder(order_id, value) {
    const value_text = value == 2 ? '是否通过该成员的订单申请？' : '是否拒绝该成员的订单申请？'
    ElMessageBox.confirm(value_text, '温馨提示', {type: 'warning'}).then(async () => {
        try {
            const data = {
                orderId: order_id,
				checkStatus: value,
            }
            await useOrderCheck(data)
            ElMessage.success('操作成功！')
            await getOrderList()
        }
        catch(err) {
            console.log(err)
        }
    })
}

//发票预览
async function previewInvoice(data) {
    const params = {
        orderId: data.orderId,
    }
    const res = await useGetOrderInvoice(params)
    const url = import.meta.env.VITE_FILE_API + res.data.invoiceFileList[0].url
    window.open(url, '_blank')
}

// 打开下载实验结果弹框
async function downloadResult(data) {
    try {
        loading.value = true
        const res_order_info = await useGetOrderInfo(data.orderId)
        const file_list = res_order_info.data.experimentalDataList.map(item => {
            const obj = {
                key: item.url,
                attname: item.name
            }
            return useGetDownLoadUrl(obj)
        })
        const res_promise = await Promise.all(file_list)
        loading.value = false
        result_file_list.value = res_promise.map(item => {
            return item.msg
        })
        if (result_file_list.value.length == 1) {
            ElMessageBox.confirm('确认是否下载实验数据？','提示',{type: 'success'}).then(() => {
                window.open(result_file_list.value[0])
            })
        } else if (result_file_list.value.length > 1) {
            result_dialog.value = true
        } else {
            ElMessage.warning("暂无可下载实验数据")
        }
    }
    catch(err) {
        console.log(err)
        loading.value = false
    }
}

async function copyLink(url) {
    try {
        await navigator.clipboard.writeText(url)
        ElMessage.success('复制成功！')
    } catch {
        ElMessage.error('写入剪贴板失败！')
    }
}
</script>

<template>
    <div>
        <!-- 订单列表 -->
        <div class="page-main flex-center">
            <div class="utils-box">
                <div class="search-box flex-center">
                    <!-- 订单号搜索 -->
                    <el-input v-model="params.orderCode" placeholder="请输入订单号">
                        <template #append>
                            <el-button @click="getOrderList">
                                <el-icon><Search /></el-icon>
                            </el-button>
                        </template>
                    </el-input>
                    <!-- 预约设备搜索 -->
                    <el-input v-model="params.equipmentName" placeholder="请输入预约检测设备">
                        <template #append>
                            <el-button @click="getOrderList">
                                <el-icon><Search /></el-icon>
                            </el-button>
                        </template>
                    </el-input>
                    <!-- 申请人 -->
                    <el-input v-model="params.clientName" placeholder="请输入申请人">
                        <template #append>
                            <el-button @click="getOrderList">
                                <el-icon><Search /></el-icon>
                            </el-button>
                        </template>
                    </el-input>
                    <!-- 下单时间筛选 -->
                    <div class="time-box">
                        <el-date-picker v-model="date_list" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" @change="changeDate"/>
                    </div>
                </div>
                <div class="menu-box">
                    <el-scrollbar>
                        <div class="default-button" :class="{'default-button-active': status_value == item.value}" v-for="(item, index) in status_list" :key="index" @click="changeStatus(item.value)"> {{ item.label }} </div>
                    </el-scrollbar>
                </div>
            </div>
            <el-scrollbar>
                <div class="order-box flex-center" v-loading="loading" v-if="order_list.length">
                    <div class="order-card" v-for="item in order_list" :key="item.orderId">
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
                                <div>申请人：{{ item.clientName }}</div>
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
                            <div class="custom-button button-style" v-if="operate_button(item)" @click="checkOrder(item.orderId, 2)">通过</div>
                            <div class="delete-button button-style" v-if="operate_button(item)" @click="checkOrder(item.orderId, 3)">拒绝</div>
                            <div class="default-button button-style" v-if="show_invoice(item)" @click.stop="previewInvoice(item)">查看发票</div>
                            <div class="default-button button-style" v-if="download_result(item)" @click.stop="downloadResult(item)"><span class="font-mini">下载实验数据</span></div>
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
                <span style="margin-left: 5px">累计检测金额： </span>
                <span class="font-FF4A2B">￥{{ total_cost }} </span>
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
    
        <!-- 复制实验结果链接弹框 -->
        <el-dialog title="提示" v-model="result_dialog" width="700px">
            <div class="downloadfile-title">存在多个实验结果的订单，下载实验数据时，需手动<span style="color: #FF4A2B; font-weight: 600;">点击</span>复制相应数据链接，前往浏览器粘贴打开以下载！</div>
            <div class="file-link" v-for="(item, index) in result_file_list" :key="index" @click="copyLink(item)">{{ item }}</div>
            <template #footer>
                <el-button @click="result_dialog = false">关  闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.page-main {
    width: calc(88vw - 30px);
    min-width: 1237px;
    height: calc(100vh - 90px);
    background-color: #FFFFFF90;
    border-radius: 10px;
    border: 1px solid #cccccc;
}

.utils-box {
    width: calc((88vw - 30px) * 0.18);
    min-width: 220px;
    height: calc(100vh - 90px);
    border-right: 1px solid #cccccc;
    .search-box {
        flex-direction: column;
        justify-content: flex-start;
        row-gap: 15px;
        width: calc((88vw - 30px) * 0.18);
        min-width: 220px;
        height: 203px;
        padding: 15px;
        border-bottom: 1px solid #cccccc;
        .time-box :deep(.el-date-editor){
            width: 100%;
            height: 32px;
        }
    }
    .menu-box {
        width: calc((88vw - 30px) * 0.18);
        min-width: 220px;
        height: calc(100vh - 293px);
        padding: 15px 0;
        .default-button {
            width: calc(100% - 30px);
            height: 40px;
            margin: 0 auto 15px;
        }
    }
}

.order-box {
    flex-wrap: wrap;
    gap: 15px;
    justify-content: flex-start;
    align-content: flex-start;
    width: calc((88vw - 35px) * 0.82);
    min-width: 1014px;
    min-height: calc(100vh - 92px);
    padding: 15px;
    .order-box-title {
        position: relative;
        width: 100%;
        .goback-button {
            position: absolute;
            left: 0;
            width: 80px;
            height: 30px;
        }
    }
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
            .button-style {
                height: 40px;
                padding: 0 15px;
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
    width: calc(88vw - 30px);
    min-width: 1237px;
    height: 60px;
    padding: 0 15px;
}
</style>