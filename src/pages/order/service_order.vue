<script setup>
import dayjs from 'dayjs'
import { ref } from 'vue'
import { useGetActives, useGetUserOrderList, useGetUnitList, useGetUserOtherInfo } from '@/api'
import { getUserInfo } from '@/utils/auth'
import { regionData, codeToText } from "element-china-area-data"

const loading = ref(true)
const order_list_loading = ref(false)
const actvie_flag = ref(false)
const user_info = getUserInfo()//用户信息
const user_other_info = getUserInfo()//用户其他信息
const order_list = ref([])//做过检测的订单
const unit_list = ref([])//区域列表

const service_data = ref({
    ifUrgent: 0,
    ifRecycle: 0,
    provinceCode: '',
    provinceValue: [],
    recycleProvince: '',
    recycleAddress: '',
    recycleContact: '',
    recycleContactPhone: '',
    contactType: 1,
    contact: '',
    contactPhone: '',
    ifTestEquipment: 0,
    relevanceOrderCode: '',
    postMethod: '1',
    addressId: '',
    postPayment: '1',
    homeSamplingAddress: '',
    detailedAddress: '',
    samplingContact: '',
    samplingContactPhone: '',
    onSiteSamplingDate: '',
    onSiteSamplingTime: '',
    onSiteSamplingRemark: ''
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
//邮寄方式
const post_method_options = [
    { label: '自行邮寄', value: '1' },
    { label: '上门取样', value: '2' },
    { label: '自己送样', value: '3' },
]
//运费支付方式
const post_payment_options = [
    { label: '运费到付', value: 1 },
    { label: '运费自付', value: 2 },
]
//上门取样时间段
const time_options = [
    { label: '9:00 ~ 12:00', value: '9:00 ~ 12:00' },
    { label: '14:00 ~ 18:00', value: '14:00 ~ 18:00' },
]

//初始化页面数据
async function init() {
    loading.value = true
    await getActives()
    await getUserOtherInfo()
    await getUnitList()
    loading.value = false
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

//获取用户其他信息
async function getUserOtherInfo() {
    try {
        const res = await useGetUserOtherInfo(user_info.clientId)
        user_other_info.value = res.data
    }
    catch(err) {
        console.log(err)
    }
}

//获取区域列表
async function getUnitList() {
    try {
        const params = {
            type: 1,
        }
        const res = await useGetUnitList(params)
        if(res.data) {
            unit_list.value = res.data.filter(item => item.unitId == user_info.unitId)
            service_data.value.addressId = service_data.value.addressId ? service_data.value.addressId : unit_list.value[0].unitId
        } else {
            service_data.value.addressId = ''
        }
    }
    catch(err) {
        console.log(err)
        service_data.value.addressId = ''
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
        service_data.value.provinceCode = ''
        service_data.value.recycleProvince = ''
        service_data.value.recycleAddress = ''
        service_data.value.recycleContact = ''
        service_data.value.recycleContactPhone = ''
    }
}
//把区域码转成汉字
function getCodeToText(value) {
    let name = ''
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

//更改【邮寄方式】
function changePostMethod(value) {
    if(service_data.value.postMethod == value) return
    service_data.value.postMethod = value
    if(value == 1) {
        service_data.value.addressId = unit_list.value.length ? unit_list.value[0].unitId : ''
        service_data.value.postPayment = 1
        service_data.value.homeSamplingAddress = ''
        service_data.value.detailedAddress = ''
        service_data.value.samplingContact = ''
        service_data.value.samplingContactPhone = ''
        service_data.value.onSiteSamplingDate = ''
        service_data.value.onSiteSamplingTime = ''
        service_data.value.onSiteSamplingRemark = ''
    } else if(value == 2) {
        service_data.value.addressId = ''
        service_data.value.postPayment = ''
        service_data.value.homeSamplingAddress = user_other_info.value.lastHomeSamplingAddress
        service_data.value.detailedAddress = user_other_info.value.lastDetailedAddress
        service_data.value.samplingContact = user_other_info.value.lastSamplingContact
        service_data.value.samplingContactPhone = user_other_info.value.lastSamplingContactPhone
        service_data.value.onSiteSamplingDate = dayjs().format('YYYY-MM-DD')
        service_data.value.onSiteSamplingTime = user_other_info.value.lastOnSiteSamplingTime || '9:00 ~ 12:00'
        service_data.value.onSiteSamplingRemark = user_other_info.value.lastOnSiteSamplingRemark
    } else if(value == 3) {
        service_data.value.addressId = unit_list.value.length ? unit_list.value[0].unitId : ''
        service_data.value.postPayment = ''
        service_data.value.homeSamplingAddress = ''
        service_data.value.detailedAddress = ''
        service_data.value.samplingContact = ''
        service_data.value.samplingContactPhone = ''
        service_data.value.onSiteSamplingDate = ''
        service_data.value.onSiteSamplingTime = ''
        service_data.value.onSiteSamplingRemark = ''
    }
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
            <div class="service-box-content" v-loading="loading">
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
        <div class="service-box">
            <div class="service-box-head flex-center">
                <div class="flex-center">
                    <div class="slider"></div>
                    <span class="font-middle font-600">物流信息</span>
                </div>
            </div>
            <div class="service-box-content" v-loading="loading">
                <div class="fieId-style">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>邮寄方式</span>
                        </div>
                        <div class="fieId-content">
                            <div class="radio" :class="{'radio-active': item.value == service_data.postMethod}" v-for="item in post_method_options" :key="item.value" @click="changePostMethod(item.value)">{{ item.label }}</div>
                        </div>
                    </div>
                </div>
                <div class="fieId-style" v-show="service_data.postMethod == 1 || service_data.postMethod == 3">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>样品寄送地址</span>
                        </div>
                        <div class="fieId-content">
                            <div class="radio" :class="{'radio-active': item.unitId == service_data.addressId}" v-for="item in unit_list" :key="item.unitId" @click="service_data.addressId = item.unitId">{{ item.unitName }}</div>
                        </div>
                    </div>
                </div>
                <div class="info-card" v-show="service_data.postMethod == 1 || service_data.postMethod == 3">
                    <div class="card-line">
                        <div class="line-title">寄送地址</div>
                        <div class="line-content">{{ unit_list.find(i => i.unitId == service_data.addressId)?.deliveryAddress }}</div>    
                    </div>
                    <div class="card-line">
                        <div class="line-title">联系人</div>
                        <div class="line-content">{{ unit_list.find(i => i.unitId == service_data.addressId)?.deliveryLeader }}</div>    
                    </div>
                    <div class="card-line">
                        <div class="line-title">联系方式</div>
                        <div class="line-content">{{ unit_list.find(i => i.unitId == service_data.addressId)?.deliveryPhone }}</div>    
                    </div>
                </div>
                <div class="fieId-style" v-show="service_data.postMethod == 1">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>运费支付</span>
                        </div>
                        <div class="fieId-content">
                            <div class="radio" :class="{'radio-active': item.value == service_data.postPayment}" v-for="item in post_payment_options" :key="item.value" @click="service_data.postPayment = item.value">{{ item.label }}</div>
                        </div>
                    </div>
                </div>
                <div class="fieId-style" v-show="service_data.postMethod == 2">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>上门取样地址</span>
                        </div>
                        <div class="fieId-content">
                            <el-input v-model="service_data.homeSamplingAddress" placeholder="请输入上门取样地址"/>
                        </div>
                    </div>
                </div>
                <div class="fieId-style" v-show="service_data.postMethod == 2">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>详细地址</span>
                        </div>
                        <div class="fieId-content">
                            <el-input v-model="service_data.detailedAddress" placeholder="请输入详细地址"/>
                        </div>
                    </div>
                </div>
                <div class="fieId-style" v-show="service_data.postMethod == 2">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>上门取样联系人</span>
                        </div>
                        <div class="fieId-content">
                            <el-input v-model="service_data.samplingContact" placeholder="请输入上门取样联系人"/>
                        </div>
                    </div>
                </div>
                <div class="fieId-style" v-show="service_data.postMethod == 2">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>取样联系人电话</span>
                        </div>
                        <div class="fieId-content">
                            <el-input v-model="service_data.samplingContactPhone" placeholder="请输入取样联系人电话"/>
                        </div>
                    </div>
                </div>
                <div class="fieId-style" v-show="service_data.postMethod == 2">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>上门取样时间</span>
                        </div>
                        <div class="fieId-content">
                            <el-date-picker v-model="service_data.onSiteSamplingDate" type="date" placeholder="请选择上门取样时间"/>
                        </div>
                    </div>
                </div>
                <div class="fieId-style" v-show="service_data.postMethod == 2">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span><span class="font-FF4A2B">*</span>选择时间段</span>
                        </div>
                        <div class="fieId-content">
                            <div class="radio" :class="{'radio-active': item.value == service_data.onSiteSamplingTime}" v-for="item in time_options" :key="item.value" @click="service_data.onSiteSamplingTime = item.value">{{ item.label }}</div>
                        </div>
                    </div>
                </div>
                <div class="fieId-style" v-show="service_data.postMethod == 2">
                    <div class="fieId-box">
                        <div class="fieId-label">
                            <span>上门取样备注</span>
                        </div>
                        <div class="fieId-content">
                            <el-input v-model="service_data.onSiteSamplingRemark" size="small" type="textarea"  :rows="4" placeholder="请填写上门取样备注" :maxlength="200" show-word-limit></el-input>
                        </div>
                    </div>
                </div>
            </div>
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
    min-width: 140px;
}

.service {
    column-gap: 15px;
    align-items: stretch;
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
}

</style>