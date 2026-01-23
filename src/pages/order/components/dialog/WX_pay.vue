<script setup>
import { queryOrderByOutTradeNo , useCancelOrder , closeByWxOutTradeNo } from "@/api"
import { ElMessage } from "element-plus"
import { nextTick, ref } from "vue"

const props = defineProps(['WX_pay_order'])
const emits = defineEmits(['closeWxPay', 'creatWXPayOrder'])

const show = ref(false)
const get_pay_status = ref(null)

const pay_status = ref({
    tradeStateDesc: "订单未支付",
})

function init() {
    show.value = true
    nextTick(() => {
        get_pay_status.value = setInterval(() => {
            queryOrderByOutTradeNo({orderCode: props.WX_pay_order.orderCode}).then((res) => {
                if(res) {
                    pay_status.value = res.data
                    // 交易状态，枚举值：
                    // SUCCESS：支付成功
                    // REFUND：转入退款
                    // NOTPAY：未支付
                    // CLOSED：已关闭
                    // REVOKED：已撤销（仅付款码支付会返回）
                    // USERPAYING：用户支付中（仅付款码支付会返回）
                    // PAYERROR：支付失败（仅付款码支付会返回）
                    if (pay_status.value.tradeState == "SUCCESS") {
                        ElMessage.success("订单支付成功，请稍后")
                        creatPay()
                    }
                    if (pay_status.value.tradeState == "CLOSED") {
                        ElMessage.error("订单已关闭")
                        clearInterval(get_pay_status.value)
                        //补差价不关闭订单 只关闭弹窗
                        if(props.WX_pay_order.flag){
                            emits("closeWxPay", false)
                        }else{
                            if(props.WX_pay_order.orderId){
                                useCancelOrder({ orderId: props.WX_pay_order.orderId, cancelFlag: 1 }).then(() => {
                                    emits("closeWxPay", true)
                                })
                            }else{
                                ElMessage.success("支付订单已被关闭，请更换支付方式或重新下单")
                            }
                        }
                    }
                }
            })
        }, 1000)
    })
}

function creatPay(){
    clearInterval(get_pay_status.value)
    show.value = false
    emits("creatWXPayOrder")
}

async function canleOrder() {
    clearInterval(get_pay_status.value)
    if(props.WX_pay_order.orderCode){
        await closeByWxOutTradeNo({outTradeNo: props.WX_pay_order.orderCode})
        show.value = false
        emits("closeWxPay", false)
    }else{
        ElMessage.warning("操作过快，请重试")
    }
}

defineExpose({init})
</script>

<template>
    <!-- 微信支付弹窗 -->
    <el-dialog
      v-model="show"
      title="微信扫码支付"
      width="600px"
      :show-close="false"
      center
      append-to-body
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
        <div class="content flex-center-col">
            <div class="qr_text">请使用微信“扫一扫”功能扫描下方二维码进行支付</div>
            <div class="qr_text">
                <span>本次支付金额：</span>
                <span class="font-FF5000 font-600">{{ WX_pay_order.totalCost || '0.00' }}</span>
                <span>元</span>
            </div>
            <div class="qr_text">支付过程中请勿关闭或离开此页面</div>
            <div class="qr_code">
                <img :src="WX_pay_order.barcodeText" alt="" srcset="" />
            </div>
            <div class="order_pay flex-center">
                <div class="order_code">订单编号: {{ WX_pay_order.orderCode }}</div>
                <div class="order_status">支付状态: {{ pay_status.tradeStateDesc || "订单未支付" }}</div>
            </div>
        </div>
        <template #footer>
            <el-button @click="canleOrder">取消支付</el-button>
        </template>
    </el-dialog>
</template>

<style lang='scss' scoped>
.content {
    row-gap: 10px;
    .qr_text {
        color: #8c8c8c;
        line-height: 30px;
    }
    .order_pay {
        column-gap: 15px;
        color: #999999;
        font-size: 12px;
    }
}
</style>