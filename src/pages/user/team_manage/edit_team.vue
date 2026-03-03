<script setup>
import { ref } from 'vue'
import { validPhone } from '@/utils/validate'
import { getToken } from '@/utils/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { regionData, codeToText } from "element-china-area-data"
import { useGetTeamInfo, useCreatTeam, useEditTeam } from '@/api'
import agreementText from '@/components/agreement_text.vue'
import { useUserStore } from '@/stores/user'

function validPhoneRule(rule, value, callback) {
    const { valid, message } = validPhone(value)
    if(valid) {
        callback()
    } else {
        callback(new Error(message))
    }
}

const props = defineProps(['user_info'])
const emits = defineEmits(['goback'])
const user_store = useUserStore()

const form_dom = ref(null)
const tag = ref(null)
const action = import.meta.env.VITE_BASE_API + '/file/upload'
const headers = {
    Authorization: "Bearer " + getToken()
}

const loading = ref(false)
const title = ref('创建团队')
const avatar_url = ref('')
const check_dialog = ref(false)
const agreement_dialog = ref(false)
const change_prestore_control_switch = ref(false)

const data = ref({
    teamId: undefined,
    teamName: "",
    teamProFilePhoto: "",
    region: "",
    regionCode: "",
    regionValue: [],
    address: "",
    teamHeadName: "",
    teamHeadPhone: "",
    teamHeadEmail: "",
    paymentAudit: 1,
    freePay: 1,
})
const rules = {
    teamName: [
        { required: true, trigger: "blur", message: "请输入团队名称" },
        { max: 30, message: "团队名称不能超过30个字", trigger: "blur" }
    ],
    regionValue: [
        { required: true, trigger: "change", message: "请选择所在省市" }
    ],
    teamHeadName: [
        { required: true, trigger: "blur", message: "请输入团长姓名" },
        { max: 30, message: "团队姓名不能超过30个字", trigger: "blur" }
    ],
    address: [
        { max: 100, message: "地址不能超过100个字", trigger: "blur" }
    ],
    teamHeadPhone: [
        { required: true, trigger: "blur", message: "请输入团长电话" },
        { validator: validPhoneRule, trigger: "blur" }
    ],
}
const prestore_control_params = ref({
    teamId: undefined,
    prestoreSwitch: 0,
})
//预存限制选择列表
const prestore_control_list = [
    {label: '开启限制', value: 1},
    {label: '关闭限制', value: 0},
]
const check_list = [
    {name: '开启审核',value: 1},
    {name: '暂不审核',value: 0}
]

async function initTitle(value) {
    loading.value = true
    title.value = value
    data.value.teamHeadName = props.user_info.clientName
    data.value.teamHeadPhone = props.user_info.phoneNumber
    data.value.teamHeadEmail = props.user_info.email
    if(value == '编辑团队') {
        const res = await useGetTeamInfo(props.user_info.teamId)
        const { teamId, prestoreSwitch, teamName, teamProFilePhoto, region, regionCode, address, paymentAudit, freePay } = res.data
        prestore_control_params.value.prestoreSwitch = prestoreSwitch
        prestore_control_params.value.teamId = teamId
        const obj = { teamId, teamName, teamProFilePhoto, region, regionCode, address, paymentAudit, freePay }
        for(let key in obj) {
            data.value[key] = obj[key]
        }
        data.value.regionValue = regionCode.split(",")
        avatar_url.value = teamProFilePhoto ? import.meta.env.VITE_FILE_API + teamProFilePhoto : "@/assets/img/avatarTeam.png"
    }
    loading.value = false
}

function handleAvatarSuccess(res, file) {
    data.value.teamProFilePhoto = res.data.url
    avatar_url.value = import.meta.env.VITE_FILE_API + res.data.url
}

function beforeAvatarUpload(file) {
    if (
        file.type != "image/jpeg" &&
        file.type != "image/png" &&
        file.type != "image/jpg"
    ) {
        return ElMessage.error("上传头像图片只能是 JPG/PNG 格式!");
    }
    return true
}

function handleChange(value) {
    data.value.regionValue = value
    data.value.regionCode = value.toString()
    data.value.region = getCodeToText(value)
}
//把区域码转成汉字
function getCodeToText(value) {
    let name = ''
    value.map(item => (name += codeToText[item] + "/"))
    return name
}

function changePaymentAudit (value) {
    if(data.value.paymentAudit == value) return
    data.value.paymentAudit = value
    if(value) check_dialog.value = true
    tag.value.clearValidate()
}

async function changeprestoreControl(value) {
    if(change_prestore_control_switch.value) return
    if(prestore_control_params.value.prestoreSwitch != value) {
        change_prestore_control_switch.value = true
        prestore_control_params.value.prestoreSwitch = value
        if(title.value == '编辑团队') {
            try {
                await editPrestoreControl(prestore_control_params.value)
                ElMessage.success('预存限制变更成功！')
                change_prestore_control_switch.value = false
            }
            catch(err) {
                console.log(err)
                prestore_control_params.value.prestoreSwitch = value == 1 ? 0 : 1
                change_prestore_control_switch.value = false
            }
        } else {
          change_prestore_control_switch.value = false
        }
    }
}

function confirmCheckBox() {
    check_dialog.value = false
    data.value.paymentAudit = 1
}

function closeCheckBox() {
    check_dialog.value = false
    data.value.paymentAudit = 0
}

function creatTeam() {
    form_dom.value.validate(async valid => {
        if(valid) {
            try {
                loading.value = true
                const data = {
                    ...data.value,
                    prestoreSwitch: prestore_control_params.value.prestoreSwitch
                }
                await useCreatTeam(data)
                loading.value = false
                ElMessageBox.confirm(
                    '团队创建成功，请重新登陆！',
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
                loading.value = false
            }
        }
    })
}

async function editTeamInfo() {
    form_dom.value.validate(async valid => {
        if(valid) {
            try {
                loading.value = true
                await useEditTeam(data.value)
                ElMessage.success('团队信息修改成功！')
                emits('refresh')
            }
            catch(err) {
                console.log(err)
                loading.value = false 
            }
        }
    })
}

async function goback() {
    if(title.value == '编辑团队') emits('goback', 'goback')
    if(title.value == '创建团队') emits('goback', 'user_space')
}

defineExpose({ initTitle })
</script>

<template>
    <div class="container">
        <div class="flex-center font-middle page-head">{{ title }}</div>
        <div v-loading="loading" class="page-content">
            <el-scrollbar>
                <el-form ref="form_dom" :model="data" :rules="rules" label-width="160px" label-position="left">
                    <el-form-item label="团队名称" prop="teamName">
                        <el-input v-model="data.teamName" placeholder="请输入团队名称"></el-input>
                    </el-form-item>
                    <el-form-item label="团队头像">
                        <el-upload
                          class="avatar-uploader"
                          :action="action"
                          :show-file-list="false"
                          :headers="headers"
                          :on-success="handleAvatarSuccess"
                          :before-upload="beforeAvatarUpload"
                        >
                            <el-image class="avatar" v-if="avatar_url" :src="avatar_url">
                                <template #error>
                                    <img class="avatar" src="@/assets/img/avatarTeam.png" />
                                </template>
                            </el-image>
                            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="所在省市" prop="regionValue">
                        <el-cascader v-model="data.regionValue" :options="regionData" placeholder="请选择所在省市" @change="handleChange"></el-cascader>
                    </el-form-item>
                    <el-form-item label="详细地址" prop="address">
                        <el-input v-model="data.address" placeholder="请输入详细地址"></el-input>
                    </el-form-item>
                    <el-form-item label="团长姓名" prop="teamHeadName">
                        <el-input v-model="data.teamHeadName" disabled placeholder="暂无“团长姓名”信息"></el-input>
                    </el-form-item>
                    <el-form-item label="团长电话" prop="teamHeadPhone">
                        <el-input v-model="data.teamHeadPhone" disabled placeholder="暂无“团长电话”信息"></el-input>
                    </el-form-item>
                    <el-form-item label="团长邮箱" prop="teamHeadEmail">
                        <el-input v-model="data.teamHeadEmail" disabled placeholder="暂无“团长邮箱”信息"></el-input>
                    </el-form-item>
                    <el-form-item label="免审核设置" id="tagOther" ref="tag">
                        <div class="flex-center">
                            <div
                              class="button-style"
                              :class="[data.paymentAudit == item.value ? 'custom-button' : 'default-button']"
                              v-for="item in check_list" 
                              :key="item.index"
                              @click="changePaymentAudit(item.value)"
                            >
                                {{ item.name }}
                            </div>
                        </div>
                        <div class="font-FF5000">开启免审核设置后，在设定额度之下，团员下单无需团长/管理员审核</div>
                    </el-form-item>
                    <el-form-item v-if="data.paymentAudit == 1" label="单笔订单免审核额度" prop="teamHeadEmail">
                        <el-input-number v-model="data.freePay" :min="1" :max="10000"></el-input-number>
                    </el-form-item>
                    <el-form-item label="预存限制" id="tagOther" ref="tag">
                        <div
                          class="button-style"
                          :class="[prestore_control_params.prestoreSwitch == item.value ? 'custom-button' : 'default-button']"
                          v-for="item in prestore_control_list" 
                          :key="item.value"
                          @click="changeprestoreControl(item.value)"
                        >
                            {{ item.label }}
                        </div>
                    </el-form-item>
                </el-form>
            </el-scrollbar>
        </div>
        <div class="flex-center page-footer">
            <div class="custom-button footer-button" v-if="title == '创建团队'" @click="creatTeam">确认创建</div>
            <div class="custom-button footer-button" v-if="title == '编辑团队'" @click="editTeamInfo">确认编辑</div>
            <div class="default-button footer-button" @click="goback">返回</div>
        </div>
        
        <el-dialog v-model="check_dialog" title="开通支付免审核服务" :close-on-click-modal="false" width="500px">
            <div>
                <div style="display: flex; justify-content: space-between;">
                    <div style="width: 250px;">服务内容</div>
                    <div>“在纳微(含纳微创新小程序纳微官方网页)团队管理中团长、管理员无需审核订单，快速审批订单，便于团员检测，并可在“我的-我的团队-支付审核”中随时取消”</div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                    <div style="width: 250px;">开通账号</div>
                    <div> {{ form.teamName }} </div>
                </div>
                <div style="cursor: pointer; margin-top: 20px;" @click="agreement_dialog = true">
                    <span>查看</span>
                    <span style="color: #4D6FFF; text-decoration: underline;">《付款授权服务协议》</span>
                </div>
            </div>
            <template #footer>
                <el-button type="primary" @click="confirmCheckBox">同意协议并开通免审核支付</el-button>
                <el-button @click="closeCheckBox">取 消</el-button>
            </template>
        </el-dialog>
    
        <el-dialog v-model="agreement_dialog" :close-on-click-modal="false" title="订单免审核授权服务协议" width="40%">
            <agreement-text :team_name="form.teamName"></agreement-text>
            <template #footer>
                <el-button type="primary" @click="agreement_dialog = false">确认</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.container {
    width: calc(88vw - 30px);
    min-width: 1238px;
    height: calc(100vh - 30px);
    border-radius: 10px;
    background: #FFFFFF90;
    .page-head {
        width: 100%;
        height: 50px;
        border-radius: 10px 10px 0 0;
        background-color: #94C9FF80;
    }
    .page-content {
        width: 100%;
        height: calc(100vh - 200px);
        padding: 15px;
    }
    .page-footer {
        column-gap: 150px;
        width: calc(88vw - 30px);
        min-width: 1238px;
        height: 120px;
        .footer-button {
            width: 300px;
            height: 50px;
        }
    }
}

.avatar-uploader {
    overflow: hidden;
    cursor: pointer;
    position: relative;
    width: 110px;
    height: 110px;
    padding: 5px;
    border: 1px dashed #94C9FF;
    border-radius: 6px;
}
.avatar-uploader:hover {
    border-color: #409eff;
}
.avatar-uploader-icon {
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
    color: #8c939d;
    vertical-align: middle;
}
.avatar {
    display: block;
    width: 100px;
    height: 100px;
}
.button-style {
    padding: 3px 15px;
    margin-right: 15px;
}

</style>