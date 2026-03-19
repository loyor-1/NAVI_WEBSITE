<script setup>
import mitt_bus from '@/utils/mitt_bus'
import financeLog from '../components/finance_log.vue'
import applyPrepayment from '../components/apply_prepayment.vue'
import teamTransferPrepayment from '../components/team_transfer_prepayment.vue'
import { getTeamInfo, getUserInfo } from '@/utils/auth'
import { ref, nextTick } from 'vue'
import { encryptionPhoneNumber } from '@/utils/format'
import { useSendTransferCode, useTransferPrepayment, useGetTeamInfo  } from '@/api'
import { ElMessage } from 'element-plus'

const user_info = getUserInfo()
const team_info = ref({})
const child_ref = ref(null)
const transfer_dialog_dom = ref(null)

const assets_loading = ref(false)
const transfer_loading = ref(false)
const transfer_dialog = ref(false)
const show_page_index = ref(undefined)
const count = ref(60)
const count_timer = ref(null)

//财务中心显示的二级子界面列表
const show_page = [
    { label: '申请预存', component: applyPrepayment },
    { label: '预存划拨', component: teamTransferPrepayment },
    { label: '团队预存使用记录', component: financeLog },
    { label: '团队信用使用记录', component: financeLog },
]
const transfer_data = ref({
    clientId: user_info.clientId,
    teamId: user_info.teamId,
    code: '',
    convertMoney: undefined,
})
const rules = {
    convertMoney: [
        { required: true, message: '请输入转入团队预存金额', trigger: 'blur' },
    ],
    code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
    ]
}

// 刷新团队信息
async function refreshTeamInfo() {
    try {
        assets_loading.value = true
        await getTeamInfo()
        const res = await useGetTeamInfo(user_info.teamId)
        res.data.avatar_path = res.data.teamProFilePhoto ? import.meta.env.VITE_FILE_API + res.data.teamProFilePhoto : ''
        team_info.value = res.data
        assets_loading.value = false
    }
    catch(err) {
        console.log(err)
        assets_loading.value = false
    }
}
refreshTeamInfo()

function changeShowPage(index, type_value) {
    if(show_page_index.value == index) {
        return
    } else {
        show_page_index.value = index
        nextTick(() => {
            switch(index) {
                case 0:
                    if (typeof child_ref.value.initHandle == 'function') {
                        child_ref.value.initHandle()
                        child_ref.value.initPrestoredType(2)
                    } else {
                        console.warn('orderDetail 组件未暴露 initHandle 方法')
                    }
                    break
                case 2:
                case 3:
                    if (typeof child_ref.value.initPage == 'function') {
                        child_ref.value.initPage(user_info.teamId, type_value)
                    } else {
                        console.warn('financeLog 组件未暴露 initPage 方法')
                    }
                    break
            }
        })
    }
}
changeShowPage(2, 1)

// 个人预存转团队
async function getCode() {
    if(count_timer.value) return
    count_timer.value = setInterval(() => {
        if(count.value <= 0) {
            clearInterval(count_timer.value)
            count_timer.value = null
            count.value = 60
        } else {
            count.value -= 1
        }
    }, 1000);
    try {
        const params = {
            phoneNumber: user_info.phoneNumber
        }
        await useSendTransferCode(params)
        ElMessage.success('验证码发送成功！')
    }
    catch(err) {
        console.log(err)
    }
}
function closeTransferDialog() {
    transfer_data.value.code = ''
    transfer_data.value.convertMoney = undefined
}
function commitTransfer() {
    transfer_dialog_dom.value.validate(async valid => {
        if(valid) {
            try {
                transfer_loading.value = true
                await useTransferPrepayment(transfer_data.value)
                transfer_loading.value = false
                transfer_dialog.value = false
                ElMessage.success('预存转入成功！')
            }
            catch(err) {
                console.log(err)
                transfer_loading.value = false
            }
        }
    })
}

//页面跳转
async function gopage(index, type) {
    // index对应的页面根据@/pages/user/menu_list.js查看
    const data = { index, type }
    mitt_bus.emit('changeUserActiveIndex', data)
}
</script>

<template>
<div class="flex-center team-card">
    <div class="flex-center info-box">
        <div class="flex-center" style="border: 1px solid #5D5D5D; border-radius: 50%;">
            <el-image class="team-avatar" :src="team_info.avatar_path">
                <template #error>
                    <img class="team-avatar" src="@/assets/img/avatar.png" alt="">
                </template>
            </el-image>
        </div>
        <div class="flex-center-col info">
            <div>{{ team_info.teamName }}</div>
            <div>团长：{{ team_info.teamHeadName }}</div>
            <div>TEL：{{ team_info.teamHeadPhone }}</div>
        </div>
    </div>
    <div class="flex-center tips-box">
        <div class="flex-center tips">
            <span>团队人数</span>
            <span class="font-5CC300 font-600">{{ team_info.personnelNum || 0 }}</span>
            <span>人</span>
        </div>
        <div class="flex-center tips">
            <span>团队订单</span>
            <span class="font-5CC300 font-600">{{ team_info.orderTeamNumber || 0 }}</span>
            <span>条</span>
        </div>
        <div class="flex-center tips">
            <span>已</span>
            <span class="font-5CC300" v-if="team_info.paymentAudit == 1">开启</span>
            <span class="font-FF5000" v-else>关闭</span>
            <span>支付审核</span>
        </div>
        <div class="flex-center tips">
            <span>已</span>
            <span class="font-5CC300" v-if="team_info.prestoreSwitch == 1">开启</span>
            <span class="font-FF5000" v-else>关闭</span>
            <span>预存限制</span>
        </div>
    </div>
</div>

<div class="data-card">
    <el-scrollbar>
        <div class="info-data">
            <div class="info-item">
                <div class="assets flex-center">
                    <el-tooltip raw-content placement="bottom" :content="`账户余额为：预存余额￥${ team_info.depositAdvance } + 赠送金￥${ team_info.cashCouponBalance }<br/>赠送金只能支付订单和补差价，不参与还款、活动等其他福利`">
                        <el-icon><WarningFilled /></el-icon>
                    </el-tooltip>
                    <span class="font-mini" style="margin-left: 5px;">账户余额：</span>
                    <span class="font-5CC300 font-600">￥ {{ assets_loading ? '...' : ((team_info.depositAdvance + team_info.cashCouponBalance).toFixed(2) || '0.00') }} </span>
                </div>
                <div class="button-box flex-center">
                    <div class="assets-button font-mini custom-button" @click="changeShowPage(0)">申请预存</div>
                    <div class="assets-button font-mini custom-button" @click="transfer_dialog = true">个人预存转团队</div>
                    <div class="assets-button font-mini custom-button" @click="changeShowPage(1)">预存划拨</div>
                    <div class="assets-button font-mini default-button" @click="changeShowPage(2, 1)">预存使用记录</div>
                </div>
            </div>
            <div class="info-item">
                <div class="assets flex-center">
                    <el-tooltip raw-content placement="bottom" content="已开发票但未入账金额">
                        <el-icon><WarningFilled /></el-icon>
                    </el-tooltip>
                    <span class="font-mini" style="margin-left: 5px;">待入帐：</span>
                    <span class="font-5CC300 font-600">￥ {{ assets_loading ? '...' : (team_info.teamOrClientInvoiceDebt || 0).toFixed(2) }} </span>
                </div>
                <div class="button-box flex-center">
                    <div class="assets-button font-mini custom-button" @click="gopage('4-2')">上传凭证</div>
                </div>
            </div>
            <div class="info-item">
                <div class="assets flex-center">
                    <el-tooltip raw-content placement="bottom" :content="`信用余额为：授信总额￥${ team_info.lineCredit } - 团队信用欠款￥${ team_info.toBePaidDebt }`">
                        <el-icon><WarningFilled /></el-icon>
                    </el-tooltip>
                    <span class="font-mini" style="margin-left: 5px;">信用余额：</span>
                    <span class="font-5CC300 font-600">￥ {{ assets_loading ? '...' : (team_info.lineCredit - team_info.toBePaidDebt).toFixed(2) }} </span>
                </div>
                <div class="button-box flex-center">
                    <div class="assets-button font-mini custom-button" @click="gopage('3-4', '立即还款')">立即还款</div>
                    <div class="assets-button font-mini default-button" @click="changeShowPage(3, 2)">信用使用记录</div>
                </div>
            </div>
            <div class="info-item">
                <div class="assets flex-center">
                    <span class="font-mini" style="margin-left: 5px;">团员信用消费：</span>
                    <span class="font-5CC300 font-600">￥ {{ assets_loading ? '...' : (team_info.teamMemberDebtTotal || 0).toFixed(2) }} </span>
                </div>
                <div class="button-box flex-center">
                    <div class="assets-button font-mini custom-button" @click="gopage('3-4', '帮ta还款')">帮ta还款</div>
                </div>
            </div>
            <div class="info-item">
                <div class="assets flex-center">
                    <span class="font-mini" style="margin-left: 5px;">待开发票：</span>
                    <span class="font-5CC300 font-600">￥ {{ assets_loading ? '...' : (team_info.teamCanInvoiceTotal || 0).toFixed(2) }} </span>
                </div>
                <div class="button-box flex-center">
                    <div class="assets-button font-mini custom-button" @click="gopage('3-4', '去开票')">去开票</div>
                </div>
            </div>
        </div>
    </el-scrollbar>
    <div class="page-view">
        <div class="view-title flex-center font-600">
            <div class="view-back custom-button" v-if="show_page_index != 2" @click="changeShowPage(2, 1)">返回</div>
            <div>{{ show_page[show_page_index].label }}</div>
        </div>
        <div class="view-content">
            <component ref="child_ref" :is="show_page[show_page_index].component" :key="show_page_index" @emitChangeShowPage="changeShowPage(2, 1)" @refreshTeamInfo="refreshTeamInfo"></component>
        </div>
    </div>
</div>

<el-dialog v-model="transfer_dialog" title="个人预存转团队" width="500" @close="closeTransferDialog">
    <el-form class="transfer-dialog" ref="transfer_dialog_dom" :model="transfer_data" :rules="rules" label-width="auto">
        <el-form-item label="个人预存">
            <span class="font-FF4A2B">￥{{ user_info.depositAdvance || '0' }}</span>
        </el-form-item>
        <el-form-item label="团队预存">
            <span class="font-FF4A2B">￥{{ team_info.depositAdvance || '0' }}</span>
        </el-form-item>
        <el-form-item label="转入金额" prop="convertMoney">
            <el-input-number v-model="transfer_data.convertMoney" :min="1" :step="10" :precision="2" />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
            <div class="flex-center">
                <el-input class="code-input" v-model="transfer_data.code" placeholder="请输入验证码"/>
                <div class="custom-button code-button" v-show="!count_timer" @click="getCode">获取验证码</div>
                <div class="disabled-button code-button" v-show="count_timer" @click="getCode">{{ count }}秒后再次发送</div>
            </div>
        </el-form-item>
        <el-form-item label=" ">
            <div class="font-5D5D5D font-mini">*为保障您的资金安全，请使用手机号：{{ encryptionPhoneNumber(user_info.phoneNumber) }}进行身份验证</div>
        </el-form-item>
    </el-form>
    <template #footer>
        <div class="dialog-footer">
            <el-button :loading="transfer_loading" @click="transfer_dialog = false">取消</el-button>
            <el-button :loading="transfer_loading" type="primary" @click="commitTransfer">确认</el-button>
        </div>
    </template>
</el-dialog>
</template>

<style lang="scss" scoped>
.team-card {
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
        min-width: 500px;
        column-gap: 15px;
        .team-avatar {
            width: 125px;
            height: 125px;
            border-radius: 50%;
        }
        .info {
            justify-content: space-around;
            align-items: flex-start;
            height: 125px;
        }
    }
    .tips-box {
        flex-wrap: wrap;
        gap: 10px;
        width: 394px;
        .tips {
            cursor: default;
            width: 180px;
            height: 50px;
            border: 1px solid #cccccc;
            border-radius: 5px;
            background-color: #fff;
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
                    width: 48%;
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

.transfer-dialog {
    width: 500px;
    padding: 0 15px;
    .code-input {
        width: 150px;
        text-align: center;
    }
    .code-button {
        width: 150px;
        height: 35px;
        margin-left: 15px;
    }
}

</style>