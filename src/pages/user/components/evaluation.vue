<script setup>
import uploadImage from "@/components/upload_image.vue"
import { useEvaluation } from "@/api"
import { ref } from "vue"
import { ElMessage } from "element-plus"

const emits = defineEmits(['close'])

const form_dom = ref(null)
const upload_image = ref(null)
const show = ref(false)
const loading = ref(false)
const form = ref({
    orderId: '',
    evaluateStatus: 2,
    specialityStatus: 4,
    timelinessStatus: 4,
    serviceAttitudeStatus: 4,
    evaluationRemark: "",
    evaluateList: [],
})

function init(info) {
    show.value = true
    form.value.orderId = info.orderId
}

function updateValue(list) {
    form.value.evaluateList = list
}

function submitHandle() {
    const list = ['3.5', '4', '4.5', '5', '5.5']
  	const data = {
  		...form.value,
  		specialityStatus: list[form.value.specialityStatus - 1],
  		timelinessStatus: list[form.value.timelinessStatus - 1],
  		serviceAttitudeStatus: list[form.value.serviceAttitudeStatus - 1],
  	}
    form_dom.value.validate(async valid => {
        if (valid) {
            try {
                loading.value = true
                await useEvaluation(data)
                loading.value = false
                ElMessage.success("操作成功")
                close()
            }
            catch(err) {
                loading.value = false
                console.log(err)
            }
            
        }
    })
}

function close() {
    show.value = false
    emits('close')
}

function closeDialog() {
    form.value.evaluateList = []
    upload_image.value.cleanList()
    form_dom.value.resetFields()
}

defineExpose({ init })
</script>

<template>
    <el-dialog v-model="show" width="700px" id="evaluation" :close-on-click-modal="false" :close-on-press-escape="false" append-to-body @close="closeDialog">
        <el-result icon="success"></el-result>
        <div class="eva-content">我们真诚地邀请您对我们的对接服务进行评价，以便我们改进，提供更好服务</div>
        <el-form ref="form_dom" :model="form" label-width="250px" label-position="left">
            <el-form-item label="您认为工作人员的专业性如何？" prop="specialityStatus">
                <el-rate v-model="form.specialityStatus"></el-rate>
            </el-form-item>
            <el-form-item label="工作人员的回复速度是否及时？" prop="timelinessStatus">
                <el-rate v-model="form.timelinessStatus"></el-rate>
            </el-form-item>
            <el-form-item label="您认为工作人员的服务态度如何？" prop="serviceAttitudeStatus">
                <el-rate v-model="form.serviceAttitudeStatus"></el-rate>
            </el-form-item>
            <el-form-item label="备注" prop="evaluationRemark" label-width="80px">
                <el-input type="textarea" :rows="4" v-model="form.evaluationRemark"></el-input>
            </el-form-item>
            <el-form-item label="附件" label-width="80px">
                <uploadImage ref="upload_image" :limit="3" @updateValue="updateValue"></uploadImage>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="footerBox">
                <el-button :loading="loading" type="primary" plain @click="close">取消</el-button>
                <el-button :loading="loading" type="primary" @click="submitHandle()">确认评价</el-button>
            </div>
        </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
#evaluation .el-result {
    padding: 0;
}
#evaluation .el-dialog__body {
    padding: 0 50px;
}
#evaluation .el-form-item {
    margin-bottom: 5px;
}

.eva-content {
    font-size: 15px;
    font-weight: 600;
    line-height: 40px;
}

.footerBox {
    text-align: center;
}
</style>