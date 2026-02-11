<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, onUnmounted, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGetEquipmentInfo, useGetOrderInfo, useGetMyAssets, useGetTeamInfo, useGetFieldGroupList, useGetCoupon, useAddOrder, ZFBPreorderAction, createWXOrder } from '@/api'
import { reduceTotalMoney } from '@/utils/order'
import { getUserInfo } from '@/utils/auth'
import ZFBPay from './components/dialog/ZFB_pay.vue'
import WXPay from './components/dialog/WX_pay.vue'
import mitt_bus from '@/utils/mitt_bus'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const ZFB_pay = ref(null)
const WX_pay = ref(null)

const loading = ref(false)
const coupon_dialog = ref(false)
const success_dialog = ref(false)
const coupon_dialog_loading = ref(false)
const pay_loading = ref(false)
const cash_coupon_disabled = ref(true)//赠送金余额
const user_info = getUserInfo()//用户信息
const order_data = ref({})
const equipment_info = ref({})
const fee_detail = ref([])
const pay_type = ref(undefined)//支付类型
const cash_coupon_balance = ref(null)//赠送金余额
const user_assets = ref({})//用户个人资产
const team_info = ref({})//用户团队信息
const service_threshold = ref(undefined)//优惠券门槛金额
const coupon_list = ref([])//优惠券列表
const ZFB_pay_order = ref(null)//支付宝支付信息
const WX_pay_order = ref(null)//微信支付信息

const type_options = computed(() => {
    const list = [
        { label: '个人', value: 1 }
    ]
    if(user_info.teamId) list.push({ label: '团队', value: 2 })
    return list
})

const pay_data = ref({
    discountType: undefined,//折扣类型
    discountMoney: 0,//折扣金额
    couponType: undefined,//赠送金类型
    cashCoupon: undefined,//赠送金金额
    couponRelevanceId: undefined,//优惠券id
    couponMoney: 0,//优惠券金额
    cashCoupon: undefined,//赠送金
    prepaidPayment: undefined,//支付方式
    originalPrice: undefined,//订单原价
    totalCost: '',//订单总金额
    paymentAudit: undefined,//支付审核
})

//初始化页面数据
async function initPageDate() {
    try {
        loading.value = true
        await getEquipentInfo()
        await getOrderInfo()
        await getMyAssets()
        await getTeamInfo()
        await initFeeDetail()
        if(user_info.teamId) {
            changePayType(2)//初始化默认团队类型支付
        } else {
            changePayType(1)//初始化默认团队类型支付
        }
        loading.value = false
    }
    catch(err) {
        console.log(err)
    }
}
initPageDate()

//获取设备详情
async function getEquipentInfo() {
    try {
        const res = await useGetEquipmentInfo(route.query.equipment_id)
        res.data.quipment_pic = import.meta.env.VITE_FILE_API + res.data.fileList[0].url
        res.data.QRCode_pic = import.meta.env.VITE_FILE_API + res.data.qrCodeFileList[0].url
        equipment_info.value = res.data
    }
    catch(err) {
        console.log(err)
    }
}

//获取订单详情
async function getOrderInfo() {
    if(!route.query.order_id) return
    const res = await useGetOrderInfo(route.query.order_id)
    const data = {
        ...res.data,
        globalFieldValues: res.data.equipmentSubscribe.globalFieldValues,
        groups: res.data.equipmentSubscribe.groups,
    }
    order_data.value = data
    pay_data.value = {
        ...pay_data.value,
        ...data,
    }
}

//获取个人资产
async function getMyAssets() {
    const res = await useGetMyAssets(user_info.clientId)
    user_assets.value = res.data
}

//获取团队信息
async function getTeamInfo() {
    if(!user_info.teamId) return
    const res = await useGetTeamInfo(user_info.teamId)
    pay_data.value.paymentAudit = res.data.paymentAudit
    team_info.value = res.data
}

//初始化费用详情
async function initFeeDetail() {
    let global_detail = []
    let groups_detail = []
    let service_detail = [
        {
            sample_name: '服务费用',
            price: '',
            detail_list: [
                { label: '是否加急', value: '不加急' },
                { label: '是否回收', value: '不回收' },
                { label: '邮寄运费', value: '' },
            ],
        }
    ]
    let discount_detail = [
        {
            sample_name: '优惠费用',
            tips: '(无法抵扣“服务费用” )',
            price: '',
            detail_list: [
                { label: '订单折扣', value: '' },
                { label: '优惠券', value: '' },
                { label: '赠送金', value: '' },
            ],
        }
    ]
    //字段费用
    const new_order_data = JSON.parse(JSON.stringify(order_data.value))
    // show = true  因为计价函数reduceTotalMoney是计算标记了show字段的字段的价格总和，show表示下单时用户选择的字段
    // formulaDetailList 判断有没有字段组计算公式，用于计算字段组价格和回显订单内字段组的价格明细
    for(const item of new_order_data.globalFieldValues) {
        item.show = true
        if(item.fieIdType == 12 && !item.formulaDetailList) {
            try {
                const res = await useGetFieldGroupList(item.fieldGroupId)
                item.reservePointMethod = res.data.reservePointMethod
                item.formulaDetailList = res.data.formulaDetailList
                item.fieldGroupValues.forEach(x => {
                    if(x.fieIdType == 13) {
                        const group_list_x = res.data.fieldGroupRelevanceList.find(z => z.fieIdId == x.fieIdId)
                        x.fieIdValue = group_list_x.basicValue
                    }
                })
            }
            catch(err) {
                console.log(err)
            }
        }
    }
    for(const item of new_order_data.groups) {
        item.fieIdList = []
        for(const i of item.values) {
            const new_i = JSON.parse(JSON.stringify(i))
            new_i.show = true
            if(new_i.fieIdType == 12 && !new_i.formulaDetailList) {
                try {
                    const res = await useGetFieldGroupList(new_i.fieldGroupId)
                    new_i.reservePointMethod = res.data.reservePointMethod
                    new_i.formulaDetailList = res.data.formulaDetailList
                    new_i.fieldGroupValues.forEach(x => {
                        if(x.fieIdType == 13) {
                            const group_list_x = res.data.fieldGroupRelevanceList.find(z => z.fieIdId == x.fieIdId)
                            x.fieIdValue = group_list_x.basicValue
                        }
                    })
                }
                catch(err) {
                    console.log(err)
                }
            }
            item.fieIdList.push(new_i)
        }
    }

    global_detail = reduceTotalMoney(new_order_data, 'global').fee_detail
    groups_detail = reduceTotalMoney(new_order_data, 'groups').fee_detail

    //服务费用
    let price = 0
    if(new_order_data.ifUrgent == 1) {
        const money = new_order_data.originalPrice * 0.5
        price += money
        service_detail[0].detail_list[0].value = `加急(￥${money.toFixed(2)})`
    }
    if(new_order_data.ifRecycle == 1) {
        if(user_info.whiteFlag != 1 || user_info.recoveryFree != 1) {
            if(user_info.unitId == 298) {
                price += 12
                service_detail[0].detail_list[1].value = '回收(￥12)'
            } else {
                price += 50
                service_detail[0].detail_list[1].value = '回收(￥50)'
            }
        } else {
            service_detail[0].detail_list[1].value = '客户优惠(￥0)'
        }
    }
    if(new_order_data.postMethod == 1) {
        if(new_order_data.postPayment == 1) {
            price += 12
            service_detail[0].detail_list[2].value = '运费到付(￥12)'
        } else if(new_order_data.postPayment == 2) {
            service_detail[0].detail_list[2].value = '运费自付(￥0)'
        }
    } else if(new_order_data.postMethod == 2) {
        service_detail[0].detail_list[2].value = '优质客户上门取样(￥0)'
    } else if(new_order_data.postMethod == 3) {
        service_detail[0].detail_list[2].value = '自己送样(￥0)'
    }
    service_detail[0].price = price ? `￥${price.toFixed(2)}` : ''
    
    fee_detail.value = [...global_detail, ...groups_detail, ...service_detail, ...discount_detail]
}

function initFeeDiscountDetail() {
    const discount_detail = {
        sample_name: '优惠费用',
        tips: '(无法抵扣“服务费用” )',
        price: '',
        detail_list: [
            { label: '订单折扣', value: '' },
            { label: '优惠券', value: '' },
            { label: '赠送金', value: '' },
        ],
    }
    // 折扣信息
    if(pay_data.value.discountType == 1) {
        discount_detail.detail_list[0].value = pay_data.value.discountMoney ? `个人折扣${user_assets.value.discountRate}% (-￥${pay_data.value.discountMoney})` : '暂无折扣'
    } else if(pay_data.value.discountType == 2) {
        discount_detail.detail_list[0].value = pay_data.value.discountMoney ? `团队折扣${user_assets.value.discountRateTeam}% (-￥${pay_data.value.discountMoney})` : '暂无折扣'
    } else {
        discount_detail.detail_list[0].value = '折扣与优惠券不可同时使用'
    }
    // 优惠券信息
    if(pay_data.value.couponRelevanceId) {
        const data = coupon_list.value.find(item => item.id == pay_data.value.couponRelevanceId)
        discount_detail.detail_list[1].value = `${data.couponName} (-￥${pay_data.value.couponMoney})`
    } else {
        discount_detail.detail_list[1].value = '未选择/暂无可用优惠券'
    }
    // 赠送金信息
    if(pay_data.value.couponType == 1) {
        discount_detail.detail_list[2].value = pay_data.value.cashCoupon ? `个人赠送金 (-￥${pay_data.value.cashCoupon})` : '未使用/暂无赠送金'
    } else if(pay_data.value.couponType == 2) {
        discount_detail.detail_list[2].value = pay_data.value.cashCoupon ? `团队赠送金 (-￥${pay_data.value.cashCoupon})` : '未使用/暂无赠送金'
    }
    let price = 0
    price = Number(pay_data.value.discountMoney) + Number(pay_data.value.couponMoney) + Number(pay_data.value.cashCoupon)
    discount_detail.price = price ? `-￥${price.toFixed(2)}` : ''
    fee_detail.value[fee_detail.value.length - 1] = discount_detail
}

async function setOrderData(data) {
    loading.value = true
    order_data.value = data
    pay_data.value = {
        ...pay_data.value,
        ...data,
    }
    await initFeeDetail()
    loading.value = false
}

// 更改支付类型
async function changePayType(value) {
    if(pay_type.value == value) return
    pay_type.value = value
    pay_data.value.discountType = value
    pay_data.value.cashCoupon = undefined
    pay_data.value.couponRelevanceId = undefined
    pay_data.value.couponMoney = 0
    pay_data.value.prepaidPayment = undefined
    let discountRate = 0
    switch(value) {
        case 1:
            cash_coupon_balance.value = user_assets.value.cashCouponBalance
            pay_data.value.couponType = 1
            discountRate = user_assets.value.discountRate
            break
        case 2:
            cash_coupon_balance.value = team_info.value.cashCouponBalance
            pay_data.value.couponType = 2
            discountRate = user_assets.value.discountRateTeam
            break
    }
    const rate = (100 - Number(discountRate)) / 100
    pay_data.value.discountMoney = (pay_data.value.originalPrice * rate).toFixed(2)
    service_threshold.value = Number((pay_data.value.originalPrice - pay_data.value.discountMoney).toFixed(2))
    getMoney()
}

//选择支付方式
function changePrepaidPayment(value, disabled) {
    if(pay_data.value.prepaidPayment == value || disabled) return
    pay_data.value.prepaidPayment = value
}

//确认赠送金
function confirmCashCoupon() {
    cash_coupon_disabled.value = true
    getMoney()
}

//计算订单价格
function getMoney() {
    // 计算逻辑：先计算折扣金额，再计算优惠券金额，最后计算赠送金金额

    //可参与优惠计算的部分 reducibleAmount --- 原价-订单折扣
    let reducibleAmount = pay_data.value.originalPrice - pay_data.value.discountMoney
    //不可参与优惠计算的部分 notReducibleAmount 运费+回收+加急
    let notReducibleAmount = 0
    if(order_data.value.ifUrgent == 1) {
        const money = order_data.value.originalPrice * 0.5
        pay_data.value.expeditedProduction = money
        notReducibleAmount += money
    } else {
        pay_data.value.expeditedProduction = 0
    }
    if(order_data.value.ifRecycle == 1 && (user_info.whiteFlag != 1 || user_info.recoveryFree != 1)) {
        if(user_info.unitId == 298) {
            notReducibleAmount += 12
            pay_data.value.sampleRecovery = 12
        } else {
            notReducibleAmount += 50
            pay_data.value.sampleRecovery = 50
        }
    } else {
        pay_data.value.sampleRecovery = 0
    }
    if(order_data.value.postMethod == 1 && order_data.value.postPayment == 1) {
        notReducibleAmount += 12
        pay_data.value.freightCollected = 12
    } else {
        pay_data.value.freightCollected = 0
    }

    //couponMoney --- 优惠券
    let couponMoney = pay_data.value.couponMoney || 0
    //cashCoupon --- 赠送金
    let cashCoupon = pay_data.value.cashCoupon || 0

    // 开始计算价格
    if(reducibleAmount - couponMoney <= 0) {
        pay_data.value.cashCoupon = 0
        reducibleAmount = 0
    } else if(reducibleAmount - couponMoney - cashCoupon <= 0){
        pay_data.value.cashCoupon = Number((reducibleAmount - couponMoney).toFixed(2))
        cashCoupon = Number((reducibleAmount - couponMoney).toFixed(2))
        reducibleAmount = 0
        if(notReducibleAmount) {
            ElMessage.warning('赠送金或优惠券不能抵扣【服务费用】部分金额')
        }
    } else {
        reducibleAmount = Number((reducibleAmount - couponMoney - cashCoupon).toFixed(2))
        pay_data.value.cashCoupon = cashCoupon
    }
    let totalCost = reducibleAmount + notReducibleAmount
    totalCost = Number(totalCost).toFixed(2)
    pay_data.value.totalCost = totalCost
    pay_data.value.couponMoney = couponMoney
    pay_data.value.cashCoupon = cashCoupon
    initFeeDiscountDetail()
}

//打开优惠券弹框
async function openCouponDialog() {
    coupon_dialog.value = true
    coupon_dialog_loading.value = true
    const data = {
        businessType: 1,
        issueStatus: 2,
        pageSize: 1000,
        equipmentId: equipment_info.value.id,
        serviceThreshold: service_threshold.value || 0,
    }
    if(pay_type.value == 1) {
        data.business = user_info.clientId
    } else if(pay_type.value == 2) {
        data.business = user_info.teamId
    }
    const res = await useGetCoupon(data)
    const list = res.rows
    list.forEach(item => item.select = false)
    const index = list.findIndex(item => item.id == pay_data.value.couponRelevanceId)
    if(index >= 0) {
        const data = list[index]
        data.select = true
        list.splice(index, 1)
        list.splice(0, 0, data)
    }
    coupon_list.value = list
    coupon_dialog_loading.value = false
}

//点击优惠券
function clickCoupon(data) {
    coupon_list.value.forEach(item => {
        if(item.id == data.id) {
            item.select = !item.select
        } else {
            item.select = false
        }
    })
}

//确定选择优惠券
function selectCoupon() {
    const data = coupon_list.value.find(item => item.select)
    if(data) {
        pay_data.value.couponRelevanceId = data.id
        // 计算折扣金额
        if(data.clientDiscount == 1) {
            pay_data.value.discountType = undefined
            pay_data.value.discountMoney = undefined 
        } else {
            pay_data.value.discountType = pay_type.value
            let discountRate = 0
            switch(pay_type.value) {
                case 1:
                    discountRate = user_assets.value.discountRate
                    break
                case 2:
                    discountRate = user_assets.value.discountRateTeam
                    break
            }
            const rate = (100 - Number(discountRate)) / 100
            pay_data.value.discountMoney = (pay_data.value.originalPrice * rate).toFixed(2)
        }
        if(data.couponMode == 1) {
            pay_data.value.couponMoney = data.deductionAmount || 0
        }
        if(data.couponMode == 2) {
            const price = Number(pay_data.value.originalPrice) - Number(pay_data.value.discountMoney)
            const rate = (100 - data.couponRate) / 100
            pay_data.value.couponMoney = Math.ceil(price * rate)
        }
    } else {
        pay_data.value.couponMoney = 0
		pay_data.value.couponRelevanceId = undefined
    }
    getMoney()
    coupon_dialog.value = false
}

//确认支付订单
async function payOrder() {
    if(pay_loading.value) return
    pay_loading.value = true
    if(!pay_data.value.prepaidPayment) {
        ElMessage.warning('请选择支付方式！')
        pay_loading.value = false
    } else if(pay_data.value.prepaidPayment == 3) {
        const ZFB_data = {
            subscribeId: pay_data.value.subscribeId,
            price: pay_data.value.totalCost, //单位是元
            goodsName: pay_data.value.equipmentName, //商品描述 取得设备名称
            notifyUrl: import.meta.env.VITE_PAY_API, //回调地址 通知url必须为外网可访问的url，不能携带参数。 公网域名必须为https，如果是走专线接入，使用专线NAT IP或者私有回调域名可使用http
        }
        try {
            const res = await ZFBPreorderAction(ZFB_data)
            ZFB_pay_order.value = {
                barcodeText: res.data.body,
                orderCode: res.data.orderCode,
                orderId: pay_data.value.orderId,//订单ID
                subscribeId: pay_data.value.subscribeId,
                price: pay_data.value.totalCost,
                goodsName: pay_data.value.equipmentName
            }
            ZFB_pay.value.init(ZFB_pay_order.value)
        }
        catch(err) {
            console.log(err)
            pay_loading.value = false
        }
    } else if(pay_data.value.prepaidPayment == 4) {
        const WX_data = {
            subscribeId: pay_data.value.subscribeId,
            totalPrice: pay_data.value.totalCost * 100, //后端金额单位为分 需要乘以100换算为分
            goodsName: pay_data.value.equipmentName, //商品描述 取得设备名称
            notifyUrl: import.meta.env.VITE_PAY_API, //回调地址 通知url必须为外网可访问的url，不能携带参数。 公网域名必须为https，如果是走专线接入，使用专线NAT IP或者私有回调域名可使用http
        }
        try {
            const res = await createWXOrder(WX_data)
            WX_pay_order.value = res.data
            WX_pay_order.value.totalCost = pay_data.value.totalCost
            WX_pay_order.value.orderId = pay_data.value.orderId,
            WX_pay_order.value.subscribeId = pay_data.value.subscribeId
            WX_pay.value.init()
        }
        catch(err) {
            console.log(err)
            pay_loading.value = false
        }
    } else {
        ElMessageBox.confirm(
            '是否确认支付该订单？',
            '温馨提示',
            { type: 'success'},
        ).then(async () => {
            try {
                //status = 2必须在这里重新赋值，因为订单详情里面有同名字段
                pay_data.value.status = 2
                await useAddOrder(pay_data.value)
                success_dialog.value = true
            }
            catch(err) {
                console.log(err)
                pay_loading.value = false
            }
        })
    }
}

//支付宝支付完成创建预约订单
async function creatALiPayOrder() {
    ZFB_pay_order.value = {}
    //status = 2必须在这里重新赋值，因为订单详情里面有同名字段
    pay_data.value.status = 2
    await useAddOrder(pay_data.value)
    success_dialog.value = true
}

//关闭支付宝支付订单
function closeALiPayOrder(e){
    ZFB_pay_order.value = {}
    pay_loading.value = false
    if(e){
        toPage('2-1')
    }
}

//微信支付成功 创建预约订单
async function creatWXPayOrder(){
    WX_pay_order.value = {}
    //status = 2必须在这里重新赋值，因为订单详情里面有同名字段
    pay_data.value.status = 2
    // 其他的直接提交
    await useAddOrder(pay_data.value)
    success_dialog.value = true
}

//关闭微信支付弹窗
function closeWxPay(e){
    WX_pay_order.value = {}
    pay_loading.value = false
    if(e){
        toPage('2-1')
    }
}

function toHomePage() {
    router.push({path: "/"})
}

async function toPage(index, type, prestored_type) {
    // index对应的页面根据@/pages/user/menu_list.js查看
    // type 为所需对应子页面的附加操作
    const data = {index, type, prestored_type}
    await router.push('/user')
    mitt_bus.emit('changeUserActiveIndex', data)
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
                            <div class="radio" :class="{'radio-active': pay_type == item.value}" v-for="item in type_options" :key="item.value" @click="changePayType(item.value)">{{ item.label }}</div>
                        </div>
                    </div>
                </div>
                <div
                  v-show="pay_type == 1"
                  class="payment flex-center"
                  :class="{
                    'select-payment': pay_data.prepaidPayment == 1,
                    'select-disabled': pay_data.totalCost > user_assets.depositAdvance
                  }"
                  @click="changePrepaidPayment(1, pay_data.totalCost > user_assets.depositAdvance)">
                    <img src="@/assets/img/user_prepayment.png" alt="">
                    <div class="payment-detail" :class="{'font-5D5D5D': pay_data.totalCost > user_assets.depositAdvance}">
                        <div class="detail-info flex-center">
                            <span>个人预存</span>
                            <div class="title default-button" @click="toPage('1-1', 'applyPrepayment', 1)">申请预存</div>
                        </div>
                        <div>
                            <span>余额：</span>
                            <span>￥{{ user_assets.depositAdvance }}</span>
                            <span style="margin-left: 5px;" v-if="pay_data.totalCost > user_assets.depositAdvance">余额不足</span>
                        </div>
                    </div>
                </div>
                <div
                  v-show="pay_type == 1"
                  class="payment flex-center" 
                  :class="{
                    'select-payment': pay_data.prepaidPayment == 5,
                    'select-disabled': pay_data.totalCost > user_assets.clientCreditBalance || user_info.certStatus != 1,
                  }"
                  @click="changePrepaidPayment(5, pay_data.totalCost > user_assets.clientCreditBalance || user_info.certStatus != 1)">
                    <img src="@/assets/img/user_credit.png" alt="">
                    <div class="payment-detail" :class="{'font-5D5D5D': pay_data.totalCost > user_assets.clientCreditBalance || user_info.certStatus != 1}">
                        <div class="detail-info flex-center">
                            <span>个人信用</span>
                            <div v-if="user_info.certStatus != 1" class="title default-button" @click="router.push('/user/account_manage/identity_authentication')">身份认证</div>
                        </div>
                        <div v-if="user_info.certStatus != 1">您未进行身份认证，认证通过后可自动获得最高5000额度</div>
                        <div v-else>
                            <span>余额：</span>
                            <span>￥{{ user_assets.clientCreditBalance }}</span>
                            <span v-if="pay_data.totalCost > user_assets.clientCreditBalance">余额不足</span>
                        </div>
                    </div>
                </div>
                <div
                  v-show="pay_type == 2"
                  class="payment flex-center" 
                  :class="{
                    'select-payment': pay_data.prepaidPayment == 2,
                    'select-disabled': pay_data.totalCost > user_assets.depositAdvanceTeam || !user_info.teamId || (team_info.prestoreSwitch && (user_info.characterRole == 3)),
                  }"
                  @click="changePrepaidPayment(2, pay_data.totalCost > user_assets.depositAdvanceTeam || !user_info.teamId || (team_info.prestoreSwitch && (user_info.characterRole == 3)))">
                    <img src="@/assets/img/team_prepayment.png" alt="">
                    <div class="payment-detail" :class="{'font-5D5D5D': pay_data.totalCost > user_assets.depositAdvanceTeam || !user_info.teamId || (team_info.prestoreSwitch && (user_info.characterRole == 3))}">
                        <div class="detail-info flex-center">
                            <span>团队预存</span>
                            <div class="title default-button" @click="toPage('1-1', 'applyPrepayment', 2)">申请预存</div>
                        </div>
                        <div v-if="!user_info.teamId">暂未加入团队</div>
                        <div v-else-if="team_info.prestoreSwitch && (user_info.characterRole == 3)">团长已开启预存限制</div>
                        <div v-else-if="pay_data.totalCost > user_assets.depositAdvanceTeam">余额不足</div>
                    </div>
                </div>
                <div
                  v-show="pay_type == 2"
                  class="payment flex-center" 
                  :class="{
                    'select-payment': pay_data.prepaidPayment == 6,
                    'select-disabled': pay_data.totalCost > user_assets.teamCreditBalance || user_info.certStatus != 1 || !user_info.teamId,
                  }"
                  @click="changePrepaidPayment(6, pay_data.totalCost > user_assets.teamCreditBalance || user_info.certStatus != 1 || !user_info.teamId)">
                    <img src="@/assets/img/team_credit.png" alt="">
                    <div class="payment-detail" :class="{'font-5D5D5D': pay_data.totalCost > user_assets.teamCreditBalance || user_info.certStatus != 1 || !user_info.teamId}">
                        <div class="detail-info flex-center">
                            <span>团队信用</span>
                            <div v-if="user_info.certStatus != 1" class="title default-button" @click="router.push('/user/account_manage/identity_authentication')">身份认证</div>
                        </div>
                        <div v-if="!user_info.teamId">暂未加入团队</div>
                        <div v-else-if="user_info.certStatus != 1">暂未进行身份认证，进行身份认证后才可使用团队信用支付</div>
                        <div v-else-if="pay_data.totalCost > user_assets.teamCreditBalance">余额不足</div>
                    </div>
                </div>
                <div 
                  v-show="pay_type == 1 && [101, 103, 298].some(i => i == user_info.unitId)"
                  class="payment flex-center"
                  :class="{
                    'select-payment': pay_data.prepaidPayment == 4
                  }"
                  @click="changePrepaidPayment(4)">
                    <img src="@/assets/img/WX_payment.png" alt="">
                    <div class="payment-detail">
                        <div class="detail-info flex-center">微信支付</div>
                        <div class="font-5D5D5D">支付成功后如需退款请联系客服</div>
                    </div>
                </div>
                <div
                  v-show="pay_type == 1 && [103].some(i => i == user_info.unitId)"
                  class="payment flex-center"
                  :class="{
                    'select-payment': pay_data.prepaidPayment == 3
                  }"
                  @click="changePrepaidPayment(3)">
                    <img src="@/assets/img/ZFB_payment.png" alt="">
                    <div class="payment-detail">
                        <div class="detail-info flex-center">支付宝支付</div>
                        <div class="font-5D5D5D">支付成功后如需退款请联系客服</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="pay-box fee-box">
            <div class="pay-box-head flex-center">
                <div class="flex-center">
                    <div class="slider"></div>
                    <span class="font-middle font-600">费用详情</span>
                </div>
                <div>
                    <span>订单总价：</span>
                    <span class="font-FF4A2B font-600">￥{{ pay_data.totalCost }}</span>
                </div>
            </div>
            <div class="fee-detail" v-loading="loading">
                <el-scrollbar>
                    <div v-for="(item, index) in fee_detail" :key="index">
                        <div class="detail-box" v-if="item.price">
                            <div class="detail-box-title flex-center">
                                <div>
                                    <span>{{ item.sample_name }}</span>
                                    <span class="font-FF4A2B">{{ item.tips }}</span>
                                </div>
                                <div>
                                    <span>总计：</span>
                                    <span class="font-FF4A2B">{{ item.price }}</span>
                                </div>
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
            <div class="discount-box flex-center">
                <div class="cash-coupon flex-center">
                    <div>
                        <span v-show="pay_type == 1" class="font-mini">个人赠送金余额：</span>
                        <span v-show="pay_type == 2" class="font-mini">团队赠送金余额：</span>
                        <span class="font-5CC300">￥{{ cash_coupon_balance || 0 }}</span>
                    </div>
                    <el-input-number style="width: 250px;" v-model="pay_data.cashCoupon" :disabled="!cash_coupon_balance || cash_coupon_disabled" :min="0" :precision="2" placeholder="请输入赠送金金额" />
                    <div>
                        <el-button type="primary" plain @click="cash_coupon_disabled = false">修改赠送金</el-button>
                        <el-button type="success" plain @click="confirmCashCoupon">确认</el-button>
                    </div>
                </div>
                <div class="button default-button" @click="openCouponDialog">选择优惠券</div>
                <div class="button" :class="[pay_loading ? 'disabled-button' : 'custom-button']" @click="payOrder">确认支付</div>
            </div>
        </div>
    </div>

    <!-- 支付宝支付弹框 -->
    <ZFBPay ref="ZFB_pay" :ZFB_pay_order="ZFB_pay_order" @creatALiPayOrder="creatALiPayOrder" @closeALiPayOrder="closeALiPayOrder"></ZFBPay>

    <!-- 微信支付弹框 -->
    <WXPay ref="WX_pay" :WX_pay_order="WX_pay_order" @creatWXPayOrder="creatWXPayOrder" @closeWxPay="closeWxPay"></WXPay>

    <!-- 优惠券弹框 -->
    <el-dialog
      v-model="coupon_dialog"
      title="我的优惠券"
      width="832"
      :close-on-click-modal="false"
    >
        <div class="coupon-box">
            <div class="coupon-useable flex-center">
                <div class="useable-button flex-center useable-active">可用优惠券</div>
                <div class="useable-button flex-center">不可用优惠券</div>
            </div>
            <div style="width: 800px; height: 365px;">
                <el-scrollbar>
                    <div v-loading="coupon_dialog_loading" class="coupon-list flex-center">
                        <div class="coupon flex-center" v-for="item in coupon_list" :key="item.id" @click="clickCoupon(item)">
                            <div class="select-icon" v-show="item.select">
                                <el-icon class="icon" color="#FF3232"><Select /></el-icon>
                            </div>
                            <div class="coupon-money flex-center-col">
                                <div class="font-FF4A2B font-middle" v-if="item.couponMode == 1">¥ {{ item.deductionAmount }}</div>
                                <div class="font-FF4A2B font-middle" v-if="item.couponMode == 2">{{ item.couponRate / 10 }} 折</div>
                                <div class="font-FF5000 font-mini" v-if="!item.serviceThreshold">无门槛优惠券</div>
                                <div class="font-FF5000 font-mini" v-else>实付满￥{{ item.serviceThreshold }}可用</div>
                            </div>
                            <div class="coupon-info flex-center-col">
                                <div class="multi-line-ellipsis-1 font-middle">{{ item.couponName }}</div>
                                <div class="font-mini" v-if="item.validEndDate == '永久有效'">永久有效</div>
                                <div class="font-mini" v-else>{{ dayjs(item.validStartDate).format('YYYY-MM-DD') }}-{{ dayjs(item.validEndDate).format('YYYY-MM-DD') }}</div>
                                <div class="coupon-tips flex-center">
                                    <span class="multi-line-ellipsis-1 font-mini">{{ item.remark }}</span>
                                    <el-tooltip :content="item.remark"  placement="bottom-end">
                                        <el-icon><QuestionFilled /></el-icon>
                                    </el-tooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-scrollbar>
            </div>
        </div>
        <template #footer>
            <div class="coupon-button flex-center">
                <div class="button-style default-button" @click="coupon_dialog = false">取消</div>
                <div class="button-style custom-button" @click="selectCoupon">确认</div>
            </div>
        </template>
    </el-dialog>

    <!-- 支付成功弹框 -->
    <el-dialog
      v-model="success_dialog"
      title
      width="600px"
      center
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
        <div class="successContent">
            <!-- 2,6团队支付方式判断是否需要审核 -->
            <div v-if="(pay_data.prepaidPayment == 2 || pay_data.prepaidPayment == 6) && pay_data.paymentAudit == 1">
                <div class="successName">预约申请成功</div>
                <div class="desc">恭喜您已经成功提交预约申请，请耐心等待团长或团队管理员审核预约单信息</div>
            </div>
            <div v-else>
                <div class="successName">预约成功</div>
                <div class="desc">恭喜您已经预约成功，请耐心等待技术顾问与您一对一进行沟通</div>
            </div>
            <div class="desc">扫码关注公众号，实时掌握订单进度</div>
            <img class="qrCode" src="https://pstatic.navi-sci.cn/order/gzh_qrCode.jpg" alt="">
        </div>
        <template #footer>
            <div class="footerButton flex-center">
                <el-button type="primary" plain @click="toHomePage">返回首页</el-button>
                <el-button type="primary" @click="toPage('2-1')">查看订单</el-button>
            </div>
        </template>
    </el-dialog>
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
        width: 10vw;
        min-width: 143px;
        height: 10vw;
        min-height: 143px;
        border-radius: 12px;
        background: url('@/assets/img/equipment_background.png');
        background-size: cover;
        background-color: transparent;
        .euipment-img {
            width: 10vw;
            min-width: 143px;
            height: 10vw;
            min-height: 143px;
        }
    }
    .info-box {
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-around;
        width: 25vw;
        min-width: 360px;
        height: 10vw;
        min-height: 143px;
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
        min-width: 143px;
        height: 10vw;
        min-height: 143px;
        .tips-pic {
            width: 8vw;
            min-width: 114px;
            height: 8vw;
            min-height: 114px;
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
        justify-content: space-between;
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
            width: 100%;
            height: 452px;
            padding: 15px;
            .payment {
                cursor: pointer;
                user-select: none;
                column-gap: 10px;
                justify-content: flex-start;
                width: 100%;
                margin-bottom: 10px;
                padding: 15px;
                border: 1px solid #E8E8E8;
                border-radius: 10px;
                img {
                    width: 45px;
                    height: 45px;
                }
                .payment-detail {
                    width: calc(100% - 55px);
                    .detail-info {
                        justify-content: flex-start;
                        .title {
                            margin-left: 15px;
                            padding: 0 15px;
                            font-weight: normal;
                        }
                    }
                }
            }
            .select-payment {
                background-image: url('@/assets/img/payment.png');
                background-position: center;
                background-size: 100% 100%;
                background-repeat: no-repeat;
            }
            .select-disabled {
                background-color: #cccccc;
            }
        }
    }
    .fee-box {
        width: calc(65% - 15px);
    }
    .fee-detail {
        height: 401px;
        padding: 5px;
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
    .discount-box {
        column-gap: 15px;
        width: 100%;
        height: 50px;
        border-radius: 0 0 15px 15px;
        border-top: 1px solid #E8E8E8;
        .cash-coupon {
            column-gap: 15px;
            width: calc(100% - 300px);
            height: 35px;
        }
        .button {
            width: 120px;
            height: 35px;
        }
    }
}

.coupon-box {
    width: 800px;
    height: 400px;
    .coupon-useable {
        width: 800px;
        height: 35px;
        border: 1px solid #E8E8E8;
        .useable-button {
            width: 400px;
            height: 35px;
        }
        .useable-active {
            color: #FFFFFF;
            background-color: #94C9FF;
        }
    }
    .coupon-list {
        flex-wrap: wrap;
        gap: 15px;
        justify-content: flex-start;
        align-content: flex-start;
        width: 800px;
        height: 365px;
        padding: 15px;
        border: 1px solid #E8E8E8;
        border-top: none;
        .coupon {
            cursor: pointer;
            user-select: none;
            position: relative;
            column-gap: 15px;
            width: 376.5px;
            height: 100px;
            background-color: #FF3232;
            border-radius: 10px;
            .select-icon {
                position: absolute;
                top: 1px;
                right: 1px;
                width: 50px;
                height: 50px;
                border: 25px solid #FFFFFF;
                border-bottom: 25px solid transparent;
                border-left: 25px solid transparent;
                border-radius: 0 10px 0 0;
                .icon {
                    position: absolute;
                    top: -18px;
                    right: -18px;
                }
            }
            .coupon-money {
                width: 120px;
                height: 90px;
                background: url(@/assets/img/coupon_bg.png) no-repeat;
                background-size: 120px 90px;
            }
            .coupon-info {
                row-gap: 5px;
                align-items: flex-start;
                width: 232.5px;
                height: 90px;
                color: #FFFFFF;
                .multi-line-ellipsis-1 {
                    width: 220px;
                    text-align: left;
                }
                .coupon-tips {
                    width: 232.5px;
                    justify-content: space-between;
                }
            }
        }
    }
}
.coupon-button {
    justify-content: space-around;
    width: 800px;
    .button-style {
        width: 300px;
        height: 35px;
    }
}

.successContent {
    text-align: center;
    .successName {
        font-size: 24px;
        font-weight: 500;
    }
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
    justify-content: space-around;
    width: 70%;
    margin: 0 auto;
}
</style>