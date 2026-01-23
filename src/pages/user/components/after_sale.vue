<script setup>
import { useAfterSale } from "@/api"
import { ElMessage } from "element-plus"
import { ref } from "vue"

const emits = defineEmits(['refresh'])

const loading = ref(false)
const show = ref(false)
const after_safes_data = ref({})
const service_select = ref([])

const service_list = ref([
    {label: '价格疑异', value: '价格疑异'},
	{label: '实验时长不符', value: '实验时长不符'},
	{label: '样品数量不符', value: '样品数量不符'},
	{label: '实验数据缺失', value: '实验数据缺失'},
	{label: '申请复测', value: '申请复测'},
])

function init(data) {
    after_safes_data.value = data
    show.value = true
}

function close() {
    service_select.value = []
	show.value = false
}

function changeService(value) {
	const index = service_select.value.findIndex(item => item == value)
	if(index == -1) {
		service_select.value.push(value)
	}else {
		service_select.value.splice(index, 1)
	}
}

async function confirm() {
    if(!service_select.value.length) {
        ElMessage.warning('请选择售后类型')
		return
	}
	try {
		loading.value = true
	    after_safes_data.value.afterSalesDesc = service_select.value.join(',')
	    await useAfterSale(after_safes_data.value)
		close()
		ElMessage.success("售后服务申请成功！")
		loading.value = false
		emits('refresh')
	}
	catch(err) {
		console.log(err)
		loading.value = false
	}
}

defineExpose({ init })
</script>
<template>
    <el-dialog title="申请售后" width="30%" center v-model="show">
        <div class="dialog-content">
            <div>请选择下列售后缘由，便于客服快速为您解答订单疑虑（可多选）</div>
            <div class="service-type" :class="{'active': service_select.includes(item.value)}" v-for="(item, index) in service_list" :key="index" @click="changeService(item.value)"> {{ item.label }} </div>
        </div>
        <template #footer>
            <el-button :loading="loading" @click="close">取 消</el-button>
            <el-button type="primary" :loading="loading" @click="confirm">确 定</el-button>
        </template>
    </el-dialog>
</template>



<style lang="scss" scoped>
.dialog-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.service-type {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 80%;
	height: 50px;
	margin-top: 10px;
	color: #5D5D5D;
	border-radius: 12px;
	border: 1px solid #E8E8E8;
}
.active {
	font-weight: 600;
	color: #5CC300;
	border: 1px solid #5CC300;
	background-color: #5CC30010;
}
.dialog-footer {
    display: flex;
    justify-content: space-around;
    width: 80%;
    margin: 0 auto;
}
</style>