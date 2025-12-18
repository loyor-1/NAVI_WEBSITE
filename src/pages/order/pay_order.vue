<script setup>
import { ref, onUnmounted, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGetEquipmentInfo, useGetOrderInfo } from '@/api'
import mitt_bus from '@/utils/mitt_bus'

const route = useRoute()

const loading = ref(false)
const order_data = ref({})
const equipment_info = ref({})
const pay_type = ref(2)

const type_options = [
    { label: '个人', value: 1 },
    { label: '团队', value: 2 },
]

const pay_data = ref({
    prepaidPayment: undefined,//支付方式
})

//获取订单详情
async function getOrderInfo(order_id) {
    const res = await useGetOrderInfo(order_id)
    order_data.value = res.data.equipmentSubscribe
}

//获取设备详情
async function getEquipentInfo() {
    try {
        // loading.value = true
        const res = await useGetEquipmentInfo(route.query.equipment_id)
        res.data.quipment_pic = import.meta.env.VITE_FILE_API + res.data.fileList[0].url
        res.data.QRCode_pic = import.meta.env.VITE_FILE_API + res.data.qrCodeFileList[0].url
        equipment_info.value = res.data
    }
    catch(err) {
        console.log(err)
    }
}
getEquipentInfo()

async function setOrderData(data) {
    if(data.from == 'appoint_data') {
        order_data.value = data.data
    } else if(data.from == 'order_list') {
       await getOrderInfo(data.data)
    }
    loading.value = false
}

// 更改支付类型
function changeType(value) {
    if(pay_type.value == value) return
    pay_type.value = value
    pay_data.value.prepaidPayment = undefined
}
//选择支付方式
function changePrepaidPayment(value) {
    if(pay_data.value.prepaidPayment == value) return
    pay_data.value.prepaidPayment = value
}

onMounted(() => {
    mitt_bus.on('payOrder', setOrderData)
})

onUnmounted(() => {
    mitt_bus.off('payOrder')
})
</script>

<template>
    <div class="euipment-box flex-center">
        <div class="img-box flex-center">
            <el-image class="euipment-img" :src="equipment_info.quipment_pic">
                <template #error>
                    <img class="fail-pic" src="@/assets/img/fail_pic.png" />
                </template>
            </el-image>
        </div>
        <div class="info-box flex-center" v-loading="loading">
            <div class="font-middle font-600 font-5CC300">支付：{{ equipment_info.equipmentName }}</div>
            <div class="info-item flex-center">
                <span class="item-title">设备型号</span>
                <span class="font-5D5D5D">{{ equipment_info.equipmentModel }}</span>
            </div>
            <div class="info-item flex-center">
                <span class="item-title">预约次数</span>
                <span class="font-5D5D5D">{{ equipment_info.testsNumber }}次</span>
            </div>
            <div class="info-item flex-center">
                <span class="item-title">服务周期</span>
                <span class="font-5D5D5D">收到样品后平均{{ equipment_info.serviceDays }}个工作日完成</span>
            </div>
            <div class="info-item flex-center">
                <span class="item-title">实验员</span>
                <span class="font-5D5D5D">{{ equipment_info.testerName }}</span>
            </div>
        </div>
        <div style="flex: 1"></div>
        <div class="tips flex-center">
            <el-image class="tips-pic" :src="equipment_info.QRCode_pic">
                <template #error>
                    <img class="fail-pic" src="@/assets/img/fail_pic.png" alt="">
                </template>
             </el-image>
            <div class="multi-line-ellipsis-1 font-mini">{{ equipment_info.technicalAdvisorTextPrompts }}</div>
        </div>
    </div>

    <div class="pay flex-center">
        <div class="pay-box">
            <div class="pay-box-head flex-center">
                <div class="flex-center">
                    <div class="slider"></div>
                    <span class="font-middle font-600">支付方式</span>
                </div>
            </div>
            <div class="pay-box-content" v-loading="loading">
                <div class="fieId-style">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span>支付类型</span>
                        </div>
                        <div class="fieId-content">
                            <div class="radio" :class="{'radio-active': pay_type == item.value}" v-for="item in type_options" :key="item.value" @click="changeType(item.value)">{{ item.label }}</div>
                        </div>
                    </div>
                </div>
                <div class="payment flex-center" :class="{'select-payment': pay_data.prepaidPayment == 1}" v-show="pay_type == 1" @click="changePrepaidPayment(1)">
                    <img src="@/assets/img/user_prepayment.png" alt="">
                    <span class="font-middle">个人预存</span>
                </div>
                <div class="payment flex-center" :class="{'select-payment': pay_data.prepaidPayment == 5}" v-show="pay_type == 1" @click="changePrepaidPayment(5)">
                    <img src="@/assets/img/user_credit.png" alt="">
                    <span class="font-middle">个人信用</span>
                </div>
                <div class="payment flex-center" :class="{'select-payment': pay_data.prepaidPayment == 2}" v-show="pay_type == 2" @click="changePrepaidPayment(2)">
                    <img src="@/assets/img/team_prepayment.png" alt="">
                    <span class="font-middle">团队预存</span>
                </div>
                <div class="payment flex-center" :class="{'select-payment': pay_data.prepaidPayment == 6}" v-show="pay_type == 2" @click="changePrepaidPayment(6)">
                    <img src="@/assets/img/team_credit.png" alt="">
                    <span class="font-middle">团队信用</span>
                </div>
                <div class="payment flex-center" :class="{'select-payment': pay_data.prepaidPayment == 4}" @click="changePrepaidPayment(4)">
                    <img src="@/assets/img/WX_payment.png" alt="">
                    <span class="font-middle">微信支付</span>
                </div>
                <div class="payment flex-center" :class="{'select-payment': pay_data.prepaidPayment == 3}" @click="changePrepaidPayment(3)">
                    <img src="@/assets/img/ZFB_payment.png" alt="">
                    <span class="font-middle">支付宝支付</span>
                </div>
            </div>
        </div>
        <div class="fee-detail">
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
    </div>
</template>

<style lang="scss" scoped>
.multi-line-ellipsis-1 {
    text-align: center;
}

.euipment-box {
    justify-content: space-between;
    column-gap: 15px;
    width: 80vw;
    min-width: 1440px;
    margin: 10px auto 0;
    padding: 15px;
    border-radius: 10px;
    background-color: #FFFFFF;
    .img-box {
        width: 12vw;
        min-width: 172px;
        height: 12vw;
        min-height: 172px;
        border-radius: 12px;
        background: url('@/assets/img/equipment_background.png');
        background-size: cover;
        background-color: transparent;
        .euipment-img {
            width: 12vw;
            min-width: 172px;
            height: 12vw;
            min-height: 172px;
        }
    }
    .info-box {
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-around;
        width: 25vw;
        min-width: 360px;
        height: 12vw;
        min-height: 172px;
        padding: 0 15px;
        .info-item {
            justify-content: flex-start;
            width: 100%;
            .item-title {
                width: 30%;
            }
        }
    }
    .tips {
        flex-direction: column;
        justify-content: space-around;
        width: 10vw;
        min-width: 144px;
        height: 11vw;
        min-height: 158px;
        .tips-pic {
            width: 10vw;
            min-width: 144px;
            height: 10vw;
            min-height: 144px;
            border: 1px solid #E8E8E8;
            border-radius: 10px;
            background-color: #11111150;
        }
    }
}

.fieId-label {
    width: 30% !important;
}
.fieId-content {
    width: 70% !important;
}
.radio {
    min-width: 140px;
}

.pay {
    column-gap: 15px;
    align-items: stretch;
    width: 80vw;
    min-width: 1440px;
    margin: 10px auto 0;
    .pay-box-head {
        justify-content: flex-start;
        padding: 15px;
        border-radius: 15px 15px 0 0;
        background-color: #94C9FF80;
        .slider {
            width: 10px;
            height: 2rem;
            margin-right: 5px;
            background-color: #94C9FF;
        }
    }
    .pay-box {
        width: 35%;
        border-radius: 15px;
        background-color: #FFFFFF;
        .pay-box-content {
            padding: 15px;
            .payment {
                column-gap: 10px;
                justify-content: flex-start;
                margin-bottom: 10px;
                padding: 15px;
                border: 1px solid #E8E8E8;
                border-radius: 10px;
                img {
                    width: 45px;
                    height: 45px;
                }
            }
            .select-payment {
                background-image: url('@/assets/img/payment.png');
                background-position: center;
                background-size: 100% 100%;
                background-repeat: no-repeat;
            }
        }
    }
    .fee-detail {
        height: calc(75% - 15px);
        padding: 5px;
        border: 1px solid #cccccc;
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
    }
}
</style>