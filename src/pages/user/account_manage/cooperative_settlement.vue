<script setup>
import jiancecailiao from '@/assets/img/service_jiancecailiao.png'
import hightest from '@/assets/img/service_hightest.png'
import monijisuan from '@/assets/img/service_monijisuan.png'
import shijihaocai from '@/assets/img/service_shijihaocai.png'
import keyanhuitu from '@/assets/img/service_keyanhuitu.png'
import zhuanlifuwu from '@/assets/img/service_zhuanlifuwu.png'
import { ref } from 'vue'
import { regionData, codeToText } from "element-china-area-data";
import { ElMessage } from 'element-plus'
import { useSaveProducer } from '@/api'
import { validPhone } from '@/utils/validate'

function validPhoneRule(rule, value, callback) {
    const {valid, message} = validPhone(value)
    if(valid) {
        callback()
    } else {
        callback(new Error(message))
    }
}

const first_list = [
    { id: 1, title: "年累计订单", num: "350000+" },
    { id: 2, title: "年服务人数", num: "100000+" },
    { id: 3, title: "每天处理样品", num: "1400+" },
    { id: 4, title: "合作伙伴", num: "800+" },
    { id: 5, title: "设备使用率提升", num: "60%" },
    { id: 6, title: "自我价值提升", num: "30%" },
]

const seconed_list = [
    { id: 1, name: "材料检测", desc1: "各类常规测试", desc2: "可做云现场和现场", url: jiancecailiao },
    { id: 2, name: "高端检测", desc1: "国企控股旗下", desc2: "第三方检测平台", url: hightest },
    { id: 3, name: "模拟计算", desc1: "通过理论计算支撑实验结果", desc2: "指导实验方向,助您提高论文档次", url: monijisuan },
    { id: 4, name: "试剂耗材", desc1: "让你的产品", desc2: "助力科研试验落地", url: shijihaocai },
    { id: 5, name: "科研绘图", desc1: "论文封面、插图、摘要图", desc2: "助您实现科研成果的精彩绽放", url: keyanhuitu },
    { id: 6, name: "专利服务", desc1: "20000+项目案例", desc2: " AI数据精准匹配", url: zhuanlifuwu },
]

const rules = {
    laboratoryContact: [{ required: true, trigger: "blur", message: "请输入您的姓名" }],
    contactPhone: [
        { required: true, trigger: "blur", message: "请输入您的电话" },
        { validator: validPhoneRule, trigger: 'blur' }
    ],
    scopeOfServices: [{ required: true, trigger: "blur", message: "请输入服务范围" }],
    province: [{ required: true, trigger: "change", message: "请选择所在区域" }],
}

const form_dom = ref(null)

const confirm_loading = ref(false)

const form = ref({
    laboratoryContact: '',
    contactPhone: '',
    scopeOfServices: '',
    provinceValue: '',
    weChat: '',
    referrer: '',
    referrerPhone: '',
})

function handleChange(value) {
    form.value.provinceValue = value
    form.value.provinceCode = value.toString()
    form.value.province = getCodeToText(value)
}
//把区域码转成汉字
function getCodeToText(value) {
    let name = ""
    value.map(item => (name += codeToText[item] + "/"))
    return name
}
function submitRequire() {
    if(confirm_loading.value) return
    form_dom.value.validate(async (valid) => {
        if (valid) {
            try {
                confirm_loading.value = true
                await useSaveProducer(form.value)
                confirm_loading.value =false
                form_dom.value.resetFields()
                ElMessage.success('申请成功！')
            }
            catch(err) {
                console.log(err)
                confirm_loading.value =false
            }
        }
    })
}
</script>

<template>
    <div class="flex-center-col first-box">
        <div class="flex-center first-title">
            <div class="font-large font-FFFFFF font-600">加入纳微的</div>
            <img class="first-img" src="@/assets/img/6.png" alt="" />
            <div class="font-large font-FFFFFF font-600">大理由</div>
        </div>
        <div class="flex-center first-desc">
            <span class="desc-left"></span>
            <div class="desc-text">一起成为优质服务商</div>
            <span class="desc-right"></span>
        </div>
        <div class="flex-center first-list">
            <div class="flex-center-col first-list-item" v-for="item in first_list" :key="item.id">
                <div class="font-middle font-FFFFFF font-600">{{ item.title }}</div>
                <div class="font-middle font-FF5000 font-600">{{ item.num }}</div>
            </div>
        </div>
    </div>

    <div class="seconed-box">
        <div class="flex-center seconed-title">
            <img src="@/assets/img/service_left.png" alt="" />
            <div class="font-middle font-5D5D5D">服务项目</div>
            <img src="@/assets/img/service_right.png" alt="" />
        </div>
        <div class="flex-center seconed-list">
            <div class="flex-center-col seconed-list-item" v-for="item in seconed_list" :key="item.id">
                <img class="item-img" :src="item.url" alt="" />
                <div class=" font-middle font-600">{{ item.name }}</div>
                <div class="font-5D5D5D">{{ item.desc1 }}</div>
                <div class="font-5D5D5D">{{ item.desc2 }}</div>
            </div>
        </div>
    </div>

    <div class="flex-center-col apply-box">
        <div class="flex-center font-middle font-600 apply-title">立即申请成为纳微创新的合作伙伴</div>
        <el-form class="apply-form" ref="form_dom" :model="form" :rules="rules" label-width="140px" label-position="right">
            <el-form-item label="实验室联系人" prop="laboratoryContact">
                <el-input v-model="form.laboratoryContact" maxlength="20" placeholder="请输入您的姓名"></el-input>
            </el-form-item>
            <el-form-item label="实验室联系电话" prop="contactPhone">
                <el-input v-model="form.contactPhone" placeholder="请输入您的电话"></el-input>
            </el-form-item>
            <el-form-item label="服务范围" prop="scopeOfServices">
                <el-input v-model="form.scopeOfServices" placeholder="测试类/数据分析类/加工类等项目"></el-input>
            </el-form-item>
            <el-form-item label="所在区域" prop="provinceValue">
                <el-cascader v-model="form.provinceValue" placeholder="请选择所在地区" :options="regionData" @change="handleChange"></el-cascader>
            </el-form-item>
            <el-form-item label="微信" prop="weChat">
                <el-input v-model="form.weChat" placeholder="请输入微信号"></el-input>
            </el-form-item>
            <el-form-item label="推荐人" prop="referrer">
                <el-input v-model="form.referrer" placeholder="请输入推荐人"></el-input>
            </el-form-item>
            <el-form-item label="推荐人联系方式" prop="referrerPhone">
                <el-input v-model="form.referrerPhone" placeholder="请输入推荐人联系方式"></el-input>
            </el-form-item>
        </el-form>
        <div class="confirm-button" :class="[confirm_loading ? 'disabled-button' : 'custom-button']" @click="submitRequire">确认提交</div>
    </div>
</template>

<style lang="scss" scoped>
.first-box {
    row-gap: 30px;
    width: calc(88vw - 30px);
    min-width: 1238px;
    height: calc((88vw - 30px) * 0.25);
    min-height: 310px;
    background-image: url("@/assets/img/hezuoHeaderBackground.jpg");
    background-size: cover;
    background-position: center;
    .first-title {
        column-gap: 20px;
        align-items: flex-end;
        width: 100%;
        .first-img {
            width: 30px;
        }
    }
    .first-desc {
        position: relative;
        .desc-text {
            color: #ffffff;
            font-size: 22px;
        }
        .desc-left::after {
            display: block;
            content: "";
            width: 100px;
            height: 1.5px;
            background: #ffffff;
            opacity: 0.4;
            position: absolute;
            left: -120px;
            top: 15px;
        }
        .desc-right::after {
            display: block;
            content: "";
            width: 100px;
            height: 1.5px;
            background: #ffffff;
            opacity: 0.4;
            position: absolute;
            right: -120px;
            top: 15px;
        }
    }
    .first-list {
        column-gap: 15px;
        .first-list-item {
            padding: 10px 20px;
            border-radius: 5px;
            letter-spacing: 0.2em;
            background: #0a517d;
        }
    }
}

.seconed-box {
    width: calc(88vw - 30px);
    min-width: 1238px;
    padding-top: 35px;
    background-image: url("@/assets/img/service_background.jpg");
    background-size: cover;
    background-position: center;
    .seconed-title {
        column-gap: 30px;
        img {
            width: 100px;
            height: 20px;
        }
    }
    .seconed-list {
        flex-wrap: wrap;
        justify-content: space-around;
        margin: 50px auto 0;
        .seconed-list-item {
            row-gap: 5px;
            width: 30%;
            padding-bottom: 40px;
            .item-img {
                width: 45%;
            }
        }
    }
}

.apply-box {
    width: calc(88vw - 30px);
    min-width: 1238px;
    padding-bottom: 150px;
    background-color: #FFFFFF;
    .apply-title {
        width: 100%;
        height: 80px;
        border-bottom: 1px dashed #E8E8E8;
    }
    .apply-form {
        width: 50%;
        margin-top: 30px;
    }
    .confirm-button {
        width: 140px;
        height: 35px;
        margin-top: 30px;
    }
}
</style>