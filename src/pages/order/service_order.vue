<script setup>
import { ref } from 'vue'
import { useGetActives, useGetUserOrderList } from '@/api'
import { getUserInfo } from '@/utils/auth'
import { regionData, codeToText } from "element-china-area-data"

const loading = ref(true)
const order_list_loading = ref(false)
const actvie_flag = ref(false)
const user_info = getUserInfo()//用户信息
const order_list = ref([])//做过检测的订单

const service_data = ref({
    ifUrgent: 0,
    ifRecycle: 0,
    provinceCode: "",
    provinceValue: [],
    recycleProvince: "",
    recycleAddress: "",
    recycleContact: "",
    recycleContactPhone: "",
    contactType: 1,
    contact: "",
    contactPhone: "",
    ifTestEquipment: 0,
    relevanceOrderCode: "",




    
    postMethod: "1",
    postPayment: "1",
    addressId: "",
    homeSamplingAddress: "",
    detailedAddress: "",
    samplingContact: "",
    samplingContactPhone: "",
    onSiteSamplingDate: "",
    onSiteSamplingTime: '9:00 ~ 12:00',
    onSiteSamplingRemark: ""
})

//加急费选项
const urgent_options = [
    { label: '加急', value: 1 },
    { label: '不加急', value: 0 },
]
//会收费选项
const recycle_options = [
    { label: '回收', value: 1 },
    { label: '不回收', value: 0 },
]
//实验有问题联系谁
const contact_type_options = [
    { label: '本人', value: 1 },
    { label: '其他人', value: 2 },
]
//是否与之前同设备
const test_equipment_options = [
    { label: '需要', value: 1 },
    { label: '不需要/未在【纳微创新】做过检测', value: 0 },
]

//初始化页面数据
function init() {
    getActives()
}

//判断是否可参与下单返现活动
async function getActives() {
    try {
        const res = await useGetActives(2)
        actvie_flag.value = res.data.activityStatusEnum == 2 ? true : false
    }
    catch(err) {
        console.log(err)
    }
}

//是否回收
function changeRecycle(value) {
    if(service_data.value.ifRecycle == value) return
    service_data.value.ifRecycle = value
    if (value == 1) {
        service_data.value.provinceCode = user_info.provinceCode
        service_data.value.provinceValue = user_info.provinceCode.split(",")
        service_data.value.recycleProvince = getCodeToText(service_data.value.provinceValue)
        service_data.value.recycleAddress = user_info.address
        service_data.value.recycleContact = user_info.clientName
        service_data.value.recycleContactPhone = user_info.phoneNumber
    } else {
        service_data.value.provinceCode = ""
        service_data.value.recycleProvince = ""
        service_data.value.recycleAddress = ""
        service_data.value.recycleContact = ""
        service_data.value.recycleContactPhone = ""
    }
}
//把区域码转成汉字
function getCodeToText(value) {
    let name = ""
    value.map(item => (name += codeToText[item] + "/"))
    return name
}

//是否回收---选择省市
function changeProvince(e) {
    service_data.value.provinceValue = e ? e : []
    service_data.value.provinceCode = e ? e.toString() : ''
    service_data.value.recycleProvince = e ? getCodeToText(e) : ''
}

//是否与之前同设备
function changeTestEquipment(value) {
    if(service_data.value.ifTestEquipment == value) return
    service_data.value.ifTestEquipment = value
    if(value == 0) {
        service_data.value.relevanceOrderCode = ''
    }
}

//远程搜索订单列表
async function getOrderList(e) {
    order_list_loading.value = true
    const params = {
        clientId: user_info.clientId,
        equipmentName: e,
        pageSize: 30,
        pageNum: 1,
    }
    const res = await useGetUserOrderList(params)
    order_list.value = res.rows.map(item => {
        return {
            label: `${item.equipmentName}(${item.orderCode})`,
            value: item.orderCode
        }
    })
    order_list_loading.value = false
}

defineExpose({init})
</script>

<template>
    <div class="service flex-center">
        <div class="service-box">
            <div class="service-box-head flex-center">
                <div class="flex-center">
                    <div class="slider"></div>
                    <span class="font-middle font-600">服务费用</span>
                </div>
            </div>
            <div class="service-box-content">
                <div class="fieId-style">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>是否加急</span>
                        </div>
                        <div class="fieId-content">
                            <div class="radio" :class="{'radio-active': item.value == service_data.ifUrgent}" v-for="item in urgent_options" :key="item.value" @click="service_data.ifUrgent = item.value">{{ item.label }}</div>
                        </div>
                    </div>
                    <div class="fieId-tips" v-show="service_data.ifUrgent">请务必与技术顾问确认能否加急！如确认加急，测试费用加收50%</div>
                </div>
                <div class="fieId-style">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>是否回收</span>
                        </div>
                        <div class="fieId-content">
                            <div class="radio" :class="{'radio-active': item.value == service_data.ifRecycle}" v-for="item in recycle_options" :key="item.value" @click="changeRecycle(item.value)">{{ item.label }}</div>
                        </div>
                    </div>
                </div>
                <div class="fieId-style" v-show="service_data.ifRecycle == 1">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>所在省市</span>
                        </div>
                        <div class="fieId-content">
                            <el-cascader v-model="service_data.provinceValue" :options="regionData" clearable @change="changeProvince"/>
                        </div>
                    </div>
                </div>
                <div class="fieId-style" v-show="service_data.ifRecycle == 1">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>回收详细地址</span>
                        </div>
                        <div class="fieId-content">
                            <el-input v-model="service_data.recycleAddress" placeholder="请输入"/>
                        </div>
                    </div>
                </div>
                <div class="fieId-style" v-show="service_data.ifRecycle == 1">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>回收取样联系人</span>
                        </div>
                        <div class="fieId-content">
                            <el-input v-model="service_data.recycleContact" placeholder="请输入"/>
                        </div>
                    </div>
                </div>
                <div class="fieId-style" v-show="service_data.ifRecycle == 1">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>回收取样联系人电话</span>
                        </div>
                        <div class="fieId-content">
                            <el-input v-model="service_data.recycleContactPhone" placeholder="请输入"/>
                        </div>
                    </div>
                </div>
                <div class="fieId-style">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>实验有问题联系谁</span>
                        </div>
                        <div class="fieId-content">
                            <div class="radio" :class="{'radio-active': item.value == service_data.contactType}" v-for="item in contact_type_options" :key="item.value" @click="service_data.contactType = item.value">{{ item.label }}</div>
                        </div>
                    </div>
                </div>
                <div class="fieId-style" v-show="service_data.contactType == 2">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>实验问题联系人</span>
                        </div>
                        <div class="fieId-content">
                            <el-input v-model="service_data.contact" placeholder="请输入实验问题联系人"/>
                        </div>
                    </div>
                </div>
                <div class="fieId-style" v-show="service_data.contactType == 2">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>联系人电话号码</span>
                        </div>
                        <div class="fieId-content">
                            <el-input v-model="service_data.contactPhone" placeholder="请输入联系人电话号码"/>
                        </div>
                    </div>
                </div>
                <div class="fieId-style">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>是否与之前测试同设备</span>
                        </div>
                        <div class="fieId-content">
                            <div class="radio" :class="{'radio-active': item.value == service_data.ifTestEquipment}" v-for="item in test_equipment_options" :key="item.value" @click="changeTestEquipment(item.value)">{{ item.label }}</div>
                        </div>
                    </div>
                </div>
                <div class="fieId-style" v-show="service_data.ifTestEquipment == 1">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>选择意向设备的订单</span>
                        </div>
                        <div class="fieId-content">
                            <el-select
                              v-model="service_data.relevanceOrderCode"
                              filterable
                              remote
                              reserve-keyword
                              placeholder="请选择订单"
                              :remote-method="getOrderList"
                              :loading="order_list_loading"
                            >
                              <el-option v-for="item in order_list" :key="item.value" :label="item.label" :value="item.label"/>
                            </el-select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="mail-box">

        </div>
    </div>
</template>

<style lang="scss" scoped>
.fieId-label {
    width: 30% !important;
}
.fieId-content {
    width: 70% !important;
}
.radio {
    cursor: default;
    min-width: 150px;
    height: fit-content;
    padding: 8px;
    text-align: center;
    border-radius: 10px;
    border: 1px solid #E8E8E8;
}
.radio-active {
    color: #5CC300;
    border-color: #5CC300;
    background-color: #5CC30030;
}

.service {
    column-gap: 15px;
    width: 80vw;
    min-width: 1440px;
    margin: 10px auto 0;
    background-color: #ffffff90;
    .service-box-head {
        justify-content: flex-start;
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
    .service-box-content {
        padding: 15px;
    }
    .service-box {
        width: calc(50% - 5px);
        border-radius: 15px;
        background-color: #FFFFFF;
    }
    .mail-box {
        width: calc(50% - 5px);
        background-color: pink;
        border-radius: 15px;
    }
}

</style>