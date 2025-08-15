<script setup>
import { ref, watch } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore()
const router = useRouter()
const login_type = ref(2)
const login_loading = ref(false)
const login_SMS = ref({
    phoneNumber: '',
    smsCode: '',
})
const login_password = ref({
    loginAccount: '',
    password: '',
})

watch(login_type, () => {
    resetData()
})

function resetData() {
    login_SMS.value.phoneNumber = ''
    login_SMS.value.smsCode = ''
    login_password.value.loginAccount = ''
    login_password.value.password = ''
}

async function login() {
    login_loading.value = true
    let data = {}
    switch(login_type.value) {
        case 2:
            data = login_SMS.value
            break
        case 3:
            data = login_password.value
            break
    }
    try {
        await userStore.login(data)
        login_loading.value = false
        resetData()
        router.push('/')
    }
    catch {
        login_loading.value = false
    }
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
            <div class="box-main flex-center" v-if="login_type == 2">
                <div class="input-box flex-center">
                    <img class="icon" src="@/assets/svg/phone.svg" alt="">
                    <input class="input-long" type="text" v-model="login_SMS.phoneNumber">
                </div>
                <div class="input-box flex-center">
                    <img class="icon" src="@/assets/svg/lock.svg" alt="">
                    <input class="input-short" type="text" v-model="login_SMS.smsCode">
                    <el-button class="input-button">获取短信验证码</el-button>
                </div>
            </div>
            <div class="box-main flex-center" v-if="login_type == 3">
                <div class="input-box flex-center">
                    <img class="icon" src="@/assets/svg/phone.svg" alt="">
                    <input class="input-long" type="text" v-model="login_password.phoneNumber">
                </div>
                <div class="input-box flex-center">
                    <img class="icon" src="@/assets/svg/lock.svg" alt="">
                    <input class="input-short" type="text" v-model="login_password.smsCode">
                    <el-button class="input-button">获取短信验证码</el-button>
                </div>
            </div>
            <el-button type="primary" class="login-button" :loading="login_loading" @click="login">登录/注册</el-button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
input {
    outline: none;
    border: none;
    padding: 10px;
    border-radius: 5px;
}
input:focus {
    border: 1px solid #94C9FF;
}

.page-main {
    flex-direction: column;
    row-gap: 50px;
    width: 100vw;
    min-width: 1440px;
    height: 100vh;
    padding-bottom: 30vh;
    background: url('@/assets/img/home_bg.png') no-repeat;
    background-size: cover;
    .login-box {
        flex-direction: column;
        width: 30vw;
        min-width: 500px;
        padding: 0 0 50px;
        background-color: #FFFFFF90;
        border-radius: 10px;
        .box-head {
            display: flex;
            width: 100%;
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
            width: 100%;
            min-height: 200px;
            .input-box {
                justify-content: space-between;
                width: 80%;
                .icon {
                    width: 25px;
                }
                .input-long {
                    width: calc(100% - 50px);
                }
                .input-short {
                    width: calc(100% - 225px);
                }
                .input-button {
                    width: 150px;
                    height: 100%;
                }
            }
        }
        .login-button {
            width: 80%;
            height: 50px;
        }
    }
}
</style>