<script setup>
import { computed, ref, watch, nextTick, getCurrentInstance } from 'vue'
import { useGetOrderList, useGetEquipmentList, useOrderRepayment, useEmailSend, useExportInvoiceResult } from '@/api'
import { getDictLabel } from '@/api/dict'
import { ElMessage } from 'element-plus'
import applyPrepayment from '../components/apply_prepayment.vue'
import { getUserInfo } from '@/utils/auth'
import { useRoute } from 'vue-router'

const instance = getCurrentInstance()
const route = useRoute()

const loading = ref(false)
const ref_apply_invoice = ref(null)
const ref_table = ref(null)
const apply_invoice_switch = ref(false)
const repay_dialog = ref(false)
const repay_loading = ref(false)
const email_dialog = ref(false)
const email_valid = ref(false)
const email_loading = ref(false)
const user_info = getUserInfo()
const operate_index = ref(0)//操作按钮的索引
const payment_data = ref({})//支付方式筛选条件
const equipment_list = ref([])//预约检测设备列表
const equipment_select_loading = ref(false)
const date_list = ref([])//时间筛选
const params = ref({})// 订单列表查询接口上传参数
const order_list = ref([])//订单列表
const total = ref(0)
const select_list = ref([])//勾选的订单
const email = ref('')//接收实验结果的邮箱

//tab栏
const operate_list = [
    { label: '立即还款', desc: '使用预付金额还款存在重复开票行为，此类订单无法开票，如已开票将以废票处理。', index: 0 },
	{ label: '开发票', desc: '个人财务支付的【已完成】订单可索取发票，信用与现金支付不可组合开票，2025年4月前的订单请联系客服开票！', index: 1 },
	{ label: '下载实验结果', desc: '已开通邮箱传送功能！！！小文件将以附件形式发送，大文件将以内嵌下载链接方式传输！', index: 2 },
	{ label: '下载对账单', desc: '处于“已完成”状态的订单可下载对账单，对账单合并下载后将在同一个表格中统计，请按需提交下载。', index: 3 },
]
//支付方式选择框
const payment_list = [
    { label: '全部支付方式', index: 0 },
	{ label: '个人信用', index: 1, value: 5 },
	{ label: '团队信用', index: 2, value: 6 },
	{ label: '微信', index: 3, value: 4 },
	{ label: '支付宝', index: 4, value: 3 },
]
//开票状态选择框
const bill_status_list = [
    { label: '未开票', value: 1 },
    { label: '已开票', value: 2 },
    { label: '无需开票', value: 3 },
]
//立即还款接口数据
const repay_data = ref({
    type: 2,
    orderIds: [],
})

const oprate_button_text = computed(() => {
    let text = ''
    switch(operate_index.value) {
        case 0:
            text = '还款选中订单'
            break
        case 1:
            text = '确认开票'
            break
        case 2:
            text = '确认下载'
            break
        case 3:
            text = '确认下载'
            break
    }
    return text
})

const reduce_data = computed(() => {
    let num = 0
    let string = ''
    switch(operate_index.value) {
        case 0:
            num = select_list.value.reduce((sum, item) => {
                return sum + Number(item.experimentTotalCost)
            }, 0)
            string = select_list.value.length ? `总计：￥${num}` : ''
            break
        case 1:
            num = select_list.value.reduce((sum, item) => {
                return sum + Number(item.experimentTotalCost)
            }, 0)
            string = select_list.value.length ? `总计：￥${num}` : ''
            break
        case 2:
            num = select_list.value.length
            string = num ? `共选中${num}笔订单` : ''
            break
        case 3:
            num = select_list.value.length
            string = num ? `共选中${num}笔订单` : ''
            break
    }
    return string
})

watch(
    () => params.value,
    () => {
        getOrderList()
    },
    { 
        deep: true,
    }
)

watch(
    () => route.query,
    (newValue) => {
        switch(newValue.type) {
            case '立即还款':
                changeOperate(0)
                break
            case '开发票':
                changeOperate(1)
                break
        }
    },
    {
        immediate: true,
        deep: true,
    }
)

//获取订单列表
async function getEquipmentList(e) {
    try {
        equipment_select_loading.value = true
        const params = {
            pageNum: 1,
            pageSize: 20,
            equipmentName: e,
        }
        const res = await useGetEquipmentList(params)
        equipment_list.value = res.rows
        equipment_select_loading.value = false
    }
    catch(err) {
        console.log(err)
        equipment_select_loading.value = false
    }
}

//获取订单列表
async function getOrderList() {
    try {
        loading.value = true
        const res = await useGetOrderList(params.value)
        if(res.data.data.list.length) {
            res.data.data.list.forEach(item => {
	         	item.equipment_pic = (item.fileList && item.fileList.length) ? import.meta.env.VITE_FILE_API + item.fileList[0].url : ''
	        })
        }
        total.value = res.data.data.total
        order_list.value = res.data.data.list
        loading.value = false
    }
    catch(err) {
        console.log(err)
        loading.value = false
    }
}

//更改订单操作tab
async function changeOperate(index) {
    if(loading.value) {
        return
    }
    loading.value = true
    apply_invoice_switch.value = false
    operate_index.value = index
    clearTableCheck()
    switch(index) {
		case 0:
		    // 立即还款
		    params.value = {
		    	pageSize: 20,
		    	pageNum: 1,
		    	status: 7,
		    	paymentStatus: 1,
		    	billStatus: 1,
		    	prepaidPayment: 5
		    }
			break
		case 1:
		    // 开发票
		    params.value = {
		    	pageSize: 20,
		    	pageNum: 1,
		    	status: 7,
		    	billStatus: 1,
		    	noPrepaidPayments: '1,2',
				gteDetectionEndDate: '2025-04-01 00:00:00',
                keyWord: '',
		    }
			break
		case 2:
		    // 下载实验结果
		    params.value = {
		    	pageSize: 20,
		    	pageNum: 1,
		    	statuss: '7,9',
				emailSendFlag: 1,
		    }
			break
		case 3:
		    // 下载对账单
		    params.value = {
		    	pageSize: 20,
		    	pageNum: 1,
		    	statuss: '7,9',
		    	billStatus: 1,
				orderDateBegin: '',
				orderDateEnd: '',
                keyWord: '',
		    }
			break
	}
}
changeOperate(operate_index.value)//初始显示【立即还款】列表

//操作按钮
async function operateButton() {
    if(!select_list.value.length) return
	switch(operate_index.value) {
		case 0:
		    //立即还款
            repay_data.value.orderIds = select_list.value.map(i => i.orderId)
            repay_dialog.value = true
			break
		case 1:
		    //开发票
            const invoice_list = []
	        select_list.value.forEach(item => {
	        	const obj = order_list.value.find(i => i.orderId == item.orderId)
	        	invoice_list.push({
					orderId: obj.orderId,
					prepaidPayment: obj.prepaidPayment,
				})
	        })
            const invoice_amount = select_list.value.reduce((sum, item) => {
                return sum + Number(item.experimentTotalCost)
            }, 0)
            apply_invoice_switch.value = true
            nextTick(() => {
                // 检查方法是否存在，避免报错
                if (typeof ref_apply_invoice.value.initHandle == 'function') {
                    ref_apply_invoice.value.initHandle(1, invoice_list, invoice_amount)
                } else {
                    console.warn('applyPrepayment 组件未暴露 initHandle 方法')
                }
            })
			break
		case 2:
		    //下载实验结果
            email_dialog.value = true
            email.value = user_info.email
            console.log(user_info)
            validateEmail()
			break
		case 3:
		    //下载对账单
            const order_codes = select_list.value.map(i => i.orderCode).join(',')
            const params = {
                orderCodes: order_codes
            }
            const res_export = await useExportInvoiceResult(params)
            await instance.appContext.config.globalProperties.download.name(res_export.msg)
            clearTableCheck()
			break
	}
}

// 设置已选择的订单列表
function selectOrder(e) {
    select_list.value = e
}

// 清空table的勾选
function clearTableCheck() {
    select_list.value = []
    if(ref_table.value) ref_table.value.clearSelection()
}

// 确认还款
async function repay() {
    try {
        repay_loading.value = true
        await useOrderRepayment(repay_data.value)
        repay_loading.value = false
        repay_dialog.value = false
        ElMessage.success('还款成功！')
        clearTableCheck()
        await getOrderList()
    }
    catch {
        repay_loading.value = false
    }
}

//关闭还款弹框
function closeRepayDialog() {
    repay_data.value.orderIds = []
}

//支付方式筛选---开发票时才有
function changePayment(e) {
    clearTableCheck()
    if(e.index) {
        params.value.prepaidPayment = e.value
    } else {
        params.value = {
			pageSize: 20,
			pageNum: 1,
			pageNum_max: 1,
			status: 7,
			billStatus: 1,
			noPrepaidPayments: '1,2',
			gteDetectionEndDate: '2025-04-01 00:00:00'
		}
    }
}

//时间筛选
function changeDate(e) {
    clearTableCheck()
    params.value.orderDateBegin = e ? e[0] : undefined
    params.value.orderDateEnd = e ? e[1] : undefined
}

//开发票后返回【开发票】列表
async function emitChangeShowPage() {
    apply_invoice_switch.value = false
    clearTableCheck()
    await getOrderList()
}

//关闭【下载实验结果】弹框
function closeEmailDialog() {
    email_valid.value = true
}

//校验【邮箱】
function validateEmail() {
    const rule = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/
    email_valid.value = rule.test(email.value)
}

//【发送邮箱】
async function mailSend() {
    validateEmail()
    if(!email_valid.value) return
    try {
        const params = {
            email: email.value,
            orderIds: select_list.value.map(i => i.orderId).join(',')
        }
        email_loading.value = true
        await useEmailSend(params)
        email_dialog.value = false
        email_loading.value = false
        clearTableCheck()
        ElMessage.success('发送邮箱成功！')
    }
    catch(err) {
        console.log(err)
        email_loading.value = false
    }
}
</script>

<template>
    <div class="page-main flex-center">
        <div class="menu-box">
            <div class="operate-box">
                <div class="default-button" :class="{'active-button': item.index == operate_index}" v-for="item in operate_list" :key="item.index" @click="changeOperate(item.index)">{{ item.label }}</div>
            </div>
            <div class="search-box">
                <el-scrollbar>
                    <div class="search-box-content flex-center-col">
                        <!-- 支付方式筛选 -->
                        <el-select v-show="operate_index == 1" v-model="payment_data" placeholder="选择支付方式" @change="changePayment">
                            <el-option v-for="item in payment_list" :key="item.index" :label="item.label" :value="item"/>
                        </el-select>
                        <!-- 预约检测设备筛选 -->
                        <el-select 
                          v-show="[1, 3].includes(operate_index)" 
                          v-model="params.keyWord" 
                          :remote-method="getEquipmentList"
                          :loading="equipment_select_loading"
                          filterable
                          clearable
                          remote
                          placeholder="选择预约检测设备"
                        >
                            <el-option v-for="item in equipment_list" :key="item.id" :label="item.equipmentName" :value="item.equipmentName"/>
                        </el-select>
                        <!-- 下单时间筛选 -->
                        <div class="time-box" v-show="[1, 3].includes(operate_index)">
                            <el-date-picker v-model="date_list" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" @change="changeDate"/>
                        </div>
                        <!-- 开票状态筛选 -->
                        <el-select v-show="[3].includes(operate_index)" v-model="params.billStatus" placeholder="选择开票状态">
                            <el-option v-for="item in bill_status_list" :key="item.value" :label="item.label" :value="item.value"/>
                        </el-select>
                    </div>
                </el-scrollbar>
            </div>
            <div class="oprate-button" :class="[select_list.length ? 'custom-button' : 'disabled-button']" @click="operateButton">{{ oprate_button_text }}</div>
        </div>
        <div class="list">
            <div class="desc flex-center">{{ operate_list[operate_index].desc }}</div>
            <div class="invoice-box" v-loading="loading" v-if="order_list.length">
                <el-table 
                  class="invoice-table"
                  v-if="!apply_invoice_switch"
                  ref="ref_table" 
                  height="calc(100vh - 160px)" 
                  border 
                  :header-cell-style="{backgroundColor: '#94C9FF30', height: '60px'}" 
                  :data="order_list" 
                  @selection-change="selectOrder"
                >
                    <el-table-column type="selection" width="55" align="center"></el-table-column>
                    <el-table-column label="设备" width="140" align="center">
                        <template #default="scope">
                            <img class="equipment_pic" :src="scope.row.equipment_pic" alt="">
                        </template>
                    </el-table-column>
                    <el-table-column label="订单号" prop="orderCode" width="160" align="center"></el-table-column>
                    <el-table-column label="预约检测名称" prop="equipmentName" width="240" align="center"></el-table-column>
                    <el-table-column label="样品总数" prop="sampleNumber" width="100" align="center"></el-table-column>
                    <el-table-column label="检测金额（元）" width="120" align="center">
                        <template #default="scope">
                            <span>￥ {{ scope.row.experimentTotalCost }} </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="支付方式" prop="equipmentName" width="100" align="center">
                        <template #default="scope">
                            {{ getDictLabel('prepaid_payment', scope.row.prepaidPayment) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="下单时间" prop="orderDate" width="180" align="center"></el-table-column>
                    <el-table-column label="完成时间" prop="finishOrderDate" width="180" align="center"></el-table-column>
                    <el-table-column label="订单备注" prop="customRemark" min-width="180" align="center" :formatter="(row) => row.customRemark || '--'"></el-table-column>
                </el-table>
                <div class="pagination-box flex-center" v-if="!apply_invoice_switch">
                    <div class="font-FF4A2B">{{ reduce_data }}</div>
                    <el-pagination
                      v-model:current-page="params.pageNum"
                      v-model:page-size="params.pageSize"
                      :page-sizes="[20, 30, 40, 50]"
                      :background="true"
                      layout="total, sizes, prev, pager, next"
                      :total="total"
                    />
                </div>
                <div class="page-view" v-if="apply_invoice_switch">
                    <div class="view-title flex-center font-600">
                        <div class="view-back custom-button" @click="apply_invoice_switch = false">返回</div>
                        <div>申请开票</div>
                    </div>
                    <div class="view-content">
                        <applyPrepayment ref="ref_apply_invoice" @emitChangeShowPage="emitChangeShowPage"></applyPrepayment>
                    </div>
                </div>
            </div>
            <div class="invoice-box invoice-box-null flex-center font-middle font-5D5D5D" v-loading="loading" v-else>暂无发票信息...</div>
        </div>
    </div>

    <!-- 立即还款弹框 -->
    <el-dialog v-model="repay_dialog" title="温馨提示" width="650px" :close-on-click-modal="false" @closed="closeRepayDialog">
        <div>
            <span>您即将使用</span>
            <span class="font-5CC300">预存支付</span>
            <span>所勾选订单金额</span>
            <span class="font-FF4A2B">{{ reduce_data }}元</span>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="repay_dialog = false">取 消</el-button>
                <el-button type="primary" :loading="repay_loading" @click="repay">确 定</el-button>
            </span>
        </template>
    </el-dialog>
     <!-- 实验结果发送邮箱 -->
    <el-dialog title="温馨提示" v-model="email_dialog" width="650px" :close-on-click-modal="false" @closed="closeEmailDialog">
        <el-input :class="{'validate-false': !email_valid}" placeholder="请输入用以接收实验结果的邮箱" v-model="email" @blur="validateEmail">
            <template #prepend>邮箱地址</template>
        </el-input>
        <div style="color: #FF4A2B; height: 20px;"> {{ !email_valid ? '邮箱格式错误' : '' }} </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="email_dialog = false">取 消</el-button>
                <el-button type="primary" :loading="email_loading" :disabled="!email_valid || !email" @click="mailSend">确 定</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style lang="scss" scoped>
.page-main {
    width: calc(88vw - 30px);
    min-width: 1237px;
    height: calc(100vh - 30px);
    background-color: #FFFFFF90;
    border-radius: 10px;
    border: 1px solid #cccccc;
}

.menu-box {
    width: calc((88vw - 30px) * 0.2);
    min-width: 247px;
    height: calc(100vh - 30px);
    border-right: 1px solid #cccccc;
    .operate-box {
        height: 200px;
        .default-button {
            height: 50px;
            border-radius: 0;
            border: none;
            border-top: 1px solid #cccccc;
        }
        .default-button:first-child {
            border-radius: 10px 0 0 0;
        }
        .default-button:last-child {
            border-bottom: 1px solid #cccccc;
        }
        .active-button {
            background-color: #94C9FF;
        }
    }
    .search-box {
        height: calc(100% - 260px);
        padding: 15px;
        .search-box-content {
            row-gap: 15px;
            .time-box :deep(.el-date-editor){
                width: 100%;
            }
        }
    }
    .oprate-button {
        height: 60px;
        border-radius: 0 0 0 10px;
        border-top: 1px solid #cccccc;
        border-bottom: 1px solid #cccccc;
    }
}

.list {
    width: calc((88vw - 30px) * 0.8);
    min-width: 989px;
    height: calc(100vh - 30px);
    padding: 10px;
    .desc {
        width: calc((88vw - 30px) * 0.8 - 20px);
        min-width: 969px;
        height: 50px;
        background-color: #FF4A2B30;
    }
    .invoice-box {
        width: calc((88vw - 30px) * 0.8 - 20px);
        min-width: 969px;
        height: calc(100vh - 100px);
        .invoice-table {
            width: 100%;
            .equipment_pic {
                width: 100px;
                height: 100px;
            }
        }
        .pagination-box {
            justify-content: space-between;
            width: 100%;
            height: 60px;
            padding: 0 15px;
        }
        .page-view {
            width: calc((88vw - 30px) * 0.8 - 20px);
            min-width: 969px;
            height: calc(100vh - 100px);
            border-radius: 0 0 10px 10px;
            background-color: #FFFFFF90;
            .view-title {
                position: relative;
                top: 0;
                width: calc((88vw - 30px) * 0.8 - 20px);
                min-width: 969px;
                height: 45px;
                background-color: #94C9FF80;
                .view-back {
                    position: absolute;
                    left: 15px;
                    width: 60px;
                    height: 30px;
                    font-weight: normal;
                }
            }
            .view-content {
                width: calc((88vw - 30px) * 0.8 - 20px);
                min-width: 969px;
                height: calc(100vh - 145px);
                border-radius: 0 0 10px 10px;
            }
        }
    }
    .invoice-box-null {
        justify-content: center;
        align-content: center;
        height: calc(100% - 70px);
    }
}

.validate-false {
    border: 1px solid #FF4A2B;
    border-radius: 5px;
}
</style>