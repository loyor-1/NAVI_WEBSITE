<script setup>
import dayjs from 'dayjs'
import mitt_bus from '@/utils/mitt_bus'
import { getTeamInfo, getUserInfo } from '@/utils/auth'
import { onMounted, ref } from 'vue'
import { useGetCheckTeamList, useOrderCheck, useGetTeamMemberList, useControlTeamAuditFlag, useTransferTeam, useSetAdministrator, useRemoveTeam, useGetApplyJoinTeamList, useCheckJoinTeam, useDissolveTeam, useGetTeamInfo } from '@/api'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import editTeam from './edit_team.vue'

defineOptions({
    name: 'team_space'
})

const user_info = ref(getUserInfo())
const team_info = ref({})
const router = useRouter()
const user_store = useUserStore()

const edit_team_dom = ref(null)

const edit_team = ref(false)
const check_team_list_loading = ref(false)
const check_team_total = ref(0)
const active_pane = ref('first')
const check_team_list = ref([])
const check_team_list_total = ref(0)
const team_member_list_loading = ref(false)
const team_member_list = ref([])
const team_member_list_total = ref(0)
const join_team_list_loading = ref(false)
const join_team_list = ref([])
const join_team_list_total = ref(0)

const check_team_list_params = ref({
    pageNum: 1,
    pageSize: 15,
    teamId: undefined,
    queryType: 15,
})
const team_member_list_params = ref({
    pageNum: 1,
    pageSize: 10,
    teamId: undefined,
})
const join_team_list_params = ref({
    pageNum: 1,
    pageSize: 10,
    teamId: undefined,
})

onMounted(() => {
    initPage()
})

//初始化页面
async function initPage() {
    if(user_info.value.teamId) {
        await refreshTeamInfo()
        check_team_list_params.value.teamId = team_info.value.teamId
        team_member_list_params.value.teamId = team_info.value.teamId
        join_team_list_params.value.teamId = team_info.value.teamId
        await getTeamMemberList()
        if(team_info.value.clientCharacterRole != 3) {
            await getCheckTeamList()
            await getApplyJoinTeamList()
        }
    } else {
        edit_team.value = true
        edit_team_dom.value.initTitle('创建团队')
    }
}

//获取团队 审核/待审核 订单列表
async function getCheckTeamList() {
    check_team_list_loading.value = true
    check_team_list.value = []
    try {
        const res = await useGetCheckTeamList(check_team_list_params.value)
        check_team_list.value = res.rows
        check_team_list_total.value = res.total
        if(active_pane.value == 'first') check_team_total.value = res.total
        check_team_list_loading.value = false
    }
    catch(err) {
        console.log(err)
        check_team_list_loading.value = false
    }
}

//更改 审核/待审核 状态
function changePane(value) {
    check_team_list_params.value.queryType = value == 'first' ? 15 : 16
    getCheckTeamList()
}

//前往对应订单
async function toOrderList(row) {
    const values = JSON.stringify({
        orderCode: row.orderCode,
    })
    const data = {
        index: '3-3',
        type: 'searchOrder',
        values,
    }
    await router.push('/user')
    mitt_bus.emit('changeUserActiveIndex', data)
}

//订单审核
function orderCheckHandle(row, type) {
    const type_value = type == 2 ? '同意' : '拒绝'
    ElMessageBox.prompt(`该笔订单实付款￥${row.totalCost || 0}元，请选择是否${type_value}该笔订单，并填写审核备注！`,  '订单审核').then(async ({ value }) => {
        const data = {
            orderId: row.orderId,
            checkStatus: type,
            checkRemark: value,
        }
        try {
            await useOrderCheck(data)
            ElMessage.success('操作成功！')
            await getCheckTeamList()
        }
        catch(err) {
            console.log(err)
        }
    })
}

//查看订单审核备注
function showCheckRemark(row) {
    ElMessageBox.alert(row.checkRemark, '审核备注')
}

// 获取团员列表
async function getTeamMemberList() {
    team_member_list_loading.value = true
    try {
        const res = await useGetTeamMemberList(team_member_list_params.value)
        res.rows.forEach(item => {
            item.edit = false
            item.teamAuditFlag_new = item.teamAuditFlag >= team_info.value.freePay ? item.teamAuditFlag : team_info.value.freePay
        })
        team_member_list.value = res.rows
        team_member_list_total.value = res.total
        team_member_list_loading.value = false
    }
    catch(err) {
        console.log(err)
        team_member_list_loading.value = false
    }
}

//修改特定人员免审核额度
async function setTeamAuditFlag(row, index) {
    if(row.teamAuditFlag_new < team_info.value.freePay) {
        ElMessage.error('个人免审核金额不能小于团队免审核金额')
		team_member_list.value[index].teamAuditFlag_new = team_member_list.value[index].teamAuditFlag >= team_info.value.freePay ? team_member_list.value[index].teamAuditFlag : team_info.value.freePay
		return
	}
	if(row.teamAuditFlag_new > 10000) {
        ElMessage.error('免审核金额为1-10000元')
		team_member_list.value[index].teamAuditFlag_new = team_member_list.value[index].teamAuditFlag >= team_info.value.freePay ? team_member_list.value[index].teamAuditFlag : team_info.value.freePay
		return
	}
    try {
        const data = {
	    	clientId: row.clientId,
	    	teamAuditFlag: Number(row.teamAuditFlag_new),
	    }
        await useControlTeamAuditFlag(data)
		ElMessage.success('修改成功！')
        team_member_list.value[index].edit = false
    }
    catch(err) {
        console.log(err)
        team_member_list.value[index].teamAuditFlag_new = team_member_list.value[index].teamAuditFlag >= team_info.value.freePay ? team_member_list.value[index].teamAuditFlag : team_info.value.freePay
        team_member_list.value[index].edit = false
    }
}

//转让团长
function transferTeam(row) {
    ElMessageBox.confirm('是否确认将团长转移出去？', '温馨提示', { type: 'warning'}).then(async () => {
        try {
            const data = {
                teamId: team_info.value.teamId,
                teamHeadId: row.clientId,
                teamHeadName: row.clientName,
                teamHeadPhone: row.phoneNumber,
                teamHeadEmail: row.email,
            }
            await useTransferTeam(data)
            ElMessageBox.confirm(
                '团长转让成功，请重新登录！',
                '温馨提示',
                { 
                    type: 'success',
                    showCancelButton: false,
                    showClose: false,
                    closeOnClickModal: false,
                    closeOnPressEscape: false,
                }
            ).then(() => {
                user_store.logout()
            })
        }
        catch(err) {
            console.log(err)
        }
    })
}

//设置管理员  2 设置为管理员  3 取消管理员
function setRole(row, value) {
    const value_text = value == 2 ? '是否确认设置该成员为管理员？' : '是否取消该成员管理员权限？'
    ElMessageBox.confirm(value_text, '温馨提示', { type: 'warning'}).then(async () => {
        try {
            const data = {
                clientId: row.clientId,
                teamId: row.teamId,
                characterRole: value,
            }
            await useSetAdministrator(data)
            ElMessage.success('操作成功！')
            await getTeamMemberList()
        }
        catch(err) {
            console.log(err)
        }
    })
}

// 移出团队
function removeTeam(row) {
    ElMessageBox.confirm('是否确认将该成员移出团队？', '温馨提示', { type: 'warning'}).then(async () => {
        try {
            const data = {
                clientId: row.clientId,
            }
            await useRemoveTeam(data)
            ElMessage.success('操作成功！')
            await getTeamMemberList()
        }
        catch(err) {
            console.log(err)
        }
    })
}

//获取申请入团列表
async function getApplyJoinTeamList() {
    join_team_list_loading.value = true
    try {
        const res = await useGetApplyJoinTeamList(join_team_list_params.value)
        
        join_team_list.value = res.rows
        join_team_list_total.value = res.total
        join_team_list_loading.value = false
    }
    catch(err) {
        console.log(err)
        join_team_list_loading.value = false
    }
}

// 入团申请审核
function checkJoinTeam(row, value) {
    const value_text = value == 2 ? '是否同意该用户的入团申请？' : '是否拒绝该用户的入团申请？'
    ElMessageBox.confirm(value_text, '温馨提示', { type: 'warning'}).then(async () => {
        try {
            const data = {
                teamId: team_info.value.teamId,
                clientId: row.clientId,
                checkValue: value,
            }
            await useCheckJoinTeam(data)
            ElMessage.success('操作成功！')
            await getApplyJoinTeamList()
            await getTeamMemberList()
        }
        catch(err) {
            console.log(err)
        }
    })
}

//解散团队
function dissolveTeam() {
    const value_text_1 = `是否确认解散团队：${team_info.value.teamName}`
    const value_text_2 = `已成功解散团队：${team_info.value.teamName}，请重新登录。`
    ElMessageBox.confirm(value_text_1, '解散团队', { type: 'warning'}).then(async () => {
        try {
            await useDissolveTeam()
            ElMessageBox.confirm(
                value_text_2,
                '温馨提示',
                { 
                    type: 'success',
                    showCancelButton: false,
                    showClose: false,
                    closeOnClickModal: false,
                    closeOnPressEscape: false,
                }
            ).then(() => {
                user_store.logout()
            })
        }
        catch(err) {
            console.log(err)
        }
    })
}

// 编辑团队信息
async function editTeamInfo(title) {
    edit_team.value = true
    edit_team_dom.value.initTitle(title)
}

//编辑页面返回
async function goback(type) {
    if(type == 'goback') edit_team.value = false
    if(type == 'user_space') {
        const data = {
            index: '1-1'
        }
        await router.push('/user')
        mitt_bus.emit('changeUserActiveIndex', data)
    }
}

// 刷新团队信息
async function refreshTeamInfo() {
    edit_team.value = false
    const res = await useGetTeamInfo(user_info.value.teamId)
    res.data.avatar_path = res.data.teamProFilePhoto ? import.meta.env.VITE_FILE_API + res.data.teamProFilePhoto : ''
    team_info.value = res.data
}
</script>

<template>
    <div>
        <div v-show="!edit_team">
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
                        <div class="flex-center">
                            <div class="flex-center edit-team-info" @click="editTeamInfo('编辑团队')">
                                <span>{{ team_info.teamName }}</span>
                                <el-icon class="font-middle" v-if="team_info.clientCharacterRole == 1"><Edit /></el-icon>
                            </div>
                            <div class="default-button disband-button" v-if="team_info.clientCharacterRole == 1" @click="dissolveTeam">解散团队</div>
                        </div>
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
        
            <div class="page-main">
                <el-carousel :height="'calc(100vh - 245px)'" :autoplay="false" indicator-position="none" arrow="always">
                    <!-- 团队成员 -->
                    <el-carousel-item>
                        <div class="carousel-item">
                            <div class="font-94C9FF font-600 font-middle title-ret">团队成员</div>
                            <div class="carousel-item-main">
                                <el-table v-loading="team_member_list_loading" :data="team_member_list" :header-cell-style="{ background: '#94C9FF50' }" :height="`calc(100vh - 380px)`">
                                    <el-table-column prop="clientName" align="center" label="姓名" min-width="100"></el-table-column>
                                    <el-table-column prop="applyDate" align="center" label="入团时间" min-width="120"></el-table-column>
                                    <el-table-column prop="realNameStatus" align="center" label="是否实名" min-width="100">
                                        <template #default="scope">{{ scope.row.realNameStatus == 0 ? '否' : '是' }}</template>
                                    </el-table-column>
                                    <el-table-column prop="phoneNumber" align="center" label="联系电话" min-width="120"></el-table-column>
                                    <el-table-column prop="roleName" align="center" label="角色" min-width="80">
                                        <template #default="scope">{{ getDictLabel('character_role', scope.row.characterRole) }}</template>
                                    </el-table-column>
                                    <el-table-column prop="teamCompleteOrderNumber" align="center" label="完成订单" min-width="100"></el-table-column>
                                    <el-table-column v-if="user_info.characterRole !== 3" align="center" label="订单金额" min-width="120">
                                        <template #default="scope">
                                            <span class="font-FF4A2B">￥{{ scope.row.teamOrderTotalCost }}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column v-if="user_info.characterRole !== 3" align="center" label="团队欠款金额" min-width="120">
                                        <template #default="scope">
                                            <span class="font-5CC300">￥{{ scope.row.teamDebtTotalCost }}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column v-if="user_info.characterRole !== 3" align="center" label="个人欠款金额" min-width="120">
                                        <template #default="scope">
                                            <span class="font-5CC300">￥{{ scope.row.toBePaidDebt }}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column v-if="team_info.paymentAudit == 1 && user_info.characterRole != 3" label="免审核额度" align="center" min-width="180">
                                        <template #default="scope">
                                            <div v-if="scope.row.edit">
                                                <input type="number" style="width: 70px; text-align: center;" v-model="scope.row.teamAuditFlag_new">
                                                <el-button type="text" size="small" @click="setTeamAuditFlag(scope.row, scope.$index)">确认</el-button>
                                            </div>
                                            <div v-else>
                                                <span>{{ scope.row.teamAuditFlag_new }}</span>
                                                <el-button type="text" size="small" @click="scope.row.edit = true">编辑</el-button>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="操作" align="center" min-width="180">
                                        <template #default="scope">
                                            <div class="flex-center-col">
                                                <div><el-button v-if="team_info.clientCharacterRole == 1 && scope.row.characterRole != 1" type="text" size="small" @click="transferTeam(scope.row)">转让团长</el-button></div>
                                                <div><el-button v-if="team_info.clientCharacterRole == 1 && scope.row.characterRole == 2" type="text" size="small" @click="setRole(scope.row, 3)">取消管理员</el-button></div>
                                                <div><el-button v-if="team_info.clientCharacterRole == 1 && scope.row.characterRole == 3" type="text" size="small" @click="setRole(scope.row, 2)">设为管理员</el-button></div>
                                                <div><el-button v-if="team_info.clientCharacterRole != 3 && scope.row.characterRole != 1" type="text" size="small" @click="removeTeam(scope.row)"><span class="font-FF4A2B">移出团队</span></el-button></div>
                                            </div>
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <div class="flex-center pagination-box">
                                    <el-pagination 
                                      v-model:current-page="team_member_list_params.pageNum" 
                                      v-model:page-size="team_member_list_params.pageSize" 
                                      :page-sizes="[10, 20, 30, 50]" 
                                      :background="true" 
                                      :total="team_member_list_total"
                                      layout="total, sizes, prev, pager, next"
                                      @change="getTeamMemberList"
                                    />
                                </div>
                            </div>
                        </div>
                    </el-carousel-item>
                    <!-- 团队订单审核 -->
                    <el-carousel-item v-if="team_info.clientCharacterRole != 3">
                        <div class="carousel-item">
                            <div class="font-94C9FF font-600 font-middle title-abs">团队订单审核</div>
                            <div class="carousel-item-main">
                                <el-tabs v-model="active_pane" type="card" size="small" @tab-change="changePane">
                                    <el-tab-pane name="first">
                                        <template #label>
                                            <el-badge v-if="check_team_total > 0" :value="check_team_total">
                                                <span>待审核</span>
                                            </el-badge>
                                            <span v-else>待审核</span>
                                        </template>
                                    </el-tab-pane>
                                    <el-tab-pane label="已审核" name="second"></el-tab-pane>
                                </el-tabs>
                                <el-table v-loading="check_team_list_loading" :data="check_team_list" :header-cell-style="{ background: '#94C9FF50' }" :height="`calc(100vh - 380px)`">
                                    <el-table-column prop="equipmentName" align="center" label="实验名称">
                                        <template #default="scope">
                                            <span class="link-text" @click="toOrderList(scope.row)">{{ scope.row.equipmentName }}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="totalCost" align="center" label="实付款">
                                        <template #default="scope">¥{{ scope.row.totalCost || '0.00' }}</template>
                                    </el-table-column>
                                    <el-table-column prop="clientName" align="center" label="下单人"></el-table-column>
                                    <el-table-column prop="prepaidPayment" align="center" label="支付方式">
                                        <template #default="scope">{{ getDictLabel('prepaid_payment', scope.row.prepaidPayment) }}</template>
                                    </el-table-column>
                                    <el-table-column prop="orderDate" align="center" label="申请时间">
                                        <template #default="scope">{{ dayjs(scope.row.orderDate).format('YYYY-MM-DD HH:mm') }}</template>
                                    </el-table-column>
                                    <el-table-column prop="checkName" align="center" label="审核人" v-if="active_pane == 'second'"></el-table-column>
                                    <el-table-column prop="checkStatus" align="center" label="审核结果" v-if="active_pane == 'second'">
                                        <template #default="scope">
                                            <span class="font-5CC300" v-if="scope.row.checkStatus == 2">通过</span>
                                            <span class="font-FF4A2B" v-if="scope.row.checkStatus == 3">拒绝</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="操作" width="120" align="center" v-if="active_pane == 'first'">
                                        <template #default="scope">
                                            <el-button class="font-5CC300" type="text" @click="orderCheckHandle(scope.row, 2)">同意</el-button>
                                            <el-button class="font-FF4A2B" type="text" @click="orderCheckHandle(scope.row, 3)">拒绝</el-button>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="审核备注" width="120" align="center" v-if="active_pane == 'second'">
                                        <template #default="scope">
                                            <el-button v-if="scope.row.checkRemark" type="text" @click="showCheckRemark(scope.row)">查看备注</el-button>
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <div class="flex-center pagination-box">
                                    <el-pagination 
                                      v-model:current-page="check_team_list_params.pageNum" 
                                      v-model:page-size="check_team_list_params.pageSize" 
                                      :page-sizes="[15, 30, 50]" 
                                      :background="true" 
                                      :total="check_team_list_total"
                                      layout="total, sizes, prev, pager, next"
                                      @change="getCheckTeamList"
                                    />
                                </div>
                            </div>
                        </div>
                    </el-carousel-item>
                    <!-- 入团申请 -->
                    <el-carousel-item  v-if="team_info.clientCharacterRole != 3">
                        <div class="carousel-item">
                            <div class="font-94C9FF font-600 font-middle title-ret">入团申请</div>
                            <div class="carousel-item-main">
                                <el-table v-loading="join_team_list_loading" :data="join_team_list" :header-cell-style="{ background: '#94C9FF50' }" :height="`calc(100vh - 380px)`">
                                    <el-table-column prop="clientName" align="center" label="姓名"></el-table-column>
                                    <el-table-column prop="realNameStatus" align="center" label="是否实名">
                                        <template #default="scope">{{ scope.row.realNameStatus == 0 ? '否' : '是' }}</template>
                                    </el-table-column>
                                    <el-table-column prop="phoneNumber" align="center" label="联系电话"></el-table-column>
                                    <el-table-column prop="applyDate" align="center" label="申请时间"></el-table-column>
                                    <el-table-column label="操作" width="120" align="center">
                                        <template #default="scope">
                                            <el-button type="text" @click="checkJoinTeam(scope.row, 2)">同意</el-button>
                                            <el-button type="text" @click="checkJoinTeam(scope.row, 3)"><span class="font-FF4A2B">拒绝</span></el-button>
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <div class="flex-center pagination-box">
                                    <el-pagination 
                                      v-model:current-page="join_team_list_params.pageNum" 
                                      v-model:page-size="join_team_list_params.pageSize" 
                                      :page-sizes="[10, 20, 30, 50]" 
                                      :background="true" 
                                      :total="join_team_list_total"
                                      layout="total, sizes, prev, pager, next"
                                      @change="getApplyJoinTeamList"
                                    />
                                </div>
                            </div>
                        </div>
                    </el-carousel-item>
                </el-carousel>
            </div>
        </div>
    
        <div v-show="edit_team">
            <edit-team ref="edit_team_dom" :user_info="user_info" @goback="goback" @refresh="refreshTeamInfo"></edit-team>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.pagination-box {
    justify-content: flex-end;
    width: calc(88vw - 150px);
    min-width: 1118px;
    margin-top: 15px;
}

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
            .edit-team-info  {
                cursor: pointer;
            }
            .edit-team-info:hover {
                color: #94C9FF;
            }
            .disband-button {
                height: 100%;
                margin-left: 5px;
                padding: 0 10px;
                font-weight: normal;
            }
            .disband-button:hover {
                color: #FF4A2B;
                border-color: #FF4A2B;
                background-color: #FF4A2B30;
            }
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

.page-main {
    width: calc(88vw - 30px);
    min-width: 1238px;
    height: calc(100vh - 245px);
    margin-top: 15px;
    border-radius: 10px;
    background-color: #FFFFFF90;
    .carousel-item {
        position: relative;
        width: calc(88vw - 30px);
        min-width: 1238px;
        height: calc(100vh - 245px);
        padding: 15px 60px;
        .title-abs {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
        }
        .title-ret {
            width: calc(88vw - 150px);
            min-width: 1118px;
            text-align: center;
            margin-bottom: 15px;
        }
        .carousel-item-main {
            width: calc(88vw - 150px);
            min-width: 1118px;
            height: calc(100vh - 275px);
        }
    }
}
</style>