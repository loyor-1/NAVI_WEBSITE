<script setup>
import { queryAliOrderByOutTradeNo , useCancelOrder } from "@/api"
import { ElMessage } from "element-plus"
import { nextTick, ref } from "vue"

const props = defineProps(['ZFB_pay_order'])
const emits = defineEmits(['creatALiPayOrder', 'closeALiPayOrder'])

const loading = ref(false)
const show = ref(false)
const get_pay_status = ref(null)

const pay_status = ref({
    tradeStateDesc: "订单未支付",
})

function init(data){
    show.value = true
    nextTick(() => {
        get_pay_status.value = setInterval(() => {
            queryAliOrderByOutTradeNo({orderCode: props.ZFB_pay_order.orderCode}).then(res => {
                if(res) {
                    const data = res.data
                    const subCodeActions = {
                        // 交易不存在
                        'ACQ.TRADE_NOT_EXIST': () =>{
                            pay_status.value.tradeStateDesc = '等待订单创建'
                        },
                        // 无权限使用接口
                        'ACQ.ACCESS_FORBIDDEN': () => {
                            pay_status.value.tradeStateDesc = '支付端接口异常'
                            ElMessage.warning("支付端接口异常，请联系服务商")
                            cancelOrderPay()
                        },
                        // 买家余额不足
                        'ACQ.BUYER_BALANCE_NOT_ENOUGH': () => {
                            pay_status.value.tradeStateDesc = '待支付'
                            ElMessage.warning("买家余额不足")
                        },
                        // 用户银行卡余额不足
                        'ACQ.BUYER_BANKCARD_BALANCE_NOT_E': () => {
                            pay_status.value.tradeStateDesc = '待支付'
                            ElMessage.warning("用户银行卡余额不足")
                        },
                        // 买家状态非法
                        'ACQ.BUYER_ENABLE_STATUS_FORBID': () => {
                             pay_status.value.tradeStateDesc = '订单异常'
                             ElMessage.warning("订单异常，买家状态非法，请联系服务商")
                             cancelOrderPay()
                        },
                        // 买家付款日限额超限
                        'ACQ.BUYER_PAYMENT_AMOUNT_DAY_LIM': () => {
                            pay_status.value.tradeStateDesc = '买家付款日限额超限'
                            ElMessage.warning("买家付款日限额超限")
                        },
                        // 买家付款月额度超限
                        'ACQ.BUYER_PAYMENT_AMOUNT_MONTH_L': () => {
                            pay_status.value.tradeStateDesc = '买家付款月额度超限'
                            ElMessage.warning("买家付款月额度超限")
                        },
                        // 买卖家不能相同
                        'ACQ.BUYER_SELLER_EQUAL': () => {
                            pay_status.value.tradeStateDesc = '订单异常'
                            ElMessage.warning("订单异常，买卖家不能相同，更换买家重新付款")
                            cancelOrderPay()
                        },
                        // 交易信息被篡改
                        'ACQ.CONTEXT_INCONSISTENT': () => {
                            pay_status.value.tradeStateDesc = '订单异常'
                            ElMessage.warning("订单异常，交易信息被篡改，请重新创建支付订单")
                            cancelOrderPay()
                        },
                        // 余额支付功能关闭
                        'ACQ.ERROR_BALANCE_PAYMENT_DISABL': () => {
                            pay_status.value.tradeStateDesc = '待支付'
                            ElMessage.warning("余额支付功能关闭")
                        },
                        // 买家未通过人行认证
                        'ACQ.ERROR_BUYER_CERTIFY_LEVEL_LI': () => {
                            pay_status.value.tradeStateDesc = '订单异常'
                            ElMessage.warning("订单异常，买家未通过人行认证，请联系服务商")
                            cancelOrderPay()
                        },
                        // 订单信息中包含违禁词
                        'ACQ.EXIST_FORBIDDEN_WORD': () => {
                            pay_status.value.tradeStateDesc = '订单异常'
                            ElMessage.warning("订单异常，订单信息中包含违禁词，请联系服务商")
                            cancelOrderPay()
                        },
                        // 无效的签约有效期
                        'ACQ.ILLEGAL_SIGN_VALIDTY_PERIOD': () => {
                            pay_status.value.tradeStateDesc = '订单异常'
                            ElMessage.warning("订单异常，无效的签约有效期，请联系服务商")
                            cancelOrderPay()
                        },
                        // 参数无效
                        'ACQ.INVALID_PARAMETER': () => {
                            pay_status.value.tradeStateDesc = '支付端接口异常'
                            ElMessage.warning("支付端接口异常，请联系服务商")
                            cancelOrderPay()
                        },
                        // 商户协议不存在
                        'ACQ.MERCHANT_AGREEMENT_NOT_EXIST': () => {
                            pay_status.value.tradeStateDesc = '订单异常'
                            ElMessage.warning("订单异常，请联系服务商")
                            cancelOrderPay()
                        },
                        // 没用可用的支付工具
                        'ACQ.NO_PAYMENT_INSTRUMENTS_AVAIL': () => {
                            pay_status.value.tradeStateDesc = '待支付'
                            ElMessage.warning("没用可用的支付工具")
                        },
                        // 应用APP_ID填写错误
                        'ACQ.PARTNER_ERROR': () => {
                            pay_status.value.tradeStateDesc = '支付端接口异常'
                            ElMessage.warning("支付端接口异常，请联系服务商")
                            cancelOrderPay()
                        },
                        // 支付失败
                        'ACQ.PAYMENT_FAIL': () => {
                            pay_status.value.tradeStateDesc = '支付失败'
                            ElMessage.error("支付失败，请重新生成支付订单")
                            cancelOrderPay()
                        },
                        // 支付有风险
                        'ACQ.PAYMENT_REQUEST_HAS_RISK': () => {
                            pay_status.value.tradeStateDesc = '订单异常'
                            ElMessage.warning("订单异常，支付有风险，请更换其它付款方式")
                            cancelOrderPay()
                        },
                        // 当前交易未传入IP信息，创单失败，请传入IP后再发起支付
                        'ACQ.RISK_MERCHANT_IP_NOT_EXIST': () => {
                            pay_status.value.tradeStateDesc = '支付端接口异常'
                            ElMessage.warning("支付端接口异常，请联系服务商")
                            cancelOrderPay()
                        },
                        // 接口返回错误
                        'ACQ.SYSTEM_ERROR': () => {
                            pay_status.value.tradeStateDesc = '支付端接口异常'
                            ElMessage.warning("支付端接口异常，请联系服务商")
                            cancelOrderPay()
                        },
                        // 订单总金额不在允许范围内
                        'ACQ.TOTAL_FEE_EXCEED': () => {
                            pay_status.value.tradeStateDesc = '订单异常'
                            ElMessage.warning("订单异常，订单总金额不在允许范围内，请修改订单金额")
                            cancelOrderPay()
                        },
                        // 交易买家不匹配
                        'ACQ.TRADE_BUYER_NOT_MATCH': () => {
                            pay_status.value.tradeStateDesc = '订单异常'
                            ElMessage.warning("订单异常，交易买家不匹配，请重新创建支付订单")
                            cancelOrderPay(true)
                        },
                        // 交易已经关闭
                        'ACQ.TRADE_HAS_CLOSE': () => {
                            pay_status.value.tradeStateDesc = '交易已经关闭'
                            ElMessage.warning("交易被关闭，请重新生成支付订单")
                            cancelOrderPay(true)
                        },
                        // 交易已被支付
                        'ACQ.TRADE_HAS_SUCCESS': () => {
                            pay_status.value.tradeStateDesc = '交易已被支付'
                            ElMessage.success("交易已被支付,请查看预约单支付状态")
                            cancelOrderPay()
                        },
                    }
                    const tradeStatusActions = {
                        // 交易创建
                        'WAIT_BUYER_PAY': () => {
                            pay_status.value.tradeStateDesc = '待支付'
                        },
                        // 交易关闭
                        'TRADE_CLOSED': () => {
                            pay_status.value.tradeStateDesc = '交易关闭'
                            ElMessage.warning("交易被关闭，请重新生成支付订单")
                            cancelOrderPay(true)
                        },
                        // 交易完结
                        'TRADE_FINISHED': () => {
                            pay_status.value.tradeStateDesc = '交易完结'
                            ElMessage.success("交易完结,请等待预约订单生成")
                            creatOrder()
                        },
                        // 支付成功
                        'TRADE_SUCCESS': () => {
                            pay_status.value.tradeStateDesc = '支付成功'
                            ElMessage.success("支付成功,请等待预约订单生成")
                            creatOrder()
                        },
                    }
                    const subCodeAction = subCodeActions[data.subCode]
                    const tradeStatusAction = tradeStatusActions[data.tradeStatus]
                    if (subCodeAction) subCodeAction()
                    if (tradeStatusAction) tradeStatusAction()
                }
            })
        }, 1000)
    })
}

async function cancelAliPayOrder() {
    //如果从订单列表进来会有orderId 下单正常流程没有orderId 这个时候提示用户更换支付方式活或者去订单列表取消订单
    if(props.ZFB_pay_order.orderId) {
        await useCancelOrder({ orderId: props.ZFB_pay_order.orderId, cancelFlag: 1 })
        show.value = false
        ElMessage.success('订单已取消，请重新下单')
        nextTick(() => {
            emits('closeALiPayOrder', true)
        })
    }else{
        show.value = false
        nextTick(() => {
            emits('closeALiPayOrder', false)
        })
    }
}

 //e true 需要取消订单 false 不需要取消订单 直接关闭弹窗
function cancelOrderPay(e) {
    clearInterval(get_pay_status.value)
    if(e){
        cancelAliPayOrder()
    }else{
        show.value = false
        nextTick(() => {
            emits('closeALiPayOrder', false)
        })
    }
}

function creatOrder() {
    clearInterval(get_pay_status.value)
    show.value = false
    emits('creatALiPayOrder')
}

defineExpose({ show, init })
</script>

<template>
  <!-- 微信支付弹窗 -->
  <el-dialog
    v-model="show"
    title="支付宝扫码支付"
    width="600px"
    @close="cancelOrderPay"
    center
    append-to-body
    :close-on-click-modal="false"
  >
    <!-- <span>{{wxPayInfo.barcodeText}}</span> -->
    <div class="content flex-center-col">
        <div class="qr_text">请使用支付宝“扫一扫”功能扫描下方二维码进行支付</div>
        <div class="qr_text">
            <span>本次支付金额：</span>
            <span class="font-FF5000 font-600">￥ {{ ZFB_pay_order.price || '0.00' }}</span>
            <span>元</span>
        </div>
        <div class="qr_text">支付过程中请勿关闭或离开此页面</div>
        <div class="qr_code">
            <iframe
              :srcdoc="ZFB_pay_order.barcodeText"
              frameborder="no"
              border="0"
              marginwidth="0"
              marginheight="0"
              scrolling="no"
              width="100"
              height="100"
              @load="loading = false"
              style="overflow: hidden"
            >
            </iframe>
            <div v-if="loading" id="loading-indicator">加载中...</div>
        </div>
        <div class="order_pay flex-center">
            <div class="order_code">订单编号: {{ ZFB_pay_order.orderCode }}</div>
            <div class="order_status">支付状态: {{ pay_status.tradeStateDesc }}</div>
        </div>
    </div>
    <template #footer>
        <div class="dialog-footer">
            <el-button @click="cancelOrderPay(true)">取消支付</el-button>
        </div>
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