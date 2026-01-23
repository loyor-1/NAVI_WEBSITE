<script setup>
import ZFBPay from '@/pages/order/components/dialog/ZFB_pay.vue'
import WXPay from '@/pages/order/components/dialog/WX_pay.vue'
import { useFinishOrder, useMakeUpMoneyWx, useMakeUpMoneyAli, useEditOrderMoney } from "@/api"
import { ref } from "vue"
import { ElMessage } from 'element-plus'

const emits = defineEmits(['openEvaluation'])

const ZFB_pay = ref(null)
const WX_pay = ref(null)

const show = ref(false)
const pay_loading = ref(false)
const WX_pay_order = ref(null)
const ZFB_pay_order = ref(null)
const form = ref({})

function init(info) {
    form.value = { ...info }
    show.value = true
}

async function creatOrder() {
    let totalPrice = form.value.experimentTotalCost - form.value.totalCost
    WX_pay_order.value = null
    const data = {
        orderId: form.value.orderId,
        totalCost: totalPrice,
    }
    await useEditOrderMoney(data)
    show.value = false
    emits('openEvaluation', form.value)
}

async function creatALiPayOrder() {
    let totalPrice = form.value.experimentTotalCost - form.value.totalCost
    ZFB_pay_order.value = null
    const data = {
        orderId: form.value.orderId,
        totalCost: totalPrice,
    }
    await useEditOrderMoney(data)
    show.value = false
    emits('openEvaluation', form.value)
}

function closeWxPay() {
    WX_pay_order.value = {}
    pay_loading.value = false
}

function closeALiPayOrder() {
    ZFB_pay_order.value = {}
    pay_loading.value = false
}

//前往支付
async function toPayHandle() {
    pay_loading.value = true
    if (form.value.experimentTotalCost - form.value.totalCost > 0) {
        let totalPrice = form.value.experimentTotalCost - form.value.totalCost
        if (form.value.prepaidPayment == 3) {
            let orderInfo = {
                detectionCode: form.value.detectionCode,
                price: totalPrice, //单位是元
                goodsName: form.value.equipmentName, //商品描述 取得设备名称
                notifyUrl: import.meta.env.VITE_PAY_API //回调地址 通知url必须为外网可访问的url，不能携带参数。 公网域名必须为https，如果是走专线接入，使用专线NAT IP或者私有回调域名可使用http
            }
            const res_ZFB = await useMakeUpMoneyAli(orderInfo)
            ZFB_pay_order.value = {
                barcodeText: res_ZFB.data.body,
                orderCode: res_ZFB.data.orderCode,
                orderId: form.value.orderId,
                subscribeId: form.value.subscribeId,
                price: totalPrice,
                flag: true, //是否是补差价
                goodsName: form.value.equipmentName
            }
            ZFB_pay.value.init(ZFB_pay_order.value)
        } else {
            let orderInfo = {
                detectionCode: form.value.detectionCode,
                totalPrice: totalPrice * 100, //后端金额单位为分 需要乘以100换算为分
                goodsName: form.value.equipmentName, //商品描述 取得设备名称
                notifyUrl: import.meta.env.VITE_PAY_API //回调地址 通知url必须为外网可访问的url，不能携带参数。 公网域名必须为https，如果是走专线接入，使用专线NAT IP或者私有回调域名可使用http
            }
            const res_WX = await useMakeUpMoneyWx(orderInfo)
            WX_pay_order.value = res_WX.data
            WX_pay_order.value.totalCost = totalPrice
            WX_pay_order.value.flag = true
            WX_pay_order.value.subscribeId = form.value.subscribeId
            WX_pay.value.init()
        }
    } else {
        const data = {
            orderId: form.value.orderId
        }
        await useFinishOrder(data)
        ElMessage.success('操作成功')
        pay_loading.value = false
        show.value = false
        emits('openEvaluation', form.value)
    }
}

//确认结果
async function submitHandle() {
    pay_loading.value = true
    const data = {
        orderId: form.value.orderId
    }
    try {
        await useFinishOrder(data)
        pay_loading.value = false
        show.value = false
        ElMessage.success('操作成功')
        emits('openEvaluation', form.value)
    }
    catch(err) {
        console.log(err)
        pay_loading.value = false
    }
}

defineExpose({ init })
</script>

<template>
    <el-dialog v-model="show" title="确认结果" width="500px" :close-on-click-modal="false" :close-on-press-escape="false">
        <div class="descicon"></div>
        <span class="font-600">请确认实际检测费用</span>
        <el-descriptions :column="3" id="goods_details" style="margin-top: 10px;margin-left: 20px">
            <el-descriptions-item label="支付方式" span="3">{{ getDictLabel('prepaid_payment', form.prepaidPayment) }}</el-descriptions-item>
            <el-descriptions-item label="原支付金额" span="3">¥{{ form.totalCost }}</el-descriptions-item>
            <el-descriptions-item label="实际检测金额" span="3">¥{{ form.experimentTotalCost }}</el-descriptions-item>
        </el-descriptions>
        <div style="margin-bottom: 10px;">
            <div class="descicon"></div>
            <span class="font-600">注意事项</span>
        </div>
        <el-descriptions :column="3" id="goods_details" style="margin-left: 13px"> 
            <el-descriptions-item span="3" v-if="form.totalCost != form.experimentTotalCost">
                <div v-if="form.totalCost < form.experimentTotalCost">
                    <span v-if="form.prepaidPayment != 3 && form.prepaidPayment != 4">
                        <span>确认后将从</span>
                        <span class="font-FF5000">{{ getDictLabel('prepaid_payment', form.prepaidPayment) }}</span>中
                        <span class="font-FF5000">扣除差价</span>
                    </span>
                    <span v-else>
                        <span class="font-FF5000">补充支付差价后</span>完成订单确认
                    </span>
                </div>
                <div v-if="form.totalCost > form.experimentTotalCost">
                    <span v-if="form.prepaidPayment != 3 && form.prepaidPayment != 4">
                        <span>确认后将按照支付方式</span>
                        <span class="font-FF5000">原路退回差价</span>
                    </span>
                    <span v-else>
                        <span>确认后差价将</span>
                        <span class="font-FF5000">退回至个人预存款中</span>
                    </span>
                </div>
            </el-descriptions-item>
            <el-descriptions-item span="3">
                <span>请先确认结果，</span>
                <span class="font-FF5000">才能下载实验数据</span>
            </el-descriptions-item>
            <el-descriptions-item span="3">
                <span>确认结果后，平台仅为您保存为期<span style="color: #FF4A2B;">180天</span>的实验数据，请及时下载！</span>
            </el-descriptions-item>
        </el-descriptions>
        <template #footer>
            <el-button v-if="(form.prepaidPayment == 3 || form.prepaidPayment == 4) && form.totalCost < form.experimentTotalCost" type="primary" :loading="pay_loading" @click="toPayHandle()">前往支付</el-button>
            <el-button v-else type="primary" :loading="pay_loading" @click="submitHandle()">确认结果并下载实验数据</el-button>
            <el-button :loading="pay_loading" plain @click="show = false">返回</el-button>
        </template>
        
        <!-- 支付宝支付弹框 -->
        <ZFBPay ref="ZFB_pay" :ZFB_pay_order="ZFB_pay_order" @creatALiPayOrder="creatALiPayOrder" @closeALiPayOrder="closeALiPayOrder"></ZFBPay>
        <!-- 微信支付弹框 -->
        <WXPay ref="WX_pay" :WX_pay_order="WX_pay_order" @creatWXPayOrder="creatOrder" @closeWxPay="closeWxPay"></WXPay>
    </el-dialog>
</template>

<style lang="scss" scoped>
.descicon {
  width: 5px;
  height: 17px;
  margin-top: 3px;
  margin-right: 5px;
  float: left;
  background: #4d6ffe;
}
</style>

