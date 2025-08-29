<script setup>
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';// 引入相对时间插件（用于更友好的描述，如“1天前”）
import { reactive, ref } from 'vue';
import { getUserInfo } from '@/utils/auth';
import { useGetCoupon, useGetMyAssets } from '@/api'
import orderList from './components/order_list.vue'

dayjs.extend(relativeTime);

const coupon_loading = ref(true)
const assets_loading = ref(true)
const carousel_list = ref([])
const user_info = reactive(JSON.parse(getUserInfo()))
const user_assets = ref({})//用户资产数据
//个人优惠券
const user_coupon_data = ref({
    usable: [],//可用优惠券
    used: [],//已使用优惠券
    invalid: [],//失效优惠券
    money: '',//可用优惠券总金额
    number: '',//可用折扣卷张数
})
// 团队优惠券
const team_coupon_data = ref({
    usable: [],//可用优惠券
    used: [],//已使用优惠券
    invalid: [],//失效优惠券
    money: '',//可用优惠券总金额
    number: '',//可用折扣卷张数
})


async function getCoupon() {
    coupon_loading.value = true
    try {
        //获取个人优惠券
        const user_params = {
            businessType: 3,
            business: user_info.clientId,
            pageSize: 1000,
        }
        const res_user = await useGetCoupon(user_params)
        res_user.rows.forEach(item => {
            switch(item.issueStatus) {
                case 2:
                    user_coupon_data.value.usable.push(item)
                    break
                case 3:
                    user_coupon_data.value.used.push(item)
                    break
                case 4:
                    user_coupon_data.value.invalid.push(item)
                    break
            }
        })
        user_coupon_data.value.money = user_coupon_data.value.usable.reduce((sum, item) => {
            if(item.couponMode == 1) {
                return sum += item.deductionAmount
            } else {
                return sum += 0
            }
        }, 0)
        user_coupon_data.value.number = user_coupon_data.value.usable.reduce((sum, item) => {
            if(item.couponMode == 2) {
                return sum += 1
            } else {
                return sum += 0
            }
        }, 0)
        user_coupon_data.value.usable.forEach(item => {
            if(item.validEndDate == '永久有效') {
                item.countdown = '永久有效'
            } else {
                const now = dayjs(); // 当前时间
                const target = dayjs(item.validEndDate); // 目标时间
                const totalMs = target.diff(now);
                const days = Math.floor(totalMs / (24 * 3600000)); // 剩余完整天数
                const remainingMsAfterDays = totalMs % (24 * 3600000); // 扣除天数后的剩余毫秒数
                const hours = Math.floor(remainingMsAfterDays / 3600000); // 剩余完整小时数（不足1小时按0计算）
                item.countdown = `仅剩${days}天${hours}小时`
            }
        })
        // 获取团队优惠券
        if(user_info.teamId) {
            const team_params = {
                businessType: 2,
                business: user_info.teamId,
                pageSize: 1000,
            }
            const res_team = await useGetCoupon(team_params)
            res_team.rows.forEach(item => {
                switch(item.issueStatus) {
                    case 2:
                        team_coupon_data.value.usable.push(item)
                        break
                    case 3:
                        team_coupon_data.value.used.push(item)
                        break
                    case 4:
                        team_coupon_data.value.invalid.push(item)
                        break
                }
            })
            team_coupon_data.value.money = team_coupon_data.value.usable.reduce((sum, item) => {
                if(item.couponMode == 1) {
                    return sum += item.deductionAmount
                } else {
                    return sum += 0
                }
            }, 0)
            team_coupon_data.value.number = team_coupon_data.value.usable.reduce((sum, item) => {
                if(item.couponMode == 2) {
                    return sum += 1
                } else {
                    return sum += 0
                }
            }, 0)
        }
        carousel_list.value = user_coupon_data.value.usable.filter(item => item.couponMode == 1)
        coupon_loading.value = false
    }
    catch(err) {
        console.log(err)
        coupon_loading.value = false
    }
}
getCoupon()

//获取我的资产
async function getMyAssets() {
    assets_loading.value = true
    try {
        const res = await useGetMyAssets(user_info.clientId)
        user_assets.value = res.data
        assets_loading.value = false
    }
    catch(err) {
        console.log(err)
    }
}
getMyAssets()

</script>

<template>
    <div class="user-card flex-center">
        <div class="info-box flex-center">
            <img class="user-avatar" :src="user_info.avatar_path" alt="">
            <div class="info flex-center">
                <div class="font-middle">{{ user_info.clientName }}</div>
                <div>TEL：{{ user_info.phoneNumber }}</div>
                <div class="tips flex-center">
                    <div class="pre-icon flex-center">申请预存</div>
                    <span class="tips-text">申请预存，享测试费、积分等多重壕礼>>></span>
                </div>
            </div>
        </div>
        <div class="coupon-box">
            <div class="box-head flex-center">
                <div class="coupon flex-center" v-loading="coupon_loading">
                    <div>个人优惠券</div>
                    <div class="coupon-data flex-center">
                        <div>
                            <span class="font-FF4A2B font-600">{{ user_coupon_data.money }}</span>
                            <span>元优惠券</span>
                        </div>
                        <div>
                            <span class="font-FF4A2B font-600">{{ user_coupon_data.number }}</span>
                            <span>张折扣券</span>
                        </div>
                    </div>
                </div>
                <div class="coupon flex-center" v-loading="coupon_loading" v-if="user_info.teamId">
                    <div>团队优惠券</div>
                    <div class="coupon-data flex-center">
                        <div>
                            <span class="font-FF4A2B font-600">{{ team_coupon_data.money }}</span>
                            <span>元优惠券</span>
                        </div>
                        <div>
                            <span class="font-FF4A2B font-600">{{ team_coupon_data.number }}</span>
                            <span>张折扣券</span>
                        </div>
                    </div>
                </div>
                <div class="coupon flex-center" v-else>
                    <div>团队优惠券</div>
                    <div class="no-team flex-center">
                        <img style="width: 1rem; margin: 0 5px; " src="@/assets/svg/sad.svg" alt="">
                        <span class="font-5D5D5D">您未入团,加入团队，享团队福利</span>
                    </div>
                </div>
            </div>
            <div class="scroll-box" v-loading="coupon_loading">
                <el-carousel v-if="carousel_list.length" indicator-position="none" arrow="never" height="60px">
                    <el-carousel-item v-for="item in carousel_list" :key="item.couponId">
                        <div class="red-packet-info">
                            <div class="flex-center">
                                <img class="red-packet" src="@/assets/svg/red_packet.svg" alt="">
                                <div>
                                    <div>
                                        <span class="font-FF4A2B font-600">{{ item.deductionAmount }}元</span>
                                        <span>红包待使用</span>
                                    </div>
                                    <div class="font-FF5000">{{ item.countdown }}</div>
                                </div>
                            </div>
                            <div class="custom-button">去使用</div>
                        </div>
                    </el-carousel-item>
                </el-carousel>
            </div>
        </div>
    </div>

    <div class="data-card">
        <el-scrollbar>
            <div class="info-data">
                <div class="info-item">
                    <div class="assets flex-center">
                        <el-tooltip raw-content placement="bottom" :content="`账户余额为：预存余额￥${ user_assets.depositAdvance } + 赠送金￥${ user_assets.cashCouponBalance }<br/>赠送金只能支付订单和补差价，不参与还款、活动等其他福利`">
                            <el-icon><WarningFilled /></el-icon>
                        </el-tooltip>
                        <span style="margin-left: 5px;">账户余额：</span>
                        <span class="font-5CC300 font-600">￥ {{ assets_loading ? '...' : ((user_assets.depositAdvance + user_assets.cashCouponBalance) || 0).toFixed(2) }} </span>
                    </div>
                    <div class="button-box flex-center">
                        <div class="assets-button font-mini custom-button">申请预存</div>
                        <div class="assets-button font-mini default-button">个人预存记录</div>
                    </div>
                </div>
                <div class="info-item">
                    <div class="assets flex-center">
                        <el-tooltip raw-content placement="bottom" content="已开发票但未入账金额">
                            <el-icon><WarningFilled /></el-icon>
                        </el-tooltip>
                        <span style="margin-left: 5px;">待入帐：</span>
                        <span class="font-5CC300 font-600">￥ {{ assets_loading ? '...' : (user_assets.ownDebt || 0).toFixed(2) }} </span>
                    </div>
                    <div class="button-box flex-center">
                        <div class="assets-button font-mini custom-button">上传凭证</div>
                    </div>
                </div>
                <div class="info-item">
                    <div class="assets flex-center">
                        <el-tooltip raw-content placement="bottom" :content="`信用余额为：授信总额￥${ user_assets.lineCredit } - 个人信用欠款￥${ user_assets.toBePaidDebt }`">
                            <el-icon><WarningFilled /></el-icon>
                        </el-tooltip>
                        <span style="margin-left: 5px;">信用余额：</span>
                        <span class="font-5CC300 font-600">￥ {{ assets_loading ? '...' : (user_assets.clientCreditBalance || 0).toFixed(2) }} </span>
                    </div>
                    <div class="button-box flex-center">
                        <div class="assets-button font-mini custom-button">立即还款</div>
                    </div>
                </div>
                <div class="info-item">
                    <div class="assets flex-center">
                        <span style="margin-left: 5px;">待开发票：</span>
                        <span class="font-5CC300 font-600">￥ {{ assets_loading ? '...' : (user_assets.demandInvoiceMoney || 0).toFixed(2) }} </span>
                    </div>
                    <div class="button-box flex-center">
                        <div class="assets-button font-mini custom-button">去开票</div>
                    </div>
                </div>
            </div>
        </el-scrollbar>
            <div class="page-view">
                <div class="view-title flex-center font-600">我的订单</div>
                <div class="view-content">
                    <order-list></order-list>
                </div>
            </div>
    </div>
</template>


<style lang="scss" scoped>
.user-card {
    justify-content: space-between;
    column-gap: 20px;
    padding: 20px 15px;
    width: calc(88vw - 30px);
    min-width: 1238px;
    height: 200px;
    border-radius: 10px;
    background-color: #FFFFFF90;
    .info-box {
        justify-content: flex-start;
        width: fit-content;
        min-width: 557px;
        column-gap: 15px;
        .user-avatar {
            width: 125px;
            height: 125px;
            border-radius: 50%;
        }
        .info {
            flex-direction: column;
            justify-content: space-around;
            align-items: flex-start;
            height: 150px;
            .tips {
                cursor: pointer;
                padding: 10px;
                background-color: #94C9FF30;
                border-radius: 10px;
                .pre-icon {
                    width: 80px;
                    height: 30px;
                    margin-right: 10px;
                    font-size: 80%;
                    font-weight: 600;
                    border-radius: 10px;
                    background-image: linear-gradient(to bottom, #6BECD1, #EDF1AB);
                }
            }
            .tips:hover {
                .tips-text {
                    text-decoration: underline;
                    color: #5CC300;
                }
            }
        }
    }
    .coupon-box {
        min-width: 620px;
        padding: 10px;
        border-radius: 10px;
        background-color: #FFFFFF;
        .box-head {
            column-gap: 20px;
            .coupon {
                flex: 1;
                flex-direction: column;
                row-gap: 10px;
                height: 70px;
                border-radius: 10px;
                background-color: #94C9FF30;
                .coupon-data {
                    column-gap: 30px;
                }
                .no-team:hover {
                    cursor: pointer;
                    text-decoration: underline;
                    text-decoration-color: #5CC300;
                    span {
                        color: #5CC300;
                    }
                }
            }
        }
        .scroll-box {
            cursor: pointer;
            width: 100%;
            height: 60px;
            margin-top: 10px;
            border-radius: 10px;
            background-color: #FFF1EB;
            .red-packet-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 60px;
                padding: 0 10px;
                .red-packet {
                    height: 50px;
                    margin-right: 10px;
                }
                .custom-button {
                    width: 90px;
                    height: 35px;
                }
            }
            
        }
    }
}

.data-card {
    display: flex;
    justify-content: space-between;
    width: calc(88vw - 30px);
    min-width: 1238px;
    height: calc(100vh - 245px);
    margin-top: 15px;
    .info-data {
        width: calc((88vw - 30px) * 0.2);
        min-width: 247px;
        .info-item {
            width: 100%;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 10px;
            background-color: #FFFFFF90;
            .assets {
                cursor: default;
                justify-content: flex-start;
            }
            .button-box {
                flex-wrap: wrap;
                row-gap: 15px;
                justify-content: space-between;
                margin-top: 15px;
                .assets-button {
                    width: 45%;
                    height: 35px;
                }
            }
            
        }
    }
    .page-view {
        width: calc((88vw - 30px) * 0.78);
        min-width: 965px;
        height: calc(100vh - 245px);
        border-radius: 10px;
        background-color: #FFFFFF90;
        .view-title {
            top: 0;
            width: calc((88vw - 30px) * 0.78);
            min-width: 965px;
            height: 45px;
            background-color: #94C9FF80;
            border-radius: 10px 10px 0 0;
        }
        .view-content {
            width: calc((88vw - 30px) * 0.78);
            min-width: 965px;
            height: calc(100vh - 290px);
            border-radius: 0 0 10px 10px;
        }
    }
}
</style>