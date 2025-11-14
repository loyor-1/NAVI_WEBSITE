<script setup>
import { ref } from 'vue'
import { useUploadPaymentVoucher } from '@/api'
import uploadText from '@/components/upload_text.vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['refresh'])

const loading = ref(true)
const ref_upload = ref(null)
const invoice_info = ref({})//发票详情信息

const upload_data = ref({
    invoiceId: null,  
    invoiceAmount: 0.0,
    uploadPaymentVoucherList: []
})

function initInfo(info) {
    invoice_info.value = info
    upload_data.value.invoiceId = info.invoiceId
    upload_data.value.invoiceAmount = info.invoiceAmount
    loading.value = false
}

function getFile(file) {
    upload_data.value.uploadPaymentVoucherList = file.map(item => {
        const regex = /^\/dev-file/
        item.url = item.url.replace(regex, '')
        return item
    });
}

async function handleSubmit() {
    ref_upload.value.getFile()
    if (upload_data.value.uploadPaymentVoucherList.length > 0) {
        await useUploadPaymentVoucher(upload_data.value)
        emit('refresh', '提交成功！请您耐心等待，我们会在1-3个工作日内进行核销', 3000)
    } else {
        ElMessage.error('请上传打款凭证！')
    }
}

defineExpose({
    initInfo,
})
</script>

<template>
    <div class="child-main flex-center-col" v-loading="loading">
        <div class="flex-center info-box">
            <div class="info-title">打款金额：</div>
            <div class="info-content font-FF4A2B">￥ {{ invoice_info.invoiceAmount }}</div>
        </div>
        <div class="flex-center info-box">
            <div class="info-title">上传打款凭证：</div>
            <div class="info-content">
                <uploadText
                  ref="ref_upload"
                  :fileList="upload_data.uploadPaymentVoucherList"
                  :limit="10"
                  @getFile="getFile"
                ></uploadText>
            </div>
        </div>
        <div class="button-box flex-center">
            <div class="custom-button" @click="handleSubmit">确认提交</div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.child-main {
    position: relative;
    row-gap: 30px;
    justify-content: flex-start;
    align-items: flex-start;
    height: 100%;
    padding: 50px 80px 15px;
}

.info-box {
    justify-content: flex-start;
    width: 100%;
    .info-title {
        width: 150px;
    }
    .info-content {
        width: calc(100% - 150px);
    }
}

.button-box {
    width: 100%;
    .custom-button {
        width: 200px;
        height: 40px;
    }
}

</style>