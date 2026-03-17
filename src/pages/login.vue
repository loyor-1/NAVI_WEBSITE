<script setup>
import { ref, watch, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRoute, useRouter } from 'vue-router'
import { useGetLoginQRCode, useGetLoginStatus } from '@/api'
import { validPhone } from '@/utils/validate'

function validPhoneRule(rule, value, callback) {
    const {valid, message} = validPhone(value)
    if(valid) {
        callback()
    } else {
        callback(new Error(message))
    }
}

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const form = ref(null)//表单对象
const privacy_check = ref(false)
const privacy_timer = ref(null)
const login_type = ref(2)
const login_loading = ref(false)
const QRCode_timer = ref(null)//二维码扫码登录状态检查计时器
const QRCode_data = ref({
    scene: '',
    status: 'loading',//二维码状态
    url: '',//二维码地址
    expire_seconds: '',//过期时间
})
const login_SMS = ref({
    phoneNumber: '',
    smsCode: '',
})
const login_password = ref({
    loginAccount: '',
    phoneNumber: '',
    password: '',
})
const rules = reactive({
    phoneNumber: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { validator: validPhoneRule, trigger: 'blur' }
    ],
    smsCode: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
    ],
})

watch(login_type, (newValue) => {
    resetData()
    if(newValue == 1) {
        getLoginQRCode()
    } else {
        resetQRCodeData()
        clearInterval(QRCode_timer.value)
        QRCode_timer.value = null
    }
})

function resetQRCodeData() {
    QRCode_data.value = {
        scene: undefined,
        status: 'loading',
        url: undefined,
        expire_seconds: undefined,
        desc: ''
    }
    window.querySele
}

async function getLoginQRCode() {
    resetQRCodeData()
    try {
        const res = await useGetLoginQRCode({width: 400})
        QRCode_data.value = {
            scene: res.data.scene,
            status: 'finish',
            url: 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' + res.data.ticket,
            expire_seconds: res.data.expire_seconds,
        }
        QRCode_timer.value = setInterval(async () => {
            const res = await checkQRCodeLogin()
            switch (res.status) {
                case 'wait':
                    break
                case 'timeout':
                    QRCode_data.value.status = 'expired'
                    QRCode_data.value.desc = '二维码已失效，点击刷新'
                    clearInterval(QRCode_timer.value)
                    QRCode_timer.value = null
                    break
                case 'success':
                    QRCode_data.value.status = 'success'
                    QRCode_data.value.desc = '扫码成功'
                    clearInterval(QRCode_timer.value)
                    QRCode_timer.value = null
                    const res_login = await userStore.QRCode_login({scene: QRCode_data.value.scene})
                    if(res_login) {
                        resetData()
                        setTimeout(() => {
                            router.push('/')
                        }, 500)
                    } else {
                        QRCode_data.value.status = 'fail'
                        QRCode_data.value.desc = '登录失败，请重试'
                    }
                    break
            }
        }, 2000)
    }
    catch {
        resetQRCodeData()
        QRCode_data.value.status = 'fail'
        QRCode_data.value.desc = '二维码获取失败，请重试'
    }
}

async function checkQRCodeLogin() {
    const res = await useGetLoginStatus({scene: QRCode_data.value.scene})
    const data = res.data
    return data
}

function resetData() {
    login_SMS.value.phoneNumber = ''
    login_SMS.value.smsCode = ''
    login_password.value.loginAccount = ''
    login_password.value.phoneNumber = ''
    login_password.value.password = ''
}

function login() {
    if(!privacy_check.value) {
        if(!privacy_timer.value) {
            privacy_timer.value = setTimeout(() => {
                clearTimeout(privacy_timer.value)
                privacy_timer.value = null
            }, 300)
        }
        return
    }
    form.value.validate(async valid => {
        if(valid) {
            login_loading.value = true
            let data = {}
            switch(login_type.value) {
                case 2:
                    data = login_SMS.value
                    break
                case 3:
                    login_password.value.phoneNumber = login_password.value.loginAccount
                    data = login_password.value
                    break
            }
            if(route.query.inviter_phone_number) {
                data.inviterType = route.query.inviter_type
                data.inviterPhoneNumber = route.query.inviterPhoneNumber
            }
            const res = await userStore.login(data)
            if(res) {
                resetData()
                router.push('/')
            }
            login_loading.value = false
        }
    })
}
</script>

<template>
    <div class="page-main flex-center">
        <img class="logo" src="@/assets/logo/logo.png" alt="">
        <div class="login-box flex-center">
            <div class="box-head">
                <div class="login-type flex-center" :class="{'login-type-active': login_type ==  1}" @click="login_type = 1">扫码登录</div>
                <div class="login-type flex-center" :class="{'login-type-active': login_type ==  2}" @click="login_type = 2">短信登录</div>
                <div class="login-type flex-center" :class="{'login-type-active': login_type ==  3}" @click="login_type = 3">密码登录</div>
            </div>
            <div class="box-main flex-center" v-if="login_type == 1">
                <div class="QRCode-img" v-loading="QRCode_data.status == 'loading'">
                    <img :src="QRCode_data.url" alt="" />
                    <div class="QRCode-img-fial flex-center" v-if="QRCode_data.status == 'expired' || QRCode_data.status == 'fail'" @click="getLoginQRCode">
                        <el-icon style="transform: scale(2);"><RefreshRight size="50"/></el-icon>
                        <span class="font-mini">{{ QRCode_data.desc }}</span>
                    </div>
                    <div class="QRCode-img-fial flex-center" v-if="QRCode_data.status == 'success'">
                        <el-icon style="transform: scale(2);"><CircleCheckFilled /></el-icon>
                        <span class="font-mini">{{ QRCode_data.desc }}</span>
                    </div>
                </div>
            </div>
            <el-form ref="form" :model="login_type == 2 ? login_SMS : login_password" :rules="rules">
                <div class="box-main flex-center" v-if="login_type == 2">
                    <div class="input-box flex-center">
                        <img class="icon" src="@/assets/svg/phone.svg" alt="">
                        <el-form-item prop="phoneNumber">
                            <el-input class="input-long" placeholder="请输入手机号" @keyup.enter="login" v-model="login_SMS.phoneNumber" />
                        </el-form-item>
                    </div>
                    <div class="input-box flex-center">
                        <img class="icon" src="@/assets/svg/SMS.svg" alt="">
                        <el-form-item prop="smsCode">
                            <el-input class="input-short" placeholder="请输入验证码" @keyup.enter="login" v-model="login_SMS.smsCode" />
                        </el-form-item>
                        <el-button class="input-button">获取短信验证码</el-button>
                    </div>
                </div>
                <div class="box-main flex-center" v-if="login_type == 3">
                    <div class="input-box flex-center">
                        <img class="icon" src="@/assets/svg/phone.svg" alt="">
                        <el-form-item prop="phoneNumber">
                            <el-input class="input-long" placeholder="请输入手机号" @keyup.enter="login" v-model="login_password.phoneNumber" />
                        </el-form-item>
                    </div>
                    <div class="input-box flex-center">
                        <img class="icon" src="@/assets/svg/lock.svg" alt="">
                        <el-form-item prop="password">
                            <el-input class="input-long" type="password" placeholder="请输入密码" show-password @keyup.enter="login" v-model="login_password.password"/>
                        </el-form-item>
                    </div>
                </div>
            </el-form>
            <div class="desc" v-if="login_type == 1">
                <span class="font-mini font-5D5D5D">扫码代表您同意</span>
                <span class="font-mini font-light">《纳微创新用户注册协议》</span>
                <span class="font-mini font-5D5D5D">与</span>
                <span class="font-mini font-light">《纳微创新用户隐私协议》</span>
            </div>
            <div class="desc" :class="[privacy_timer ? 'desc-null' : '']" v-else>
                <el-checkbox v-model="privacy_check">
                    <div class="flex-center">
                        <span class="font-mini font-5D5D5D">登录或注册代表您同意</span>
                        <span class="font-mini font-light">《纳微创新用户注册协议》</span>
                        <span class="font-mini font-5D5D5D">与</span>
                        <span class="font-mini font-light">《纳微创新用户隐私协议》</span>
                    </div>
                </el-checkbox>
            </div>
            <el-button type="primary" class="login-button" :loading="login_loading" @click="login">登录/注册</el-button>
            <span class="tips" @click="router.push('/home_page')">前往首页</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
:deep(.el-form-item) {
    margin-bottom: 0;
}
@keyframes desc-null {
    0% { transform: translateX(0) }
    20% { transform: translateX(-10px) }
    40% { transform: translateX(10px) }
    60% { transform: translateX(-10px) }
    80% { transform: translateX(10px) }
    100% { transform: translateX(0) }
}

.page-main {
    flex-direction: column;
    row-gap: 50px;
    width: 100vw;
    min-width: 1440px;
    height: 100vh;
    padding-bottom: 30vh;
    .login-box {
        flex-direction: column;
        width: 30vw;
        min-width: 500px;
        padding: 0 0 40px;
        background-color: #FFFFFF90;
        border-radius: 10px;
        .box-head {
            display: flex;
            width: 30vw;
            min-width: 500px;
            .login-type {
                flex: 1;
                padding: 15px 0;
            }
            .login-type-active {
                background-color: #94C9FF50;
            }
        }
        .box-main {
            flex-direction: column;
            row-gap: 20px;
            width: 30vw;
            min-width: 500px;
            min-height: 200px;
            .input-box {
                justify-content: space-between;
                width: 24vw;
                min-width: 400px;
                .icon {
                    width: 25px;
                }
                .input-long {
                    width: calc(24vw - 50px);
                    min-width: 350px;
                    height: 40px;
                }
                .input-short {
                    width: calc(24vw - 225px);
                    min-width: 175px;
                    height: 40px;
                }
                .input-button {
                    width: 150px;
                    height: 40px;
                }
            }
            .QRCode-img {
                position: relative;
                width: 10vw;
                min-width: 200px;
                height: 10vw;
                min-height: 200px;
                margin: 10px;
                img {
                    width: 100%;
                    height: 100%;
                }
                .QRCode-img-fial {
                    position: absolute;
                    top: 0;
                    left: 0;
                    flex-direction: column;
                    row-gap: 15px;
                    width: 10vw;
                    min-width: 200px;
                    height: 10vw;
                    min-height: 200px;
                    color: #FFFFFF;
                    background-color: #11111190;
                }
            }
        }
        .desc {
            margin-bottom: 15px;
        }
        .desc-null {
            animation: desc-null 0.3s linear forwards;
        }
        .login-button {
            width: 80%;
            height: 50px;
        }
        .tips {
            cursor: pointer;
            margin-top: 15px;
            text-decoration: underline;
            color: #5D5D5D;
        }
        .tips:hover {
            color: #94C9FF;
        }
    }
}
</style>
