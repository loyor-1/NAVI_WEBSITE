<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'


const props = defineProps(['appoint_data'])
const router = useRouter()

const show = ref(false)

function showAppointSuccess() {
    show.value = true
}

function toIndex() {
    router.push({
        path: "/home_page"
    })
}

function toGoods() {
    router.push({
        path: "/user/order_manage/user_order_list",
    })
}

defineExpose({showAppointSuccess})
</script>

<template>
    <el-dialog
      v-model="show"
      title="预约成功"
      width="600px"
      center
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
        <div class="successContent">
            <!-- 2,6团队支付方式判断是否需要审核 -->
            <div class="desc" v-if="(props.appoint_data.prepaidPayment == 2 || props.appoint_data.prepaidPayment == 6) && props.appoint_data.paymentAudit == 1">恭喜您已经成功提交预约申请，请耐心等待团长或团队管理员审核预约单信息</div>
            <div class="desc" v-else>恭喜您已经预约成功，请耐心等待技术顾问与您一对一进行沟通</div>
            <div class="desc">扫码关注公众号，实时掌握订单进度</div>
            <img class="qrCode" src="https://pstatic.navi-sci.cn/order/gzh_qrCode.jpg" alt="">
        </div>
        <template #footer>
            <div class="footerButton">
                <div class="button default-button" @click="toIndex">返回首页</div>
                <div class="button custom-button" @click="toGoods">查看订单</div>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped lang="scss">
.successContent {
    text-align: center;
    .desc {
        margin: 10px 0;
    }
    .qrCode {
        width: 300px;
        height: 300px;
        border: 1px solid #E8E8E8;
    }
}
.footerButton {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-around;
    .button {
        padding: 10px 25px;        
    }
}
</style>