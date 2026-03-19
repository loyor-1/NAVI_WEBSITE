<script setup>
import dayjs from "dayjs"
import duration from 'dayjs/plugin/duration'
import { useGetOrderInfo, useGetDownLoadUrl } from "@/api"
import { computed, ref, getCurrentInstance } from "vue"
import { ElMessageBox, ElMessage } from 'element-plus';
import { timeFormat } from "@/utils/format.js"
import { getUserInfo } from '@/utils/auth'

const user_info = getUserInfo()//用户信息
const instance = getCurrentInstance()// 获取当前组件实例

dayjs.extend(duration)
const emit = defineEmits(['downloadResult'])

const props = defineProps({
    height: {
        type: String,
        default: '100vh - 290px'
    }
})

const imgurl = import.meta.env.VITE_FILE_API
const order_info_loading = ref(false)
const export_experiment_loading = ref(false)
const order_status = ref('')// 订单状态
const timeout = ref('')//倒计时---秒数
const count_timer = ref(null)//倒计时--计时器
const global_info = ref([])//全局字段数据
const groups_info = ref([])//样品组字段数据
const file_list = ref([])//附件列表
//订单详情
const order_info = ref({
    equipmentSubscribe: {},
})

const appointment_start_date = computed(() => {
    let str = ''
    if(order_info.value.equipmentSubscribe) {
        str = order_info.value.equipmentSubscribe.appointmentStartDate || '--'
    } else {
        str = '--'
    }
    return str
})

const post_method = computed(() => {
	let string_1 = ''
	let string_2 = ''
	switch(order_info.value.postMethod) {
		case 1:
		    string_1 = '自行邮寄'
			if(order_info.value.postPayment == 1) {
				string_2 = '/运费到付'
			} else if(order_info.value.postPayment == 2) {
				string_2 = '/运费自付'
			}
			break
		case 2:
		    string_1 = '上门取样'
			break
		case 3:
		    string_1 = '自己送样'
			break
	}
	return string_1 + string_2
})

const address_info = computed(() => {
    let string = ''
	switch(order_info.value.postMethod) {
		case 1:
		    string = `${order_info.value.deliveryLeader}: ${order_info.value.deliveryPhone} ${order_info.value.deliveryAddress}`
			break
		case 2:
		    string = `${order_info.value.samplingContact}: ${order_info.value.samplingContactPhone} ${order_info.value.homeSamplingAddress + order_info.value.detailedAddress}`
			break
		case 3:
		    string = `${order_info.value.deliveryLeader}: ${order_info.value.deliveryPhone} ${order_info.value.deliveryAddress}`
			break
	}
	return string
})

// 获取订单详情
async function getOrderInfo(orderId) {
    order_info_loading.value = true
    const res = await useGetOrderInfo(orderId)
    res.data.equipmentPic = imgurl + res.data.equipmentFileList[0].url
    res.data.detectionDuration = res.data.equipmentSubscribe.duration
    res.data.appointmentStartDate = res.data.equipmentSubscribe.appointmentStartDate
    res.data.appointmentEndDate = res.data.equipmentSubscribe.appointmentEndDate
    order_info.value = res.data
    // 访问全局函数（通过 instance.appContext.config.globalProperties）
    order_status.value = instance.appContext.config.globalProperties.getDictLabel('order_status', order_info.value.status)
    let count = undefined
    let startTime = undefined
	let timeEnd = undefined
	let now = undefined
    let timeDifference = undefined
    if(order_status.value == '待支付' || order_status.value == '待审核') {
		startTime = dayjs(order_info.value.addDate)
		timeEnd = startTime.add(7, 'day')
		now = dayjs()
		timeDifference = dayjs.duration(timeEnd.diff(now))
		count = Math.ceil(timeDifference.asSeconds())
		count_timer.value = setInterval(() => {
			if(count >= 1) {
				count -= 1
				timeout.value = `${timeFormat(count).day}天 ${timeFormat(count).hours}:${timeFormat(count).minutes}:${timeFormat(count).seconds}`
			}else {
				clearInterval(count_timer.value)
			}
		}, 1000)
	}else if(order_status.value == '待核对') {
		startTime = dayjs(order_info.value.experimentEndDate)
		timeEnd = startTime.add(3, 'day')
		now = dayjs()
		timeDifference = dayjs.duration(timeEnd.diff(now))
		count = Math.ceil(timeDifference.asSeconds())
		count_timer.value = setInterval(() => {
			if(count >= 1) {
				count -= 1
				timeout.value = `${timeFormat(count).day}天 ${timeFormat(count).hours}:${timeFormat(count).minutes}:${timeFormat(count).seconds}`
			}else {
				clearInterval(count_timer.value)
			}
		}, 1000)
	}
    const global_list = res.data.equipmentSubscribe.globalFieldValues
	const groups_list = res.data.equipmentSubscribe.groups
	//处理全局字段
	const norender_ist = [8,11,13]
	global_list.forEach(item => {
		if(!norender_ist.includes(item.fieIdType)) {
			if(item.fieIdType == 9) {
				global_info.value.push({label: item.fieIdName, value: `${item.fieIdValue} ~ ${item.fieldValueRange}`})
			} else if(item.fieIdType == 12 && item.fieldGroupValues) {
				item.fieldGroupValues.forEach(item_ => {
					if(item_.fieIdType == 9) {
						global_info.value.push({label: item_.fieIdName, value: `${item_.fieIdValue} ~ ${item_.fieldValueRange}`})
					} else {
						global_info.value.push({label: item_.fieIdName, value: item_.fieIdValue})
					}
				})
			} else {
				global_info.value.push({label: item.fieIdName, value: item.fieIdValue})
			}
		}
	})
    //处理字段组字段
	groups_list.forEach(groups_list_item => {
		const obj = {
			group_name: groups_list_item.sampleName + '组样品信息',
			group_data: []
		}
		if(groups_list_item.values) {
			groups_list_item.values.forEach(item => {
				if(!norender_ist.includes(item.fieIdType)) {
					if(item.fieIdType == 9) {
						obj.group_data.push({label: item.fieIdName, value: `${item.fieIdValue} ~ ${item.fieldValueRange}`})
					} else if(item.fieIdType == 12 && item.fieldGroupValues) {
						item.fieldGroupValues.forEach(item_ => {
							if(item_.fieIdType == 9) {
								obj.group_data.push({label: item_.fieIdName, value: `${item_.fieIdValue} ~ ${item_.fieldValueRange}`})
							} else {
								obj.group_data.push({label: item_.fieIdName, value: item_.fieIdValue})
							}
						})
					} else {
						obj.group_data.push({label: item.fieIdName, value: item.fieIdValue})
					}
				}
			})
		}
		groups_info.value.push(obj)
	})
    //处理附件列表
    file_list.value = res.data.equipmentSubscribe.fileList.map(item => {
		return {
			label: item.name,
			url: imgurl + item.url
		}
	})
    order_info_loading.value = false
}

//下载附件
async function downloadFile(data) {
    if(data.url.includes("statics/")){
        const fileName = data.label
        if ('download' in document.createElement('a')) {
            //非IE下载
            const a = document.createElement('a')
            a.download = fileName.replace(new RegExp('"', 'g'), '')
            a.style.display = 'none'
            a.href = data.url
            document.body.appendChild(a)
            a.click()
            URL.revokeObjectURL(a.href) //释放URL 对象
            document.body.removeChild(a) //删掉a标签
        } else {
            ElMessage({
                message: '不支持IE浏览器下载数据文件，请使用其他浏览器',
                type: 'warning',
            })
        }
    } else {
        let obj = {
            key: data.url,
            attname: data.label
        }
        const res = await useGetDownLoadUrl(obj)
        const url = res.msg
        window.open(url, '_blank')
    }
}

//下载实验结果
async function downloadResult(data) {
    emit('downloadResult', data)
}

//导出预约单信息
function exportExperiment() {
    export_experiment_loading.value = true
    ElMessageBox.confirm(
        '请将下载的PDF打印，与样品一起寄出！',
        '温馨提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        await instance.appContext.config.globalProperties.download.getDownLoadXls('/file/communal/download/client/exportExperimentData/'+ order_info.value.orderId)
        export_experiment_loading.value = false
    }).catch(() => {
        export_experiment_loading.value = false
    });
}

defineExpose({ getOrderInfo })
</script>

<template>
    <!-- 订单详情 -->
    <el-card class="container" :style="{height: `calc(${height})`}" v-loading="order_info_loading" shadow="never">
        <el-scrollbar>
            <div :style="{height: `calc(${height} - 50px)`}">
                <el-card class="info-card">
                    <div class="tips" v-if="order_status == '待支付'">订单即将关闭，请及时支付</div>
		            <div class="tips" v-if="order_status == '待审核'">您的团队已开启订单审核设置，请联系团长或管理员审核订单</div>
		            <div class="tips" v-if="order_status == '待寄样'">请尽快上传物流信息</div> 
		            <div class="tips" v-if="order_status == '待取样'">取样员将在 1-3 个工作日内与您联系取样</div>
		            <div class="tips" v-if="order_status == '待实验'">预约时间：{{ appointment_start_date }}</div>
		            <div class="tips" v-if="order_status == '待核对'">实验已完成，请确认实验金额并完成支付流程</div>
		            <div class="tips" v-if="order_status == '已完成'">检测已全部完成，可 <span class="download-result" @click="downloadResult(order_info)">下载实验结果</span> 查看</div>
		            <div class="tips" v-if="order_status == '待回运'">实验已完成，请确认实验金额并完成支付流程</div>
		            <div class="tips" v-if="order_status == '售后中'">已提交客服，请耐心等候客服联系</div>
                    <div class="baseInfo-box">
                        <img class="equipment-pic" :src="order_info.equipmentPic" alt="">
                        <div class="baseInfo">
                            <div class="info-box">
                                <div class="info-box-title">订单状态</div>
                                <div class="info-box-content">
                                    <span> {{ order_status }} </span>
                                    <span style="margin-left: 15px; color: #FF4A2B;" v-if="order_status == '待支付' || order_status == '待审核' || order_status == '待核对'"> {{ timeout }} </span>
                                </div>
                            </div>
                            <div class="info-box">
                                <div class="info-box-title">订单编号</div>
                                <div class="info-box-content"> {{ order_info.orderCode || '--' }} </div>
                            </div>
                            <div class="info-box">
                                <div class="info-box-title">送样方式</div>
                                <div class="info-box-content"> {{ post_method }} </div>
                            </div>
                            <div class="info-box">
                                <div class="info-box-title">总样品数</div>
                                <div class="info-box-content"> {{ order_info.sampleNumber || '--' }} </div>
                            </div>
                            <div class="info-box">
                                <div class="info-box-title">支付方式</div>
                                <div class="info-box-content"> {{ getDictLabel('prepaid_payment', order_info.prepaidPayment) }} </div>
                            </div>
                            <div class="info-box">
                                <div class="info-box-title">下单时间</div>
                                <div class="info-box-content"> {{ order_info.addDate || '--' }} </div>
                            </div>
                            <div class="info-box">
		        		    	<div class="info-box-title">支付时间</div>
		        		    	<div class="info-box-content"> {{ order_info.orderDate || '--' }} </div>
		        		    </div>
		        		    <div class="info-box">
		        		    	<div class="info-box-title">预约检测时间</div>
		        		    	<div class="info-box-content"> {{ appointment_start_date }} </div>
		        		    </div>
		        		    <div class="info-box">
		        		    	<div class="info-box-title">完成时间</div>
		        		    	<div class="info-box-content"> {{ order_info.experimentEndDate || '--' }} </div>
		        		    </div>
		        		    <div class="info-box">
		        		    	<div class="info-box-title">结算时间</div>
		        		    	<div class="info-box-content"> {{ order_info.finishOrderDate || '--' }} </div>
		        		    </div>
		        		    <div class="info-box" v-if="order_info.recycleStatus != 1">
		        		    	<div class="info-box-title">样品回运单号</div>
		        		    	<div class="info-box-content"> {{ order_info.transportNumber || '--' }} </div>
		        		    </div>
                            <div class="info-box">
                                <div class="info-box-title"> {{ order_info.postMethod == 2 ? '取样地址：' : '收样地址：' }} </div>
                                <div class="info-box-content"> {{ address_info }} </div>
                            </div>
                        </div>
                    </div>
                </el-card>
                <el-card class="info-card">
                    <template #header>
                        <span>预约信息</span>
                    </template>
                    <div class="price">
                        <div class="info-box">
		        			<div class="info-box-title">预约单原价</div>
		        			<div class="info-box-content"> ￥{{ order_info.originalPrice }} </div>
		        		</div>
                        <div class="info-box">
		        			<div class="info-box-title" v-if="order_info.prepaidPayment"> {{ getDictLabel('prepaid_payment', order_info.prepaidPayment) }} 结算</div>
		        			<div class="info-box-title" v-else>应付</div>
		        			<div class="info-box-content"> ￥{{ order_info.totalCost }} </div>
		        		</div>
                    </div>
                    <div class="original-box">
		        		<div class="info-box" v-if="order_info.expeditedProduction">
		        			<div class="info-box-title">加急制作</div>
		        			<div class="info-box-content"> ￥{{ order_info.expeditedProduction }} </div>
		        		</div>
		        		<div class="info-box" v-if="order_info.postMethod == 1 && order_info.postPayment == 1">
		        			<div class="info-box-title">到付运费</div>
		        			<!-- <div class="info-box-content"> ￥{{ order_info.freightCollected }} </div> -->
		        			<div class="info-box-content"> ￥12 </div>
		        		</div>
		        		<div class="info-box" v-if="order_info.ifRecycle == 1 && order_info.whiteFlag != 1">
		        			<div class="info-box-title">样品回收</div>
		        			<!-- <div class="info-box-content"> ￥{{ order_info.sampleRecovery }} </div> -->
		        			<div class="info-box-content">{{ user_info.unitId == 298 ? '￥12' : '￥50' }}</div>
		        		</div>
		        		<div class="info-box" v-if="order_info.cashCoupon">
		        			<div class="info-box-title">赠送金</div>
		        			<div class="info-box-content">-￥{{ order_info.cashCoupon }} </div>
		        		</div>
		        		<div class="info-box" v-if="order_info.couponMoney">
		        			<div class="info-box-title">优惠券</div>
		        			<div class="info-box-content"> -￥{{ order_info.couponMoney }} </div>
		        		</div>
		        		<div class="info-box" v-if="order_info.discountMoney">
		        			<div class="info-box-title">使用折扣</div>
		        			<div class="info-box-content">
		        				<div v-if="order_info.discountType == 1">个人折扣</div>
		        				<div v-if="order_info.discountType == 2">团队折扣</div>
		        				<div style="margin-left: 20px">-￥{{ order_info.discountMoney }} </div>
		        			</div>
		        		</div>
                    </div>
                </el-card>
                <el-card class="info-card" v-if="order_status == '已完成' || order_status == '申请开票' || order_status == '待核对'">
                    <template #header>
                        <span>检测信息</span>
                    </template>
                    <div class="price">
                        <div class="info-box">
		        			<div class="info-box-title">预约单原价</div>
		        			<div class="info-box-content"> ￥{{ order_info.originalPrice }} </div>
		        		</div>
                        <div class="info-box">
		        			<div class="info-box-title"> {{ getDictLabel('prepaid_payment', order_info.prepaidPayment) }} 结算</div>
		        			<div class="info-box-content"> ￥{{ order_info.experimentTotalCost }} </div>
		        		</div>
                    </div>
                    <el-table :header-cell-style="{background:'#F5F5F5'}" border :data="order_info.checkItemList">
                        <el-table-column prop="detectionItemName" label="检测项目"></el-table-column>
                        <el-table-column label="单价">
                            <template #default="scope">
                                <span> ￥{{ scope.row.unitPrice }} </span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="quantity" label="数量"></el-table-column>
                        <el-table-column prop="detectionMeteringUnit" label="单位"></el-table-column>
                        <el-table-column label="小计">
                            <template #default="scope">
                                <span> ￥{{ scope.row.subtotal }} </span>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="experiment-box">
		        		<div class="info-box" v-if="order_info.expeditedProduction">
		        			<div class="info-box-title">加急制作</div>
		        			<div class="info-box-content"> ￥{{ order_info.expeditedProduction }} </div>
		        		</div>
		        		<div class="info-box" v-if="order_info.postMethod == 1 && order_info.postPayment == 1">
		        			<div class="info-box-title">到付运费</div>
		        			<!-- <div class="info-box-content"> ￥{{ order_info.freightCollected }} </div> -->
		        			<div class="info-box-content"> ￥12 </div>
		        		</div>
		        		<div class="info-box" v-if="order_info.ifRecycle == 1 && order_info.whiteFlag != 1">
		        			<div class="info-box-title">样品回收</div>
		        			<!-- <div class="info-box-content"> ￥{{ order_info.sampleRecovery }} </div> -->
		        			<div class="info-box-content">{{ user_info.unitId == 298 ? '￥12' : '￥50' }}</div>
		        		</div>
		        		<div class="info-box" v-if="order_info.experimentCashCoupon">
		        			<div class="info-box-title">赠送金</div>
		        			<div class="info-box-content">-￥{{ order_info.experimentCashCoupon }} </div>
		        		</div>
		        		<div class="info-box" v-if="order_info.experimentCoupon">
		        			<div class="info-box-title">优惠券</div>
		        			<div class="info-box-content"> -￥{{ order_info.experimentCoupon }} </div>
		        		</div>
		        		<div class="info-box" v-if="order_info.experimentDiscountMoney">
		        			<div class="info-box-title">使用折扣</div>
		        			<div class="info-box-content">
		        				<div v-if="order_info.discountType == 1">个人折扣</div>
		        				<div v-if="order_info.discountType == 2">团队折扣</div>
		        				<div style="margin-left: 20px">-￥{{ order_info.experimentDiscountMoney }} </div>
		        			</div>
		        		</div>
                        <div class="info-box" v-if="order_info.experimentalRemark">
		        			<div class="info-box-title">结束实验备注</div>
		        			<div class="info-box-content"> {{ order_info.experimentalRemark }} </div>
		        		</div>
                    </div>
                </el-card>
                <el-card class="info-card">
                    <template #header>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>预约单详情</span>
                            <el-button type="success" :loading="export_experiment_loading" @click="exportExperiment">导出PDF</el-button>
                        </div>
                    </template>
                    <div class="detection-box">
                        <div class="detection-title"> {{ order_info.equipmentName }} （ {{ order_info.orderCode }} ）</div>
                        <div style="display: flex;">
                            <div class="detection-info">
                                <div class="detection-info-title">预约检测时长</div>
                                <div class="detection-info-content"> {{ order_info.detectionDuration }} h</div>
                            </div>
                            <div class="detection-info">
                                <div class="detection-info-title">预约检测时间段</div>
                                <div class="detection-info-content"> {{ order_info.appointmentStartDate }} ~ {{ order_info.appointmentEndDate }} </div>
                            </div>
                        </div>
                        <div class="fieId-title">全局问题</div>
                        <div class="detection-info" v-for="item in global_info" :key="item.label">
                            <div class="detection-info-title">{{ item.label }}</div>
                            <div class="detection-info-content"> {{ item.value || '--' }} </div>
                        </div>
                        <div v-for="(item, index) in groups_info" :key="index">
		                	<div class="fieId-title"> {{ item.group_name }} </div>
		                	<div class="detection-info" v-for="(item_, index_) in item.group_data" :key="index_">
		                		<div class="detection-info-title"> {{ item_.label }} </div>
		                		<div class="detection-info-content"> {{ item_.value || '--' }} </div>
		                	</div>
		                </div>
                        <div class="fieId-title">附件</div>
                        <div class="file-list">
                            <div v-if="file_list.length">
                                <div class="file" v-for="(item, index) in file_list" :key="index" @click="downloadFile(item)"> {{ item.label }} </div>
                            </div>
                            <div v-else> {{ '--' }}</div>
                        </div>
                        <div class="fieId-title">实验留言</div>
		                <div class="message"> {{ order_info.equipmentSubscribe.message || '--' }} </div>
                        <div class="fieId-title">订单备注</div>
		                <div class="message"> {{ order_info.customRemark || '--' }} </div>
                    </div>
                </el-card>
            </div>            
        </el-scrollbar>
    </el-card>
</template>

<style lang="scss" scoped>
.container {
    position: relative;
    width: 100%;
    min-width: 965px;
    .info-card {
        margin-bottom: 20px;
    }
    .tips {
        text-align: left;
        margin-bottom: 15px;
        .download-result {
            cursor: pointer;
            text-decoration: underline;
        }
        .download-result:hover {
            color: #84B7F9;
        }
    }
    .info-box {
        flex: 1;
        display: flex;
        border: 1px solid #ddd;
        .info-box-title {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 120px;
            background-color: #84B7F950;
        }
        .info-box-content {
            display: flex;
            align-items: center;
            padding: 15px;
            width: calc(100% - 120px);
            min-width: 200px;
        }
    }
}

.baseInfo-box {
    display: flex;
    column-gap: 20px;
    .equipment-pic {
        width: 250px;
        height: 250px;
        border: 1px solid #ddd;
        border-radius: 10px;
    }
    .baseInfo{
        display: flex;
        row-gap: 10px;
        column-gap: 10px;
        flex-wrap: wrap;
    }
}
.price {
    display: flex;
    column-gap: 10px;
    margin-bottom: 10px;
    .info-box-content {
        font-weight: 600;
        color: #FF4A2B;
    }
}
.original-box {
    display: flex;
    row-gap: 10px;
    column-gap: 10px;
    flex-wrap: wrap;
}
.experiment-box {
    display: flex;
    row-gap: 10px;
    column-gap: 10px;
    flex-wrap: wrap;
    padding-top: 10px;
}
.detection-box {
    border: 1px solid #ddd;
    .detection-title {
        padding: 15px;
        text-align: center;
        border-bottom: 1px solid #ddd;
        background-color: #F5F5F5;
    }
    .detection-info {
        flex: 1;
        display: flex;
        border-bottom: 1px solid #ddd;
        .detection-info-title {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 200px;
            padding: 20px;
            background-color: #84B7F950;
        }
        .detection-info-content {
            display: flex;
            flex-direction: column;
            row-gap: 10px;
            justify-content: center;
            align-items: center;
            width: calc(100% - 200px);
            padding: 15px;
        }
    }
    .fieId-title {
        padding: 15px;
        border-bottom: 1px solid #ddd;
        background-color: #F5F5F5;
    }
    .message {
        padding: 15px;
        border-bottom: 1px solid #ddd;
    }
    .file-list {
        padding: 15px;
        border-bottom: 1px solid #ddd;
        .file {
            cursor: pointer; 
            text-decoration: underline; 
            color: #5CC300;
        }
    }
}
</style>