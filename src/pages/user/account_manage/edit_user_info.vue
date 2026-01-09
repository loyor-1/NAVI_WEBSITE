<script setup>
import { ref, computed, watch } from 'vue'
import { getUserInfo, getToken } from '@/utils/auth'
import { ElMessage } from 'element-plus'
import { useGetSchoolList, useUpdateUserInfo, useGetPhoneSMSCode, useSetPassword, useGetPasswordSMSCode } from '@/api'
import { validEmail, isIdentity, isIdentity_taiwan, validPhone } from '@/utils/validate'

const validIdentity = (rule, value, callback) => {
    if (value && !isIdentity(value) && !isIdentity_taiwan(value)) {
        return callback(new Error("请输入正确的身份证号!"))
    }
    callback()
}

const validemail = (rule, value, callback) => {
  if (value && !validEmail(value)) {
    return callback(new Error("请输入正确的邮箱"))
  }
  callback()
}

function validPhoneRule(rule, value, callback) {
    const {valid, message} = validPhone(value)
    if(valid) {
        callback()
    } else {
        callback(new Error(message))
    }
}

const action = import.meta.env.VITE_BASE_API + '/file/upload'
const headers = {
    Authorization: "Bearer " + getToken()
}
const user_form_dom = ref(null)
const phone_form_dom = ref(null)
const password_form_dom = ref(null)

const edit_info_status = ref(false)
const edit_phone_status = ref(false)
const edit_password_status = ref(false)
const edit_loading = ref(false)
const user_loading = ref(false)
const phone_loading = ref(false)
const password_loading = ref(false)
const phone_SMS = ref(false)
const password_SMS = ref(false)
const phone_count = ref(60)
const password_count = ref(60)
const phone_timer = ref(null)
const password_timer = ref(null)
const user_info = ref(getUserInfo())//用户信息
const college_list = ref([])//高效列表
const faculty_list = ref([])//院系列表
const campus_list = ref([])//校区列表

const user_form = ref({
    avatar: '',
    clientName: '',
    identityType: '',
    email: '',
    province: '',
    provinceCode: '',
    provinceValue: [],
    colleges: '',
    collegesId: null,
    faculty: '',
    facultyId: null,
    campus: '',
    campusId: null,
    companyName: '',
    address: '',
})
const user_rules = ref({
    clientName: [
        {
            required: true,
            message: "姓名不能为空",
            trigger: "blur"
        },
        {
            required: true,
            max: 30,
            message: "姓名不能超过30字",
            trigger: "blur"
        }
    ],
    identityCard: [
        { required: true, trigger: "blur", message: "请输入身份证号" },
        { validator: validIdentity, trigger: "blur" }
    ],
    email: [
        { required: true, trigger: "blur", message: "请输入邮箱" },
        { validator: validemail, trigger: "blur" }
    ],
    identityType: [
        { required: true, trigger: "change", message: "请选择身份" }
    ],
    provinceValue: [
        { required: true, trigger: "change", message: "请选择所在省市" }
    ],
    collegesId: [
        { required: true, trigger: "change", message: "请选择所在高校" }
    ],
    facultyId: [
        { required: true, trigger: "change", message: "请选择所在院系" }
    ],
    companyName: [
        { required: true, trigger: "change", message: "请选择所在企业" }
    ]
})

const phone_form = ref({
    oldPhone: '',
    newPhone: '',
    code: '',
})

const phone_rules = ref({
    newPhone: [
        { required: true, trigger: "blur", message: "请输入新手机号" },
        { validator: validPhoneRule, trigger: "blur" }
    ],
    code: [{ required: true, trigger: "blur", message: "请输入验证码" }]
})

const password_form = ref({
    password: '',
    confirmPassword: '',
    pwdcode: '',
})

const password_rules = ref({
    password: [{ required: true, trigger: "blur", message: "请输入密码" }],
    confirmPassword: [{ required: true, trigger: "blur", message: "请输入密码" }],
    pwdcode: [{ required: true, trigger: "blur", message: "请输入验证码" }]
})

const identity_options = ref([
    { label: "学生", value: 0 },
    { label: "教职工", value: 1 },
    { label: "公司员工", value: 2 },
])

const user_avatar = computed(() => {
    const url = import.meta.env.VITE_FILE_API + user_form.value.avatar
    return url
})

watch(
    () => edit_info_status.value,
    (newValue) => {
        if(newValue) {
            initData()
        } else {
            user_form_dom.value.resetFields()
        }
    },
)

watch(
    () => edit_phone_status.value,
    (newValue) => {
        if(newValue) {
            phone_form.value.oldPhone = user_info.value.phoneNumber
            phone_form.value.newPhone = ''
            phone_form.value.code = ''
        } else {
            phone_form_dom.value.resetFields()
        }
    }
)

watch(
    () => edit_password_status.value,
    (newValue) => {
        if(newValue) {
            password_form.value.password = ''
            password_form.value.confirmPassword = ''
            password_form.value.pwdcode = ''
        } else {
            password_form_dom.value.resetFields()
        }
    }
)

function initData() {
    console.log('user_info', user_info.value)
    user_form.value.avatar = user_info.value.avatar
    user_form.value.clientName = user_info.value.clientName
    user_form.value.identityType = user_info.value.identityType
    user_form.value.email = user_info.value.email
    user_form.value.province = user_info.value.province
    user_form.value.provinceCode = user_info.value.provinceCode
    user_form.value.provinceValue = user_info.value.provinceCode ? user_info.value.provinceCode.split(',') : []
    user_form.value.colleges = user_info.value.colleges
    user_form.value.collegesId = user_info.value.collegesId
    user_form.value.faculty = user_info.value.faculty
    user_form.value.facultyId = user_info.value.facultyId
    user_form.value.campus = user_info.value.campus
    user_form.value.campusId = user_info.value.campusId
    user_form.value.companyName = user_info.value.companyName
    user_form.value.address = user_info.value.address
}
initData()

function beforeAvatarUpload(res) {
    if (res.size / 1024 / 1024 > 1) {
        ElMessage.error('图片大小不能超过 1MB!')
        return false
    }
    return true
}

//上传头像
function updateAvatar(res) {
    user_form.value.avatar = res.data.url
}

//选择高效
async function changeCollege(value) {
    const data = college_list.value.find(item => item.schoolId == value)
    user_form.value.colleges = data.schoolName
    user_form.value.faculty = ''
    user_form.value.facultyId = null
    user_form.value.campus = ''
    user_form.value.campusId = null

    const params = {
        type: 2,
        parentId: value,
    }
    const res = await useGetSchoolList(params)
    faculty_list.value = res.data
}

//选择院系
async function changeFaculty(value) {
    const data = faculty_list.value.find(item => item.schoolId == value)
    user_form.value.campus = ''
    user_form.value.campusId = null
    user_form.value.faculty = data.schoolName
    
    const params = {
        type: 3,
        parentId: user_form.value.collegesId,
    }
    const res = await useGetSchoolList(params)
    campus_list.value = res.data
}

// 选择校区
function changeCampus(value) {
    const data = campus_list.value.find(item => item.schoolId == value)
    user_form.value.campus = data.schoolName
}

//打开编辑用户信息界面
async function editUserInfo() {
    try {
        edit_loading.value = true
        const college_params = {
            type: 1,
            areaCode: user_form.value.provinceValue.length ? user_form.value.provinceValue[0] : ''
        }
        const college_res = await useGetSchoolList(college_params)
        college_list.value = college_res.data
        if(user_form.value.collegesId) {
            const faculty_params = {
                type: 2,
                parentId: user_form.value.collegesId,
            }
            const faculty_res = await useGetSchoolList(faculty_params)
            faculty_list.value = faculty_res.data
            const campus_params = {
                type: 3,
                parentId: user_form.value.collegesId,
            }
            const campus_res = await useGetSchoolList(campus_params)
            campus_list.value = campus_res.data
        }
        edit_loading.value = false
        edit_info_status.value = true
    }
    catch(err) {
        console.log(err)
        edit_loading.value = false
        edit_info_status.value = false
    }
}

//确认编辑
function confirmEdit() {
    if(user_loading.value) return
    user_form_dom.value.validate(async valid => {
        if(valid) {
            try {
                user_loading.value = true
                if (user_form.value.identityType == 2) {
                    user_form.value.colleges = null;
                    user_form.value.faculty = null;
                    user_form.value.campus = null;
                } else {
                    user_form.value.companyName = null;
                }
                await useUpdateUserInfo(user_form.value)
                user_info.value = getUserInfo()
                ElMessage.success('修改个人信息成功！')
                user_loading.value = false
                edit_info_status.value = false
            }
            catch(err) {
                console.log(err)
                user_loading.value = false
            }
        }
    })
}

// 取消编辑
function cancelEdit() {
    if(user_loading.value) return
    edit_info_status.value = false
    initData()
}

//获取修改手机号验证码
function getPhoneSMSCode() {
    if(phone_SMS.value) return
    phone_form_dom.value.validateField('newPhone', async valid => {
        if(valid) {
            try{
                phone_SMS.value = true
                const params = {
                    phoneNumber: phone_form.value.newPhone
                }
                await useGetPhoneSMSCode(params)
                const TIME_COUNT = 60
                if (!phone_timer.value) {
                    phone_count.value = TIME_COUNT
                    phone_timer.value = setInterval(() => {
                        if (phone_count.value > 0 && phone_count.value <= TIME_COUNT) {
                            phone_count.value--
                        } else {
                            phone_SMS.value = false
                            clearInterval(phone_timer.value)
                            phone_timer.value = null
                        }
                    }, 1000)
                }
            }
            catch(err) {
                console.log(err)
                phone_SMS.value = false
            }
        }
    })
}

//确认修改手机号
function confirmEditPhone() {
    if(phone_loading.value) return
    phone_form_dom.value.validate(async valid => {
        if(valid) {
            try {
                phone_loading.value = true
                await useUpdatePhone(phone_form.value)
                ElMessage.success('修改手机号成功！')
                user_info.value = getUserInfo()
                phone_loading.value = false
            }
            catch(err) {
                console.log(err)
                phone_loading.value = false
            }
        }
    })
}

//取消修改手机号
function cancelEditPhone() {
    if(phone_loading.value) return
    edit_phone_status.value = false
}

//获取修改密码的短信验证码
function getPasswordSMSCode() {
    if(password_SMS.value) return
    password_form_dom.value.validateField(['password', 'confirmPassword'], async valid => {
        if(valid) {
            try{
                password_SMS.value = true
                const params = {
                    phoneNumber: user_info.value.phoneNumber
                }
                await useGetPasswordSMSCode(params)
                const TIME_COUNT = 60
                if (!password_timer.value) {
                    password_count.value = TIME_COUNT
                    password_timer.value = setInterval(() => {
                        if (password_count.value > 0 && password_count.value <= TIME_COUNT) {
                            password_count.value--
                        } else {
                            password_SMS.value = false
                            clearInterval(password_timer.value)
                            password_timer.value = null
                        }
                    }, 1000)
                }
            }
            catch(err) {
                console.log(err)
                password_SMS.value = false
            }
        }
    })
}

//确认修改密码
function confirmEditPassword() {
    if(password_loading.value) return
    password_form_dom.value.validate(async valid => {
        if(valid) {
            try {
                password_loading.value = true
                await useSetPassword(password_form.value)
                ElMessage.success('修改登陆密码成功！')
                user_info.value = getUserInfo()
                password_loading.value = false
            }
            catch(err) {
                console.log(err)
                password_loading.value = false
            }
        }
    })
}

//取消修改密码
function cancelEditPassword() {
    if(password_loading.value) return
    edit_password_status.value = false
}
</script>

<template>
    <div class="page-main flex-center">
        <div class="page-box" v-loading="edit_loading">
            <div class="page-head flex-center font-600">基本资料</div>
            <el-form class="user-form" ref="user_form_dom" :model="user_form" :rules="user_rules" label-width="auto">
                <el-form-item label="头像" prop="avatar">
                    <el-upload
                       v-if="edit_info_status"
                      :action="action"
                      :headers="headers"
                      :show-file-list="false"
                      :before-upload="beforeAvatarUpload"
                      :on-success="updateAvatar"
                    >
                        <img class="user-avatar" v-if="user_form.avatar" :src="user_avatar" />
                        <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                    </el-upload>
                    <el-image class="user-avatar" v-else :src="user_info.avatar_path">
                        <template #error>
                            <img src="@/assets/img/avatar.png" alt="">
                        </template>
                    </el-image>
                </el-form-item>
                <el-form-item label="姓名" prop="clientName">
                    <el-input v-if="edit_info_status" v-model="user_form.clientName" disabled></el-input>
                    <div class="info-item" v-else>{{ user_form.clientName }}</div>
                </el-form-item>
                <el-form-item label="身份" prop="identityType">
                    <el-select v-if="edit_info_status" v-model="user_form.identityType">
                        <el-option v-for="item in identity_options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                    <div class="info-item" v-else>{{ identity_options.find(i => i.value == user_form.identityType).label }}</div>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-if="edit_info_status" v-model="user_form.email" placeholder="请输入邮箱"></el-input>
                    <div class="info-item" v-else>{{ user_form.email || '--' }}</div>
                </el-form-item>
                <el-form-item label="所在省市" prop="provinceValue">
                    <el-input v-if="edit_info_status" v-model="user_form.province" disabled placeholder="请前往身份认证设置省市信息"></el-input>
                    <div class="info-item" v-else>
                        <span v-if="user_form.province">{{ user_form.province }}</span>
                        <span class="font-5D5D5D" v-else>请前往身份认证设置省市信息</span>
                    </div>
                </el-form-item>
                <el-form-item label="所在高校" prop="collegesId" v-if="user_form.identityType != 2">
                    <el-select v-if="edit_info_status && user_info.provinceCode" v-model="user_form.collegesId" placeholder="请选择所在高校" @change="changeCollege">
                        <el-option v-for="item in college_list" :key="item.schoolId" :label="item.schoolName" :value="item.schoolId"></el-option>
                    </el-select>
                    <div class="info-item" v-else>
                        <span v-if="user_form.colleges">{{ user_form.colleges }}</span>
                        <span class="font-5D5D5D" v-else>请前往身份认证设置省市信息</span>
                    </div>
                </el-form-item>
                <el-form-item label="所在院系" prop="facultyId" v-if="user_form.identityType != 2">
                    <el-select v-if="edit_info_status && user_info.provinceCode" v-model="user_form.facultyId" placeholder="请选择所在院系" @change="changeFaculty">
                        <el-option v-for="item in faculty_list" :key="item.schoolId" :label="item.schoolName" :value="item.schoolId"></el-option>
                    </el-select>
                    <div class="info-item" v-else>
                        <span v-if="user_form.faculty">{{ user_form.faculty }}</span>
                        <span class="font-5D5D5D" v-else>请前往身份认证设置省市信息</span>
                    </div>
                </el-form-item>
                <el-form-item label="所在校区" prop="campusId" v-if="user_form.identityType != 2">
                    <el-select v-if="edit_info_status && user_info.provinceCode" v-model="user_form.campusId" placeholder="请选择所在校区" @change="changeCampus">
                        <el-option v-for="item in campus_list" :key="item.schoolId" :label="item.schoolName" :value="item.schoolId"></el-option>
                    </el-select>
                    <div class="info-item" v-else>
                        <span v-if="user_form.campus">{{ user_form.campus }}</span>
                        <span class="font-5D5D5D" v-else>请前往身份认证设置省市信息</span>
                    </div>
                </el-form-item>
                <el-form-item label="所在企业" prop="companyName" v-if="user_form.identityType == 2">
                    <el-input v-if="edit_info_status" v-model="user_form.companyName" placeholder="请输入所在企业"></el-input>
                    <div class="info-item" v-else>{{ user_form.companyName || '--' }}</div>
                </el-form-item>
                <el-form-item label="详细地址" prop="address">
                    <el-input v-if="edit_info_status" v-model="user_form.address" placeholder="请输入详细地址"></el-input>
                    <div class="info-item" v-else>{{ user_form.address || '--' }}</div>
                </el-form-item>
            </el-form>
            <div class="button-box flex-center">
                <div class="button-style" :class="[user_loading ? 'disabled-button' : 'default-button']" v-if="edit_info_status" @click="cancelEdit">取消</div>
                <div class="button-style" :class="[user_loading ? 'disabled-button' : 'custom-button']" v-if="edit_info_status" @click="confirmEdit">确认编辑</div>
                <div class="button-style custom-button" v-if="!edit_info_status" @click="editUserInfo">编辑资料</div>
            </div>
        </div>

        <div class="page-box">
            <div class="page-head flex-center font-600">安全设置</div>
            <div class="private-info">
                <div class="private-head flex-center">
                    <div class="flex-center">
                        <div class="slider"></div>
                        <span class="font-600">手机号</span>
                    </div>
                    <div class="private-button custom-button" v-if="!edit_phone_status" @click="edit_phone_status = true">修改手机号</div>
                    <div class="flex-center" v-if="edit_phone_status">
                        <div class="private-button" :class="[phone_loading? 'disabled-button' : 'default-button']" @click="cancelEditPhone">取消</div>
                        <div class="private-button" :class="[phone_loading? 'disabled-button' : 'custom-button']" @click="confirmEditPhone">确认</div>
                    </div>
                </div>
                <el-form ref="phone_form_dom" :model="phone_form" :rules="phone_rules" label-width="auto">
                    <div class="private-content">
                        <el-form-item>
                            <div class="content-item flex-center">
                                <el-icon class="content-icon"><PhoneFilled /></el-icon>
                                <span>{{ user_info.phoneNumber }}</span>
                            </div>
                        </el-form-item>
                        <el-form-item v-if="edit_phone_status" prop="newPhone">
                            <div class="content-item flex-center">
                                <el-icon class="content-icon"><PhoneFilled /></el-icon>
                                <el-input v-model="phone_form.newPhone"></el-input>
                            </div>
                        </el-form-item>
                        <el-form-item v-if="edit_phone_status" prop="code">
                            <div class="content-item flex-center">
                                <div class="SMS-code flex-center">
                                    <el-icon class="content-icon"><Comment /></el-icon>
                                    <el-input v-model="phone_form.code"></el-input>
                                </div>
                                <div class="SMS-button disabled-button"  v-if="phone_SMS">{{ phone_count }}秒后重新获取</div>
                                <div class="SMS-button custom-button" v-else @click="getPhoneSMSCode">获取验证码</div>
                            </div>
                        </el-form-item>
                    </div>
                </el-form>
            </div>

            <div class="private-info">
                <div class="private-head flex-center">
                    <div class="flex-center">
                        <div class="slider"></div>
                        <span class="font-600">添加/修改登录密码</span>
                    </div>
                    <div class="private-button custom-button" v-if="!edit_password_status" @click="edit_password_status = true">修改密码</div>
                    <div class="flex-center" v-if="edit_password_status">
                        <div class="private-button" :class="[password_loading? 'disabled-button' : 'default-button']" @click="cancelEditPassword">取消</div>
                        <div class="private-button" :class="[password_loading? 'disabled-button' : 'custom-button']" @click="confirmEditPassword">确认</div>
                    </div>
                </div>
                <el-form ref="password_form_dom" :model="password_form" :rules="password_rules" label-width="auto">
                    <div class="private-content" v-if="edit_password_status">
                        <el-form-item prop="code">
                            <div class="content-item flex-center">
                                <el-icon class="content-icon"><Platform /></el-icon>
                                <el-input v-model="password_form.password" type="password"></el-input>
                            </div>
                        </el-form-item>
                        <el-form-item prop="confirmPassword">
                            <div class="content-item flex-center">
                                <el-icon class="content-icon"><Platform /></el-icon>
                                <el-input v-model="password_form.confirmPassword" type="password"></el-input>
                            </div>
                        </el-form-item>
                        <el-form-item prop="pwdcode">
                            <div class="content-item flex-center">
                                <div class="SMS-code flex-center">
                                    <el-icon class="content-icon"><Comment /></el-icon>
                                    <el-input v-model="password_form.pwdcode"></el-input>
                                </div>
                                <div class="SMS-button disabled-button"  v-if="password_SMS">{{ password_count }}秒后重新获取</div>
                                <div class="SMS-button custom-button" v-else @click="getPasswordSMSCode">获取验证码</div>
                            </div>
                        </el-form-item>
                    </div>
                </el-form>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.page-main {
    column-gap: 15px;
    align-items: flex-start;
    width: calc(88vw - 30px);
    min-width: 1237px;
    .page-box {
        flex: 1;
        min-height: calc(100vh - 30px);
        border-radius: 10px;
        border: 1px solid #cccccc;
        background-color: #FFFFFF90;
    }
    .page-head {
        padding: 10px;
        border-radius: 10px 10px 0 0;
        background-color: #94C9FF;
    }
}

.avatar-uploader-icon {
    width: 100px;
    height: 100px;
    cursor: pointer;
    border: 1px dashed #5D5D5D;
    border-radius: 50%;
}

.avatar-uploader-icon:hover {
    color: #94C9FF;
    border-color: #94C9FF;
}

.user-form {
    padding: 15px;
    .user-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        border: 1px solid #5D5D5D;
        img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
        }
    }
    .info-item {
        width: 100%;
        padding-left: 10px;
        border: 1px solid #cccccc;
        border-radius: 5px;
        background-color: #FFFFFF;
    }
}

.button-box {
    column-gap: 15px;
    .button-style {
        width: 300px;
        height: 45px;
    }
}

.private-info {
    width: 96%;
    margin: 15px auto 0;
    border: 1px solid #cccccc;
    border-radius: 10px;
    background-color: #FFFFFF;
    .private-head {
        justify-content: space-between;
        height: 60px;
        padding: 0 10px;
        .slider {
            width: 5px;
            height: 30px;
            margin-right: 10px;
            background-color: #94C9FF;
        }
        .private-button {
            width: 120px;
            height: 30px;
            margin-left: 10px;
        }
    }
    .private-content {
        padding: 10px 10px 0 10px;
        border-top: 1px solid #cccccc;
        .content-icon {
            color: #94C9FF;
            transform: scale(1.3);
        }
        .content-item {
            column-gap: 10px;
            justify-content: flex-start;
            width: 100%;
            height: 40px;
            padding: 0 10px;
            border: 1px solid #cccccc;
            border-radius: 5px;
            background-color: #F5F7FA;
            .SMS-code {
                column-gap: 10px;
                width: 80%;
            }
            .SMS-button {
                width: calc(20% - 10px);
            }
        }
    }
    
}

</style>