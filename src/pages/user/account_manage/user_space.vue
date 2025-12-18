<script setup>
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'// 引入相对时间插件（用于更友好的描述，如“1天前”）
import { ElMessageBox, ElMessage } from 'element-plus'
import { reactive, ref, nextTick, onMounted, watch } from 'vue'
import { getUserInfo } from '@/utils/auth'
import { useGetCoupon, useGetMyAssets, useGetDownLoadUrl } from '@/api'
import orderList from '../components/order_list.vue'
import orderDetail from '../components/order_detail.vue'
import applyPrepayment from '../components/apply_prepayment.vue'
import prepaymentLog from '../components/prepayment_log.vue'
import mitt_bus from '@/utils/mitt_bus'
import { useRoute } from 'vue-router'

dayjs.extend(relativeTime);
const route = useRoute()

const coupon_loading = ref(true)
const assets_loading = ref(true)
const download_file_list_dialog = ref(false)
const child_ref = ref(null)//动态改变的子组件的实例
const carousel_list = ref([])//轮播图列表
const user_info = reactive(getUserInfo())//用户信息
const user_assets = ref({})//用户资产数据
const download_file_list = ref([])//下载实验结果列表

//个人中心显示的二级子界面列表
const show_page = [
    { label: '我的订单', component: orderList },
    { label: '订单详情', component: orderDetail },
    { label: '申请预存', component: applyPrepayment },
    { label: '个人预存记录', component: prepaymentLog },
]
const show_page_index = ref(0)//二级子界面的索引
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

watch(
    route,
    (to, from) => {
        switch(to.query.type) {
            case 'applyPrepayment':
                changeShowPage(2)
                break
        }
    },
    {
        deep: true,
        immediate: true,
    }
)

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


//更改显示的二级子界面
function emitChangeShowPage(data) {
    changeShowPage(data.index)
    if (!child_ref.value) return
    nextTick(() => {
        switch(data.component) {
            case 'orderDetail':
                // 检查方法是否存在，避免报错
                if (typeof child_ref.value.getOrderInfo == 'function') {
                    child_ref.value.getOrderInfo(data.order_id)
                } else {
                    console.warn('orderDetail 组件未暴露 getOrderInfo 方法')
                }
                break
        }
    })
}
function changeShowPage(index) {
    if(show_page_index.value == index) {
        return
    } else {
        show_page_index.value = index
        nextTick(() => {
            switch(index) {
                case 2:
                    // 检查方法是否存在，避免报错
                    if (typeof child_ref.value.initHandle == 'function') {
                        child_ref.value.initHandle()
                    } else {
                        console.warn('orderDetail 组件未暴露 initHandle 方法')
                    }
                    break
            }
        })
    }
}

// 下载实验结果
async function downloadResult(data) {
    const get_file_list = data.experimentalDataList.map(item => {
        const obj = {
            key: item.url,
            attname: item.name
        }
        return useGetDownLoadUrl(obj)
    })
    const promise_res = await Promise.all(get_file_list)
    download_file_list.value = promise_res.map(item => {
        return item.msg
    })
    if (download_file_list.value.length == 1) {
        ElMessageBox.confirm(
            '确认是否下载实验数据？',
            '温馨提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        ).then(() => {
            window.open('_blank' ,download_file_list.value[0])
        })
    } else if (download_file_list.value.length > 1) {
        download_file_list_dialog.value = true
    } else {
        ElMessage({
            message: '暂无可下载实验数据！',
            type: 'warning',
        })
    }  
}

//复制实验结果链接
async function copyLink(url) {
    try {
        await navigator.clipboard.writeText(url);
        ElMessage({
            message: '复制成功！',
            type: 'success',
        })
    } catch {
        ElMessage({
            message: '写入剪贴板失败！',
            type: 'warning',
        })
    }
}

function gopage(index) {
    // index对应的页面根据@/pages/user/menu_list.js查看
    mitt_bus.emit('changeUserActiveIndex', index)
}

</script>

<template>
    <div class="user-card flex-center">
        <div class="info-box flex-center">
            <img class="user-avatar" :src="user_info.avatar_path" alt="">
            <div class="info flex-center">
                <div class="font-middle">{{ user_info.clientName }}</div>
                <div>TEL：{{ user_info.phoneNumber }}</div>
                <div class="tips flex-center" @click="changeShowPage(2)">
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
                        <span class="font-mini" style="margin-left: 5px;">账户余额：</span>
                        <span class="font-5CC300 font-600">￥ {{ assets_loading ? '...' : ((user_assets.depositAdvance + user_assets.cashCouponBalance) || 0).toFixed(2) }} </span>
                    </div>
                    <div class="button-box flex-center">
                        <div class="assets-button font-mini custom-button" @click="changeShowPage(2)">申请预存</div>
                        <div class="assets-button font-mini default-button" @click="changeShowPage(3)">个人预存记录</div>
                    </div>
                </div>
                <div class="info-item">
                    <div class="assets flex-center">
                        <el-tooltip raw-content placement="bottom" content="已开发票但未入账金额">
                            <el-icon><WarningFilled /></el-icon>
                        </el-tooltip>
                        <span class="font-mini" style="margin-left: 5px;">待入帐：</span>
                        <span class="font-5CC300 font-600">￥ {{ assets_loading ? '...' : (user_assets.ownDebt || 0).toFixed(2) }} </span>
                    </div>
                    <div class="button-box flex-center">
                        <div class="assets-button font-mini custom-button" @click="gopage('4-2')">上传凭证</div>
                    </div>
                </div>
                <div class="info-item">
                    <div class="assets flex-center">
                        <el-tooltip raw-content placement="bottom" :content="`信用余额为：授信总额￥${ user_assets.lineCredit } - 个人信用欠款￥${ user_assets.toBePaidDebt }`">
                            <el-icon><WarningFilled /></el-icon>
                        </el-tooltip>
                        <span class="font-mini" style="margin-left: 5px;">信用余额：</span>
                        <span class="font-5CC300 font-600">￥ {{ assets_loading ? '...' : (user_assets.clientCreditBalance || 0).toFixed(2) }} </span>
                    </div>
                    <div class="button-box flex-center">
                        <div class="assets-button font-mini custom-button">立即还款</div>
                    </div>
                </div>
                <div class="info-item">
                    <div class="assets flex-center">
                        <span class="font-mini" style="margin-left: 5px;">待开发票：</span>
                        <span class="font-5CC300 font-600">￥ {{ assets_loading ? '...' : (user_assets.demandInvoiceMoney || 0).toFixed(2) }} </span>
                    </div>
                    <div class="button-box flex-center">
                        <div class="assets-button font-mini custom-button">去开票</div>
                    </div>
                </div>
            </div>
        </el-scrollbar>
        <div class="page-view">
            <div class="view-title flex-center font-600">
                <div class="view-back custom-button" v-if="show_page_index" @click="show_page_index = 0">返回</div>
                <div>{{ show_page[show_page_index].label }}</div>
            </div>
            <div class="view-content">
                <component ref="child_ref" :is="show_page[show_page_index].component" @downloadResult="downloadResult" @emitChangeShowPage="emitChangeShowPage"></component>
            </div>
        </div>
    </div>

    <!-- 复制实验结果链接弹框 -->
    <el-dialog title="提示" v-model="download_file_list_dialog" width="40%">
        <div>存在多个实验结果的订单，下载实验数据时，需手动<span style="color: #FF4A2B; font-weight: 600;">点击</span>复制相应数据链接，前往浏览器粘贴打开以下载！</div>
        <div class="file-link" v-for="(item, index) in download_file_list" :key="index" @click="copyLink(item)">{{ item }}</div>
        <div slot:footer class="dialog-footer">
            <el-button @click="download_file_list_dialog = false">关  闭</el-button>
        </div>
    </el-dialog>
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
            position: relative;
            top: 0;
            width: calc((88vw - 30px) * 0.78);
            min-width: 965px;
            height: 45px;
            background-color: #94C9FF80;
            border-radius: 10px 10px 0 0;
            .view-back {
                position: absolute;
                left: 15px;
                width: 60px;
                height: 30px;
                font-weight: normal;
            }
        }
        .view-content {
            width: calc((88vw - 30px) * 0.78);
            min-width: 965px;
            height: calc(100vh - 290px);
            border-radius: 0 0 10px 10px;
        }
    }
}

.file-link {
    cursor: pointer;
    margin-top: 10px;
    padding: 10px;
    text-decoration: underline;
    color: #5D5D5D;
    border: 1px solid #E8E8E8;
}
.file-link:hover {
    color: #5CC300;
}
</style>