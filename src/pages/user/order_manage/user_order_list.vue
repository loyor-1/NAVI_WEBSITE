<script setup>
import uploadImage from '@/components/upload_image.vue'
import confirmResult from '@/pages/user/components/confirm_result.vue'
import evaluation from "@/pages/user/components/evaluation.vue"
import afterSale from '@/pages/user/components/after_sale.vue'
import { ref, reactive, watch } from 'vue'
import { useGetOrderList, useUploadPackage, useCancelOrder, useAfterSale, useGetOrderInvoice, useGetOrderInfo, useGetDownLoadUrl } from '@/api'
import { moneyKey, orderStatus } from '@/utils/order'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

const upload_image = ref(null)
const package_form = ref(null)
const confirm_result_dom = ref(null)
const evaluation_dom = ref(null)
const after_sale_dom = ref(null)

const loading = ref(false)
const package_dialog = ref(false)
const package_loading = ref(false)
const result_dialog = ref(false)
const total = ref(0)
const status_value = ref(0)
const order_list = ref([])//订单列表
const result_file_list = ref([])//实验结果下载链接 列表

//订单列表接口参数
const prepaid_payment = ref(999)//临时存储支付方式
const date_list = ref([])//临时存储下单时间筛选
const params = ref({
    pageNum: 1,
    pageSize: 10,
    orderCode: '',
    equipmentName: '',
    orderDateBegin: '',
    orderDateEnd: '',
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
    { label: "全部", value: 999 },
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
//上传包裹接口参数
const package_data = ref({
    orderId: undefined,
    packageTransportDocument: '',
    packageTransportList: []
})
const package_rules = ref({
    packageTransportDocument: [
        { required: true, trigger: "blur", message: "请输入包裹运单号" }
    ]
})

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
getOrderList()

//支付方式筛选
function changePrepaidPayment(e) {
    params.value.prepaidPayment = e == 999 ? '' : e
    getOrderList()
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
    const { orderCode, equipmentName, orderDateBegin, orderDateEnd, prepaidPayment } = params.value
    params.value = {
        pageNum: 1,
        pageSize: 10,
        orderCode,
        equipmentName,
        orderDateBegin,
        orderDateEnd,
        prepaidPayment,
    }
    if(value > 0) {
        params.value.status = value
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

// 前往支付订单
function toPayOrder(data) {
    router.push({
        path: '/pay_order',
        query: {
            equipment_id: data.subEquipmentId,
            order_id: data.orderId,
        }
    })
}

//打开上传包裹信息弹框
function uploadPackage(data) {
    package_data.value.orderId = data.orderId
    package_dialog.value = true
}

//关闭上传包裹信息弹框
function closePackageDialog() {
    package_form.value.resetFields()
    upload_image.value.cleanList()
}

//上传包裹照片
function updatePackageTransport(list) {
    package_data.value.packageTransportList = list
}

// 确认上传包裹
function submitPackage() {
    package_form.value.validate(async valid => {
        if(valid) {
            try {
                package_loading.value = true
                await useUploadPackage(package_data.value)
                package_dialog.value = false
                package_loading.value = false
                ElMessage.success('包裹信息上传成功！')
                await getOrderList()
            }
            catch(err) {
                console.log(err)
                package_loading.value = false
            }
        }
    })
}

//取消订单
function cancelOrder(data) {
    ElMessageBox.confirm('是否确认取消该订单？', '温馨提示', { type: 'warning' }).then(async () => {
        try {
            loading.value = true
            const cancel_data = {
                orderId: data.orderId
            }
            await useCancelOrder(cancel_data)
            await getOrderList()
            ElMessage.success('取消订单成功！')
        }
        catch(err) {
            console.log(err)
            loading.value = false
        }
    })
}

//价格疑异
function priceIssue(data) {
    ElMessageBox.confirm('是否确认提交价格疑异？', '温馨提示', { type: 'warning' }).then(async () => {
        try {
            loading.value = true
            const price_issue_data = {
                orderId: data.orderId,
                afterSalesDesc: '价格疑异',
            }
            await useAfterSale(price_issue_data)
            await getOrderList()
            ElMessage.success('提交价格疑异成功！')
        }
        catch(err) {
            console.log(err)
            loading.value = false
        }
    })
}

//再来一单
function againOrder(data) {
    router.push({
        path: '/appoint_order',
        query: {
            type: 'again',
            order_id: data.orderId,
            equipment_id: data.subEquipmentId
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

// 确认结果
function confirmOrderResult(data) {
    confirm_result_dom.value.init(data)
}

//打开评价弹框
function openEvaluation(data) {
    evaluation_dom.value.init(data)
}

// 关闭评价弹框
function closeEvaluation() {
    getOrderList()
    downloadResult()
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

// 申请售后
function openApplyServiceDialog(data) {
    const after_sale_data = {
        orderId: data.orderId,
        afterSalesDesc: '',
    }
    after_sale_dom.value.init(after_sale_data)
}
</script>

<template>
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
                <!-- 支付方式筛选 -->
                <el-select v-model="prepaid_payment" placeholder="选择支付方式" @change="changePrepaidPayment">
                    <el-option v-for="item in payment_list" :key="item.value" :label="item.label" :value="item.value"/>
                </el-select>
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
            <div class="order-box" v-loading="loading" v-if="order_list.length">
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
                        <div class="default-button" v-if="upload_pack(item)" @click.stop="uploadPackage(item)">上传包裹信息</div>
                        <div class="default-button" v-if="cancel_order(item)" @click.stop="cancelOrder(item)">取消订单</div>
                        <div class="default-button" v-if="price_objection(item)" @click.stop="priceIssue(item)">价格疑异</div>
                        <div class="custom-button" v-if="again_order(item)" @click.stop="againOrder(item)">再来一单</div>
                        <div class="default-button" v-if="show_invoice(item)" @click.stop="previewInvoice(item)">查看发票</div>
                        <!-- 弹出确认结果弹框 -->
                        <div class="custom-button" v-if="confirm_result(item)" @click.stop="confirmOrderResult(item)">
                            <span class="font-mini">下载实验数据</span>
                            <img class="new-icon" src="@/assets/svg/new.svg" alt="">
                        </div>
                        <!-- 直接下载结果 -->
                        <div class="custom-button" v-if="download_result(item)" @click.stop="downloadResult(item)">
                            <span class="font-mini">下载实验数据</span>
                            <img class="new-icon" src="@/assets/svg/new.svg" alt="">
                        </div>
                        <div class="default-button" v-if="apply_service(item)" @click.stop="openApplyServiceDialog(item)">申请售后</div>
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

    <!-- 上传包裹信息 -->
    <el-dialog
      v-model="package_dialog"
      title="上传包裹信息"
      width="700px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="closePackageDialog"
    >
        <el-form ref="package_form" :model="package_data" :rules="package_rules" label-width="120px">
            <el-form-item label="包裹运单号" prop="packageTransportDocument">
                <el-input v-model="package_data.packageTransportDocument" placeholder="请输入包裹运单号"></el-input>
            </el-form-item>
            <el-form-item label="包裹照片" prop="packageTransportList">
                <uploadImage ref="upload_image" :limit="3" @updateValue="updatePackageTransport"></uploadImage>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button :loading="package_loading" type="primary" plain @click="package_dialog = false">取消</el-button>
            <el-button :loading="package_loading" type="primary" @click="submitPackage">提交</el-button>
        </template>
    </el-dialog>
    <!-- 复制实验结果链接弹框 -->
    <el-dialog title="提示" v-model="result_dialog" width="700px">
        <div class="downloadfile-title">存在多个实验结果的订单，下载实验数据时，需手动<span style="color: #FF4A2B; font-weight: 600;">点击</span>复制相应数据链接，前往浏览器粘贴打开以下载！</div>
        <div class="file-link" v-for="(item, index) in result_file_list" :key="index" @click="copyLink(item)">{{ item }}</div>
        <template #footer>
            <el-button @click="result_dialog = false">关  闭</el-button>
        </template>
    </el-dialog>
    <!-- 确认结果弹框 -->
    <confirmResult ref="confirm_result_dom" @openEvaluation="openEvaluation"></confirmResult>
    <!-- 确认评价 -->
    <evaluation ref="evaluation_dom" @close="closeEvaluation"></evaluation>
    <!-- 提交售后弹框 -->
    <afterSale ref="after_sale_dom" @refresh="getOrderList"></afterSale>
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
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: flex-start;
    align-content: flex-start;
    width: calc((88vw - 30px) * 0.82 - 2px);
    min-width: 1014px;
    min-height: calc(100vh - 90px);
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
                    top: -35%;
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
    width: calc(88vw - 30px);
    min-width: 1237px;
    height: 60px;
    padding: 0 15px;
}
</style>