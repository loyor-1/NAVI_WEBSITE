<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useGetEquipmentInfo, useGetFieIdList, useAddOrder, useAgainOrder } from '@/api'
import { nextTick, reactive, ref, watch } from 'vue'
import { initFieIdList, changeRelevance, reduceTotalMoney, validateField } from '@/utils/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserInfo } from '@/utils/auth'
import { validPhone } from '@/utils/validate'
import serviceOrder from './service_order.vue'
import radio from './components/radio.vue'
import checkbox from './components/checkbox.vue'
import singleLine from './components/single_line.vue'
import multiLine from './components/multi_line.vue'
import richText from './components/rich_text.vue'
import integer from './components/integer.vue'
import float from './components/float.vue'
import uploadFile from './components/upload_file.vue'
import range from './components/range.vue'
import periodic from './components/periodic.vue'
import downloadFile from './components/download_file.vue'
import fieIdGroup from './components/fieId_group.vue'
import timer from './components/timer.vue'
import feeDetail from './components/dialog/fee_detail.vue'
import appointSuccess from './components/dialog/appoint_success.vue'
import mitt_bus from '@/utils/mitt_bus'


const route = useRoute()
const router = useRouter()

const user_info = getUserInfo()//用户信息
const ref_fee_detail = ref(null)
const ref_service_order = ref(null)
const appoint_success = ref(null)
const loading = ref(true)
const price_pop = ref(true)
const show_groups_box = ref(true)
const show_instructions = ref(true)
const show_global = ref(true)
const upload_code_dialog = ref(false)
const split_groups_dialog = ref(false)
const bargain_status = ref(false)
const submit_loading = ref(false)
const order_steps = ref(1)//下单步骤 1 下单字段填写页面  2 服务费用页面  3  支付页面
const equipment_info = ref({})//设备详情
const groups_fieId_list = ref([])//用于添加样品组的初始化字段
const sample_name_list = reactive(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'])// A-Z 大写字母数组
const specimen_code_index = ref(undefined)//批量导入样品编号的样品组索引
const specimen_code_text = ref('')//批量导入样品编号文本
const split_groups_index = ref(undefined)//拆分样品组的样品组索引
const split_groups_options = ref([])//被拆分的样品编号列表
const split_groups_list = ref([])//存储选中的被拆分的样品编号
const no_validate_list = ref([])//服务费用 --- 未通过校验的字段

//费用浮层显示配置
const price_pop_options = {
    options: {
        threshold: 0.45,
    },
    callback: showPricePop,
}

//预约设备接口参数
const appoint_data = ref({
    equipmentId: route.query.equipment_id,//预约设备id
	globalFieldValues: [],//全局字段列表
    //样品组数据
    groups: [
        // {
        //     show_groups: true,
        //     sampleName: "A",
        //     specimenNum: 0, //样品数量
        //     specimen_code_list: [],
        //     specimenCode: "", //样品编号
        //     specimenIngredient: "", //样品成分
        //     fieIdList: [], //配置字段列表,
        // }
    ],
    message: '',//实验留言
    customRemark: '',//订单备注
    fileList: [],//上传附件
    originalPrice: 0,//预约单原价
    totalCost: '',//订单总金额
})

watch(
    () => appoint_data.value.groups.length,
    () => {
        appoint_data.value.groups.forEach((item, index) => {
            item.sampleName = sample_name_list[index]
            item.specimen_code_list.forEach(i => {
                if(i) {
                    i.value = i.value.replace(/^([A-Z])组/, `${sample_name_list[index]}组`)
                }
            })
        })
    },
    {
        deep: true,
    }
)

watch(
    () => appoint_data.value,
    () => { reduceOrderPrice() },
    {
        deep: true,
        immediate: true,
    }
)

//获取设备详情
async function getEquipentInfo() {
    try {
        loading.value = true
        const res = await useGetEquipmentInfo(route.query.equipment_id)
        res.data.quipment_pic = import.meta.env.VITE_FILE_API + res.data.fileList[0].url
        res.data.QRCode_pic = import.meta.env.VITE_FILE_API + res.data.qrCodeFileList[0].url
        equipment_info.value = res.data
    }
    catch(err) {
        console.log(err)
    }
}
getEquipentInfo()

// 获取设备字段信息
async function getFieIdList() {
    const global_params = {
        equipmentId: route.query.equipment_id,
        type: 1,
    }
    const groups_params = {
        equipmentId: route.query.equipment_id,
        type: 2,
    }
    try {
        const res_global = await useGetFieIdList(global_params)
        appoint_data.value.globalFieldValues = initFieIdList(res_global.data)// 处理全局字段
        const res_groups = await useGetFieIdList(groups_params)
        if(res_groups.data && res_groups.data.length) {
            show_groups_box.value = true
            groups_fieId_list.value = initFieIdList(res_groups.data)
            if(route.query.order_id) {
                againOrder(route.query.order_id)
            } else {
                addGroup()
            }
        } else {
            show_groups_box.value = false
        }
    }
    finally{
        loading.value = false
    }
}
getFieIdList()

// 再来一单
async function againOrder(order_id) {
    const res = await useAgainOrder(order_id)
    const again_globalFieldValues = res.data.globalFieldValues
    const again_groups = res.data.groups

    appoint_data.value.globalFieldValues = appoint_data.value.globalFieldValues.map(item => {
        const data = again_globalFieldValues.find(i => i.fieIdId == item.fieIdId)
        if(data) {
            const new_item = JSON.parse(JSON.stringify(item))
            const new_data = JSON.parse(JSON.stringify(data))
            const result = {
                ...new_item, 
                ...new_data,
                show: true,
            }
            switch(data.fieIdType) {
                case 1:
                    result.optionId = new_data.valueId.split(',').map(option_i => Number(option_i))
                    break
                case 2:
                    result.optionId = new_data.valueId.split(',').map(option_i => Number(option_i))
                    break
                case 8:
                    result.fieIdValue = ''
                case 9:
                    result.fieldValueRange = new_data.fieldValueRange
                    break
                case 14:
                    result.duration = Number(new_data.fieIdValue)
                    break
            }
            return result
        } else {
            return item
        }
    })

    again_groups.forEach((item, index) => {
        addGroup()
        appoint_data.value.groups[index].specimenNum = item.specimenNum
        changeNum(item.specimenNum, 0, index)
        appoint_data.value.groups[index].specimenIngredient = item.specimenIngredient
        appoint_data.value.groups[index].fieIdList = appoint_data.value.groups[index].fieIdList.map(i => {
            const data = item.values.find(x => x.fieIdId == i.fieIdId)
            if(data) {
                const new_i = JSON.parse(JSON.stringify(i))
                const new_data = JSON.parse(JSON.stringify(data))
                const result = {
                    ...new_i, 
                    ...new_data,
                    show: true,
                }
                switch(data.fieIdType) {
                    case 1:
                        result.optionId = new_data.valueId.split(',').map(option_i => Number(option_i))
                        break
                    case 2:
                        result.optionId = new_data.valueId.split(',').map(option_i => Number(option_i))
                        break
                    case 8:
                        result.fieIdValue = ''
                    case 9:
                        result.fieldValueRange = new_data.fieldValueRange
                        break
                    case 14:
                        result.duration = Number(new_data.fieIdValue)
                        break
                }
                return result
            } else {
                return i
            }
        })
    })
}

//显示 隐藏费用详情浮层
function showPricePop(isVisible) {
    price_pop.value = !isVisible
}

//添加样品组
function addGroup() {
    appoint_data.value.groups.push({
        show_groups: true,
        sampleName: sample_name_list[appoint_data.value.groups.length],
        specimenNum: 0, //样品数量
        specimenNum_validate: true,
        specimen_code_list: [],
        specimenCode: "", //样品编号
        specimen_code_validate: true,
        specimenIngredient: "", //样品成分
        specimenIngredient_validate: true,
        fieIdList: JSON.parse(JSON.stringify(groups_fieId_list.value)), //配置字段列表，深拷贝防止引用导致页面显示异常,
    })
}

//删除样品组
function deleteGroup(group_index) {
    ElMessageBox.alert('是否删除该样品组', '温馨提示', {
        showCancelButton: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消',
    }).then(() => {
        appoint_data.value.groups.splice(group_index, 1)
    })
}

//复制样品组
function copyGroup(data) {
    const new_data = JSON.parse(JSON.stringify(data))
    const {show_groups, specimenNum, specimen_code_list, specimenCode, specimenIngredient, fieIdList} = new_data
    const obj = {
        show_groups,
        sampleName: sample_name_list[appoint_data.value.groups.length],
        specimenNum, //样品数量
        specimen_code_list,
        specimenCode, //样品编号
        specimenIngredient, //样品成分
        fieIdList, //配置字段列表,
    }
    appoint_data.value.groups.push(obj)
}

//更改全局字段的值
function updateGlobalValue(item, index, value) {
    const new_value = {
        ...item,
        ...value
    }
    appoint_data.value.globalFieldValues[index] = new_value
    appoint_data.value.globalFieldValues = changeRelevance(appoint_data.value.globalFieldValues, new_value)
}

//更改字段组字段的值
function updateGroupValue(fieId_item, group_index, fieId_index, value) {
    const new_value = {
        ...fieId_item,
        ...value
    }
    appoint_data.value.groups[group_index].fieIdList[fieId_index] = new_value
    appoint_data.value.groups[group_index].fieIdList = changeRelevance(appoint_data.value.groups[group_index].fieIdList, new_value)
}

// 更改样品数量
function changeNum(newValue, oldValue, group_index) {
    const num = newValue - oldValue
    if(num >= 0) {
        for(let i = 1; i <= num; i++) {
            appoint_data.value.groups[group_index].specimen_code_list.push({
                id: oldValue + i,
                value: `${appoint_data.value.groups[group_index].sampleName}组-${oldValue + i}`,
            })
        }
    } else {
        appoint_data.value.groups[group_index].specimen_code_list.splice(newValue, Math.abs(num))
    }
    appoint_data.value.groups[group_index].specimenCode = appoint_data.value.groups[group_index].specimen_code_list.map(i => i.value).join(',')
}

// 上传附件
function uploadOrderFile(value) {
    appoint_data.value.fileList = value.fileList
}

// 打开批量导入样品编号弹框
function openUploadCodeDialog(group_index) {
    specimen_code_index.value = group_index
    upload_code_dialog.value = true
}

// 关闭批量导入样品编号弹框
function closeUploadCodeDialog() {
    specimen_code_index.value = undefined
    specimen_code_text.value = ''
}

// 确认批量导入
function confirmUploadCode() {
    const value = specimen_code_text.value.replace(/，/g, ",")
    const list = value.split(',').map((item, index) => {
        return {
            id: index + 1,
            value: item,
        }
    })
    if(list[list.length - 1].value == '') {
        list.splice(list.length - 1, 1)
    }
    appoint_data.value.groups[specimen_code_index.value].specimen_code_list = list
    appoint_data.value.groups[specimen_code_index.value].specimenNum = list.length
    appoint_data.value.groups[specimen_code_index.value].specimenCode = list.map(i => i.value).join(',')
    upload_code_dialog.value = false
}

// 打开拆分样品组弹框
function openSplitGroupsDialog(group_index) {
    if(!appoint_data.value.groups[group_index].specimenNum) return
    split_groups_index.value = group_index
    split_groups_options.value = JSON.parse(JSON.stringify(appoint_data.value.groups[group_index].specimen_code_list))
    split_groups_dialog.value = true
}

// 关闭拆分样品组弹框
function closeSplitGroupsDialog() {
    split_groups_index.value = undefined
    split_groups_options.value = []
    split_groups_list.value = []
}

//确认拆分样品组
function confirmSplitGroups() {
    appoint_data.value.groups[split_groups_index.value].specimen_code_list = appoint_data.value.groups[split_groups_index.value].specimen_code_list.filter(item => {
        const flag = split_groups_list.value.some(i => i.id == item.id)
        if(!flag) return item
    })
    appoint_data.value.groups[split_groups_index.value].specimenNum = appoint_data.value.groups[split_groups_index.value].specimen_code_list.length
    appoint_data.value.groups[split_groups_index.value].specimenCode = appoint_data.value.groups[split_groups_index.value].specimen_code_list.map(item => item.value).join(',')
    const data = JSON.parse(JSON.stringify(appoint_data.value.groups[split_groups_index.value]))
    data.specimenNum = split_groups_list.value.length
    data.specimenCode = split_groups_list.value.map(item => item.value).join(',')
    data.specimen_code_list = split_groups_list.value
    appoint_data.value.groups.splice(split_groups_index.value, 0, data)
    split_groups_dialog.value = false
}

//计算订单金额
function reduceOrderPrice() {
    //全局字段价格
    const global_money = Number(reduceTotalMoney(appoint_data.value, 'global').total_cost)
    //样品组价格
    const groups_money = Number(reduceTotalMoney(appoint_data.value, 'groups').total_cost)
    //议价状态
    const global_bargain_status = reduceTotalMoney(appoint_data.value, 'groups').bargain_status
    const groups_bargain_status = reduceTotalMoney(appoint_data.value, 'groups').bargain_status
    bargain_status.value = global_bargain_status || groups_bargain_status
    //订单原价
    appoint_data.value.originalPrice = global_money + groups_money
    // 服务费用
    let service_money = 0
    if(appoint_data.value.ifUrgent == 1) {
        service_money += ((global_money + groups_money) * 0.5)
    }
    if(appoint_data.value.ifRecycle == 1 && !(user_info.whiteFlag == 1 && user_info.recoveryFree == 1)) {
        service_money += 50
    }
    if(appoint_data.value.postPayment == 1)  {
        service_money += 12
    }
    //统计总价格
    appoint_data.value.totalCost = (global_money + groups_money + service_money).toFixed(2)
}

//打开费用明细弹框
function openFeeDetail() {
    if(Number(appoint_data.value.totalCost)) ref_fee_detail.value.init(appoint_data.value)
}

// 滚动到指定id的div
async function scrollToTargetById(target_id) {
    await nextTick()
    // 根据变量中的 ID 获取目标元素
    const target_element = document.getElementById(target_id)

    if (target_element) {
        // 计算修正后的滚动位置（避开导航栏）
        const target_rect = target_element.getBoundingClientRect();
        const scroll_top = target_rect.top + window.scrollY - 150;

        // 执行滚动（手动控制位置更精准）
        window.scrollTo({
            top: scroll_top,
            behavior: 'smooth'
        });
    } else {
        console.warn(`未找到 ID 为 ${target_id} 的div元素`)
    }
}

// 下一步
function nextStep() {
    // mitt_bus.emit('updateFieldGroupValues') 是因为字段组的信息是单独用字段组id获取的，他的数据与appoint_data隔离开了
    try{
        const result = validateField(appoint_data.value)
        const scroll_list = []

        appoint_data.value.globalFieldValues.forEach(item => {
            const list_data = result.global_result.find(i => i.fieIdId == item.fieIdId)
            if(list_data) {
                item.validate = list_data.validate
                if(list_data.fieIdType == 12) {
                    mitt_bus.emit('updateFieldGroupValues', list_data.fieldGroupValues)
                    list_data.fieldGroupValues.forEach(i => {
                        if(!i.validate) scroll_list.push(i.fieIdId)
                    })
                } else if(!list_data.validate) {
                    scroll_list.push(list_data.fieIdId)
                }
            } else {
                item.validate = true
            }
        })
        appoint_data.value.groups.forEach((item, index) => {
            const data = result.groups_result[index]
            item.specimenNum_validate = data.specimenNum_validate
            item.specimen_code_validate = data.specimen_code_validate
            item.specimenIngredient_validate = data.specimenIngredient_validate
            if(!data.specimenNum_validate) {
                scroll_list.push(`num-${index}`)
            }
            if(!data.specimen_code_validate) {
                scroll_list.push(`code-${index}`)
            }
            if(!data.specimenIngredient_validate) {
                scroll_list.push(`ingredient-${index}`)
            }
            // 替换每个样品组内的字段校验结果
            item.fieIdList.forEach(list_i => {
                const list_data = data.fieId_list.find(i => i.fieIdId == list_i.fieIdId)
                if(list_data) {
                    list_i.validate = list_data.validate
                    if(list_data.fieIdType == 12) {
                        mitt_bus.emit('updateFieldGroupValues', list_data.fieldGroupValues)
                        list_data.fieldGroupValues.forEach(i => {
                            if(!i.validate) scroll_list.push(i.fieIdId)
                        })
                    } else if(!list_data.validate) {
                        scroll_list.push(list_data.fieIdId)
                    }
                } else {
                    list_i.validate = true
                }
            })
        })
        if(!result.validate) {
            ElMessage.error(result.message)
            if(scroll_list.length) {
                scrollToTargetById(scroll_list[0])
            }
        } else {
            order_steps.value = 2
            ref_service_order.value.init(appoint_data.value)
            window.scrollTo({
                top: 0,
                behavior: 'smooth', // 平滑滚动，可选值：auto（立即）/ smooth（平滑）
            })
        }
    }
    catch(err) {
        console.log(err)
    }
}

//上一步
function lastStep() {
    order_steps.value = 1
    window.scrollTo({
        top: 0,
        behavior: 'smooth', // 平滑滚动，可选值：auto（立即）/ smooth（平滑）
    })
}

//更新服务费用信息
function updateServiceOrder(service_data) {
    appoint_data.value = {
        ...appoint_data.value,
        ...service_data,
    }
    reduceOrderPrice()
}

// 确认预约
async function submitAppoint() {
    if(submit_loading.value) return
    submit_loading.value = true
    //校验服务费用表单，并映射未填写的字段
    const result_list = []
    if(appoint_data.value.ifRecycle == 1 && !(appoint_data.value.provinceValue && appoint_data.value.provinceCode && appoint_data.value.recycleProvince)) result_list.push('provinceValue')
    if(appoint_data.value.ifRecycle == 1 && !appoint_data.value.recycleAddress) result_list.push('recycleAddress')
    if(appoint_data.value.ifRecycle == 1 && !appoint_data.value.recycleContact) result_list.push('recycleContact')
    if(appoint_data.value.ifRecycle == 1 && !(appoint_data.value.recycleContactPhone && validPhone(appoint_data.value.recycleContactPhone))) result_list.push('recycleContactPhone')
    if(appoint_data.value.contactType == 2 && !appoint_data.value.contact) result_list.push('contact')
    if(appoint_data.value.contactType == 2 && !(appoint_data.value.contactPhone && validPhone(appoint_data.value.contactPhone))) result_list.push('contactPhone')
    if(appoint_data.value.ifTestEquipment == 1 && !appoint_data.value.relevanceOrderCode) result_list.push('relevanceOrderCode')
    if(appoint_data.value.postMethod == 2 && !appoint_data.value.homeSamplingAddress) result_list.push('homeSamplingAddress')
    if(appoint_data.value.postMethod == 2 && !appoint_data.value.detailedAddress) result_list.push('detailedAddress')
    if(appoint_data.value.postMethod == 2 && !appoint_data.value.samplingContact) result_list.push('samplingContact')
    if(appoint_data.value.postMethod == 2 && !(appoint_data.value.samplingContactPhone && validPhone(appoint_data.value.samplingContactPhone))) result_list.push('samplingContactPhone')
    if(appoint_data.value.postMethod == 2 && !appoint_data.value.onSiteSamplingDate) result_list.push('onSiteSamplingDate')
    if(appoint_data.value.postMethod == 2 && !appoint_data.value.onSiteSamplingTime) result_list.push('onSiteSamplingTime')
    const translate = {
        provinceValue: '所在省市',
        recycleAddress: '回收详细地址',
        recycleContact: '回收取样联系人',
        recycleContactPhone: '回收取样联系人电话',
        contact: '实验问题联系人',
        contactPhone: '联系人电话号码',
        relevanceOrderCode: '选择意向设备的订单',
        homeSamplingAddress: '上门取样地址',
        detailedAddress: '详细地址',
        samplingContact: '上门取样联系人',
        samplingContactPhone: '取样联系人电话',
        onSiteSamplingDate: '上门取样时间',
        onSiteSamplingTime: '选择时间段',
    }
    no_validate_list.value = result_list
    // 校验服务费用表单是否通过
    if(no_validate_list.value.length) {
        ElMessage.error(`${translate[no_validate_list.value[0]]}填写不规范`)
        scrollToTargetById(no_validate_list.value[0])
        submit_loading.value = false
        return
    }

    const order_data = JSON.parse(JSON.stringify(appoint_data.value))
    order_data.globalFieldValues = order_data.globalFieldValues.filter(item => item.show)
    order_data.groups.forEach(item => {
        item.values = item.fieIdList.filter(i => i.show)
        delete item.fieIdList
        delete item.show_groups
        delete item.specimenIngredient_validate
        delete item.specimenNum_validate
        delete item.specimen_code_validate
        delete item.specimen_code_list
    })
    try {
        order_data.orderType = equipment_info.value.isCloudScene,
        order_data.equipmentId = equipment_info.value.id,
        order_data.status = 1
        const res = await useAddOrder(order_data)
        //订单预约后需要变更status字段值为2
        order_data.status = 2
        order_data.subscribeId = res.data
        submit_loading.value = false
        if(bargain_status.value) {
            appoint_success.value.showAppointSuccess()
        } else {
            await router.push({
                path: '/pay_order',
                query: {
                    equipment_id: order_data.equipmentId
                }
            })
            mitt_bus.emit('payOrder', order_data)
        }
    }
    catch(err) {
        console.log(err)
        submit_loading.value = false
    }
}

</script>

<template>
    <div class="euipment-box flex-center">
        <div class="img-box flex-center">
            <el-image class="euipment-img" :src="equipment_info.quipment_pic">
                <template #error>
                    <img class="fail-pic" src="@/assets/img/fail_pic.png" />
                </template>
            </el-image>
        </div>
        <div class="info-box flex-center" v-loading="loading">
            <div class="font-middle font-600 font-5CC300">预约：{{ equipment_info.equipmentName }}</div>
            <div class="info-item flex-center">
                <span class="item-title">设备型号</span>
                <span class="font-5D5D5D">{{ equipment_info.equipmentModel }}</span>
            </div>
            <div class="info-item flex-center">
                <span class="item-title">预约次数</span>
                <span class="font-5D5D5D">{{ equipment_info.testsNumber }}次</span>
            </div>
            <div class="info-item flex-center">
                <span class="item-title">服务周期</span>
                <span class="font-5D5D5D">收到样品后平均{{ equipment_info.serviceDays }}个工作日完成</span>
            </div>
            <div class="info-item flex-center">
                <span class="item-title">实验员</span>
                <span class="font-5D5D5D">{{ equipment_info.testerName }}</span>
            </div>
        </div>
        <div style="flex: 1"></div>
        <div class="tips flex-center">
            <el-image class="tips-pic" :src="equipment_info.QRCode_pic">
                <template #error>
                    <img class="fail-pic" src="@/assets/img/fail_pic.png" alt="">
                </template>
             </el-image>
            <div class="multi-line-ellipsis-1 font-mini">{{ equipment_info.technicalAdvisorTextPrompts }}</div>
        </div>
    </div>
    <!-- 下单第一步 -->
    <div v-show="order_steps == 1">
        <div class="profile">
            <div class="profile-head flex-center">
                <div class="flex-center">
                    <div class="slider"></div>
                    <span class="font-middle font-600">预约须知</span>
                </div>
                <div @click="show_instructions = !show_instructions">
                    <el-icon class="caret-icon" v-if="show_instructions"><CaretTop /></el-icon>
                    <el-icon class="caret-icon" v-else><CaretBottom /></el-icon>
                </div>
            </div>
            <el-collapse-transition>
                <div v-loading="loading" v-show="show_instructions">
                    <div class="instruction show_instructions" v-html="equipment_info.testingInstructions"></div>
                </div>
            </el-collapse-transition>
        </div>
        <!-- 全局字段 -->
        <div class="profile" v-if="appoint_data.globalFieldValues.length">
            <div class="profile-head flex-center">
                <div class="flex-center">
                    <div class="slider"></div>
                    <span class="font-middle font-600">全局问题</span>
                </div>
                <div @click="show_global = !show_global">
                    <el-icon class="caret-icon" v-if="show_global"><CaretTop /></el-icon>
                    <el-icon class="caret-icon" v-else><CaretBottom /></el-icon>
                </div>
            </div>
            <el-collapse-transition>
                <div class="profile-content" v-show="show_global" v-loading="loading">
                    <div v-for="(item, index) in appoint_data.globalFieldValues" :key="item.fieIdId">
                        <!-- 单选 -->
                        <radio v-if="item.fieIdType == 1 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></radio>
                        <!-- 多选 -->
                        <checkbox v-else-if="item.fieIdType == 2 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></checkbox>
                        <!-- 单行文本 -->
                        <singleLine v-else-if="item.fieIdType == 3 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></singleLine>
                        <!-- 多行文本 -->
                        <multiLine v-else-if="item.fieIdType == 4 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></multiLine>
                        <!-- 富文本 -->
                        <richText v-else-if="item.fieIdType == 5 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></richText>
                        <!-- 整数 -->
                        <integer v-else-if="item.fieIdType == 6 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></integer>
                        <!-- 浮点数 -->
                        <float v-else-if="item.fieIdType == 7 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></float>
                        <!-- 上传附件 -->
                        <uploadFile v-else-if="item.fieIdType == 8 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></uploadFile>
                        <!-- 数字范围 -->
                        <range v-else-if="item.fieIdType == 9 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></range>
                        <!-- 元素周期表 -->
                        <periodic v-else-if="item.fieIdType == 10 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></periodic>
                        <!-- 附件下载 -->
                        <downloadFile v-else-if="item.fieIdType == 11 && item.show" :base_data="item"></downloadFile>
                        <!-- 字段组 -->
                        <fieIdGroup v-else-if="item.fieIdType == 12 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></fieIdGroup>
                        <!-- 时间 -->
                        <timer v-else-if="item.fieIdType == 14 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></timer>
                    </div>
                </div>
            </el-collapse-transition>
        </div>
        <!-- 样品组信息 -->
        <div v-if="appoint_data.groups.length && show_groups_box">
            <div class="profile" v-for="(item, group_index) in appoint_data.groups" :key="group_index">
                <div class="profile-head flex-center">
                    <div class="flex-center">
                        <div class="slider"></div>
                        <span class="font-middle font-600">{{ item.sampleName }}组样品</span>
                    </div>
                    <div class="flex-center">
                        <el-icon class="delete-icon" v-show="appoint_data.groups.length > 1" @click="deleteGroup(group_index)"><DeleteFilled /></el-icon>
                        <span class="copy-icon flex-center" @click="copyGroup(item)"><el-icon><CopyDocument /></el-icon>复制</span>
                        <el-icon class="caret-icon" v-if="item.show_groups" @click="item.show_groups = !item.show_groups"><CaretTop /></el-icon>
                        <el-icon class="caret-icon" v-else @click="item.show_groups = !item.show_groups"><CaretBottom /></el-icon>
                    </div>
                </div>
                <el-collapse-transition>
                    <div :id="`num-${group_index}`" class="profile-content" v-show="item.show_groups" v-loading="loading">
                        <div class="fieId-style">
                            <div class="fieId-box" :class="{'fieId-box-warning': !item.specimenNum_validate}">
                                <div class="fieId-label">
                                    <span class="font-FF4A2B">*</span>
                                    <span>样品数量</span>
                                </div>
                                <div class="fieId-content">
                                    <el-input-number :min="0" :step="1" step-strictly v-model="item.specimenNum" @change="(newValue, oldValue) => changeNum(newValue, oldValue, group_index)"/>
                                </div>
                                <div class="num-button-1 default-button" @click="openUploadCodeDialog(group_index)">批量导入样品编号</div>
                                <div class="num-button-2" :class="[item.specimenNum ? 'default-button' : 'disabled-button']" @click="openSplitGroupsDialog(group_index)">拆分样品组</div>
                            </div>
                        </div>
                        <div class="fieId-style">
                            <div :id="`code-${group_index}`" class="fieId-box" :class="{'fieId-box-warning': !item.specimen_code_validate}">
                                <div class="fieId-label">
                                    <span class="font-FF4A2B">*</span>
                                    <span>样品编号</span>
                                </div>
                                <div class="fieId-content">
                                    <el-scrollbar>
                                        <div class="specimen-code-box">
                                            <div class="specimen-code" v-for="i in item.specimen_code_list" :key="i.id">
                                                <el-input placeholder="请输入样品编号" v-model="i.value"/>
                                            </div>
                                        </div>
                                    </el-scrollbar>
                                </div>
                            </div>
                        </div>
                        <div class="fieId-style">
                            <div :id="`ingredient-${group_index}`" class="fieId-box" :class="{'fieId-box-warning': !item.specimenIngredient_validate}">
                                <div class="fieId-label">
                                    <span class="font-FF4A2B">*</span>
                                    <span>样品成分</span>
                                </div>
                                <div class="fieId-content">
                                    <el-input v-model="item.specimenIngredient" placeholder="请输入样品成分"/>
                                </div>
                            </div>
                        </div>
                        <div v-for="(fieId_item, fieId_index) in item.fieIdList" :key="fieId_item.fieIdId">
                            <!-- 单选 -->
                            <radio v-if="fieId_item.fieIdType == 1 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></radio>
                            <!-- 多选 -->
                            <checkbox v-else-if="fieId_item.fieIdType == 2 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></checkbox>
                            <!-- 单行文本 -->
                            <singleLine v-else-if="fieId_item.fieIdType == 3 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></singleLine>
                            <!-- 多行文本 -->
                            <multiLine v-else-if="fieId_item.fieIdType == 4 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></multiLine>
                            <!-- 富文本 -->
                            <richText v-else-if="fieId_item.fieIdType == 5 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></richText>
                            <!-- 整数 -->
                            <integer v-else-if="fieId_item.fieIdType == 6 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></integer>
                            <!-- 浮点数 -->
                            <float v-else-if="fieId_item.fieIdType == 7 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></float>
                            <!-- 上传附件 -->
                            <uploadFile v-else-if="fieId_item.fieIdType == 8 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></uploadFile>
                            <!-- 数字范围 -->
                            <range v-else-if="fieId_item.fieIdType == 9 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></range>
                            <!-- 元素周期表 -->
                            <periodic v-else-if="fieId_item.fieIdType == 10 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></periodic>
                            <!-- 附件下载 -->
                            <downloadFile v-else-if="fieId_item.fieIdType == 11 && fieId_item.show" :base_data="fieId_item"></downloadFile>
                            <!-- 字段组 -->
                            <fieIdGroup v-else-if="fieId_item.fieIdType == 12 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></fieIdGroup>
                            <!-- 时间 -->
                            <timer v-else-if="fieId_item.fieIdType == 14 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></timer>
                        </div>
                    </div>
                </el-collapse-transition>
            </div>
        </div>
    </div>

    <!-- 下单第二步 -->
    <serviceOrder v-show="order_steps == 2" ref="ref_service_order" :original_price="appoint_data.originalPrice" :user_info="user_info" :no_validate_list="no_validate_list" @updateServiceOrder="updateServiceOrder"></serviceOrder>

    <!-- 下单第三步 -->
    <div v-show="order_steps == 3">

    </div>

    <!-- 其他实验信息 -->
    <div class="profile" v-intersection="price_pop_options">
        <div class="profile-head flex-center">
            <div class="flex-center">
                <div class="slider"></div>
                <span class="font-middle font-600">其他实验信息</span>
            </div>
        </div>
        <div class="upload-file">
            <uploadFile :base_data="{fieIdName: '上传附件', validate: true}" @updateValue="uploadOrderFile"></uploadFile>
        </div>
        <div class="other-info-box">
            <div class="other-info">
                <div class="fieId-style">
                    <div class="fieId-box">
                        <div class="fieId-label">实验留言</div>
                        <div class="fieId-content">
                            <el-input type="textarea" resize="none" :rows="4" placeholder="请输入实验留言" v-model="appoint_data.message"/>
                        </div>
                    </div>
                </div>
                <div class="fieId-style">
                    <div class="fieId-box">
                        <div class="fieId-label">订单备注</div>
                        <div class="fieId-content">
                            <el-input type="textarea" resize="none" :rows="4" placeholder="请输入订单备注(可输入结算项目名称)" v-model="appoint_data.customRemark"/>
                        </div>
                    </div>
                </div>
            </div>
            <div class="button-box">
                <div class="flex-center-col price" @click="openFeeDetail">
                    <div class="flex-center">
                        <span class="font-5D5D5D font-600">合计费用： </span>
                        <span v-if="bargain_status">待议价</span>
                        <span class="font-FF4A2B font-middle" v-else>￥{{ appoint_data.totalCost }}</span>
                        <img class="gold" src="@/assets/svg/money.svg" alt="">
                    </div>
                    <div class="font-mini font-5D5D5D desc" v-if="Number(appoint_data.totalCost)">点击查看费用详情</div>
                </div>
                <div v-loading="submit_loading" class="default-button" v-if="order_steps == 1 && show_groups_box" @click="addGroup">添加样品</div>
                <div v-loading="submit_loading" class="custom-button" v-if="order_steps == 1" @click="nextStep">下一步</div>
                <div v-loading="submit_loading" class="default-button" v-if="order_steps == 2" @click="lastStep">上一步</div>
                <div v-loading="submit_loading" class="custom-button" v-if="order_steps == 2" @click="submitAppoint">确认预约</div>
            </div>
        </div>
    </div>

    <!-- 总费用浮层 -->
    <div v-show="price_pop" class="price-pop flex-center">
        <div class="flex-center">
            <span class="font-5D5D5D font-600">合计费用： </span>
            <span v-if="bargain_status">待议价</span>
            <span class="font-FF4A2B font-middle" v-else>￥{{ appoint_data.totalCost }}</span>
            <img class="gold" src="@/assets/svg/money.svg" alt="">
            <div class="font-5D5D5D desc" style="margin-left: 10px;" @click="openFeeDetail">点击查看费用详情</div>
        </div>
        <div class="pop-button flex-center">
            <div v-loading="submit_loading" class="default-button" v-if="order_steps == 1 && show_groups_box" @click="addGroup">添加样品</div>
            <div v-loading="submit_loading" class="custom-button" v-if="order_steps == 1" @click="nextStep">下一步</div>
            <div v-loading="submit_loading" class="default-button" v-if="order_steps == 2" @click="lastStep">上一步</div>
            <div v-loading="submit_loading" class="custom-button" v-if="order_steps == 2" @click="submitAppoint">确认预约</div>
        </div>
    </div>

    <!-- 费用明细弹框 -->
    <feeDetail ref="ref_fee_detail"></feeDetail>
    <!-- 批量导入样品编号 -->
    <el-dialog
      class="upload-code-dialog"
      title="批量导入样品编号"
      v-model="upload_code_dialog"
      :close-on-click-modal="false"
      width="650px"
      top="200px"
      @close="closeUploadCodeDialog"
    >
        <div class="upload-code-tips">
          <div>1、不支持特殊符号；</div>
          <div>2、多个样品编号请用逗号（“，”）区分；</div>
          <div>3、样品编号将按照您填写的顺序进行自动匹配；</div>
        </div>
        <el-input type="textarea" :rows="5" placeholder="请输入样品编号" v-model="specimen_code_text"></el-input>
        <template #footer>
            <el-button @click="upload_code_dialog = false">取 消 导 入</el-button>
            <el-button type="success" :disabled="!specimen_code_text" @click="confirmUploadCode">确 定 导 入</el-button>
        </template>
    </el-dialog>
    <!-- 拆分样品组弹框 -->
    <el-dialog
      title="拆分样品组"
      v-model="split_groups_dialog"
      :close-on-click-modal="false"
      width="700px"
      top="200px"
      @close="closeSplitGroupsDialog"
    >
        <el-checkbox-group v-model="split_groups_list">
            <el-scrollbar>
                <div class="split-box">
                    <el-checkbox v-for="item in split_groups_options" :key="item.id" :label="item" border>{{ item.value }}</el-checkbox>
                </div>
            </el-scrollbar>
        </el-checkbox-group>
        <template #footer>
            <el-button @click="split_groups_dialog = false">取 消 拆 分</el-button>
            <el-button type="success" :disabled="!split_groups_list.length || (split_groups_list.length == split_groups_options.length)" @click="confirmSplitGroups">确 定 拆 分</el-button>
        </template>
    </el-dialog>
    <!-- 预约成功弹框 -->
    <appointSuccess ref="appoint_success" :appoint_data="appoint_data"></appointSuccess>
</template>

<style lang="scss" scoped>
.multi-line-ellipsis-1 {
    text-align: center;
}
:deep(.specimen-code .el-input__wrapper) {
    background-color: #94C9FF30 !important;
}
.gold {
    width: 50px;
    height: 50px;
    margin-left: 5px;
}
.desc {
    cursor: pointer;
    user-select: none;
    text-decoration: underline;
}

.euipment-box {
    justify-content: space-between;
    column-gap: 15px;
    width: 80vw;
    min-width: 1440px;
    margin: 10px auto 0;
    padding: 15px;
    border-radius: 10px;
    background-color: #FFFFFF;
    .img-box {
        width: 12vw;
        min-width: 172px;
        height: 12vw;
        min-height: 172px;
        border-radius: 12px;
        background: url('@/assets/img/equipment_background.png');
        background-size: cover;
        background-color: transparent;
        .euipment-img {
            width: 12vw;
            min-width: 172px;
            height: 12vw;
            min-height: 172px;
        }
    }
    .info-box {
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-around;
        width: 25vw;
        min-width: 360px;
        height: 12vw;
        min-height: 172px;
        padding: 0 15px;
        .info-item {
            justify-content: flex-start;
            width: 100%;
            .item-title {
                width: 30%;
            }
        }
    }
    .tips {
        flex-direction: column;
        justify-content: space-around;
        width: 10vw;
        min-width: 144px;
        height: 11vw;
        min-height: 158px;
        .tips-pic {
            width: 10vw;
            min-width: 144px;
            height: 10vw;
            min-height: 144px;
            border: 1px solid #E8E8E8;
            border-radius: 10px;
            background-color: #11111150;
        }
    }
}

.profile {
    width: 80vw;
    min-width: 1440px;
    margin: 10px auto 0;
    border-radius: 10px;
    background-color: #FFFFFF;
    .profile-head {
        justify-content: space-between;
        padding: 15px;
        width: 80vw;
        min-width: 1440px;
        background-color: #94C9FF30;
        .slider {
            width: 10px;
            height: 2rem;
            margin-right: 15px;
            background-color: #94C9FF;
        }
        .delete-icon {
            cursor: pointer;
            transform: scale(1.2);
            margin-right: 15px;
            color: #FF4A2B;
        }
        .copy-icon {
            cursor: pointer;
            margin-right: 15px;
        }
        .copy-icon:hover {
            color: #5CC300;
        }
        .caret-icon {
            cursor: pointer;
            transform: scale(2);
            margin-right: 15px;
        }
    }
    .instruction {
        overflow: auto;
        max-height: 350px;
        padding: 15px;
    }
    .profile-content {
        display: flex;
        flex-direction: column;
        width: 80vw;
        min-width: 1440px;
        height: fit-content;
        padding: 15px;
    }
    .specimen-code-box {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        max-height: 200px;
    }
    .num-button-1 {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 180px;
        width: 160px;
        height: 35px;
    }
    .num-button-2 {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 10px;
        width: 160px;
        height: 35px;
    }
    .upload-file {
        padding: 15px;
        padding-bottom: 0;
    }
    .other-info-box {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        width: 80vw;
        min-width: 1440px;
        padding: 15px;
        .other-info {
            display: flex;
            flex-direction: column;
            row-gap: 15px;
            width: 75%;
            min-width: 1080px;
        }
        .button-box {
            display: flex;
            flex-direction: column;
            row-gap: 15px;
            width: 20%;
            min-width: 288px;
            height: 100%;
            padding-bottom: 10px;
            .price {
                cursor: pointer;
                height: 80px;
                border: 1px solid #C8C9CC;
                border-radius: 5px;
            }
            .default-button {
                height: 60px;
            }
            .custom-button {
                height: 60px;
            }
        }
    }
}

.price-pop {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    justify-content: space-between;
    width: 80vw;
    min-width: 1440px;
    padding: 10px 20px;
    border: 1px solid #cccccc;
    border-radius: 10px;
    background-color: #FFFFFF;
    .pop-button {
        column-gap: 20px;
        .default-button {
            width: 100px;
            height: 40px;
        }
        .custom-button {
            width: 100px;
            height: 40px;
        }
    }
}

.upload-code-tips {
    margin-bottom: 10px;
    padding: 10px;
    background-color: #FFF8EB;
}

.split-box {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    max-height: 300px;
}
</style>
