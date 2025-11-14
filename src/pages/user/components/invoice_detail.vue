<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { useGetInvoiceInfo, useGetInvoiceApplyLogList } from '@/api'

const instance = getCurrentInstance()
const loading = ref(true)
const invoice_info = ref({})//发票详情信息
const log_list = ref([])//开票记录列表

const invoice_status = computed(() => {
    if(invoice_info.value.invoiceStatus == 1) {
		return '开票中'
	} else if(invoice_info.value.invoiceStatus == 3) {
		return '已开票'
	} else if((invoice_info.value.invoiceStatus == 4 && (invoice_info.value.invoiceResultStatus == 1 || !invoice_info.value.invoiceResultStatus)) || invoice_info.value.invoiceStatus == 6) {
		return '开票失败'
	} else if(invoice_info.value.invoiceStatus == 4 && invoice_info.value.invoiceResultStatus == 2) {
		return '已销毁'
	}
})

async function initInfo(info) {
    const res = await useGetInvoiceInfo(info.invoiceId)
    invoice_info.value = res.data
    const res_log = await useGetInvoiceApplyLogList(info.invoiceId)
    log_list.value = res_log.rows
    loading.value = false
    console.log(invoice_info.value)
}

async function fileHandle(list,name) {
    loading.value = true
    if (list.length > 0) {
        let obj = {
            businessName: name,
            businessIds: list.map(item => item.fileId).toString(),
            businessType: 2
        }
        await instance.appContext.config.globalProperties.download.getDownLoadXls('/file/communal/download/fileZipDownload', obj)
    }
    loading.value = false
}

defineExpose({
    initInfo,
})
</script>

<template>
<div v-loading="loading">
    <el-card class="info-card">
        <template #header>
            <span>开票结果</span>
        </template>
        <div class="info-content">
            <div class="info-box">
    	    	<div class="info-box-title">开票状态</div>
    	    	<div class="info-box-content"> {{ invoice_status }} </div>
    	    </div>
            <div class="info-box" v-if="!invoice_info.invoiceResultVOS || invoice_info.invoiceResultVOS.length == 0">
    	    	<div class="info-box-title">开票结果</div>
    	    	<div class="info-box-content font-5D5D5D">暂无开票结果信息</div>
    	    </div>
            <el-card class="info-card" v-for="(item, index) in invoice_info.invoiceResultVOS" :key="item.invoiceId">
                <template #header>
                    <span>发票{{ index + 1 }}</span>
                </template>
                <div class="info-content">
                    <div class="info-box">
            	    	<div class="info-box-title">开票金额</div>
            	    	<div class="info-box-content font-FF4A2B">￥ {{ item.invoiceMoney || '--' }} 元</div>
            	    </div>
                    <div class="info-box">
            	    	<div class="info-box-title">发票号</div>
            	    	<div class="info-box-content"> {{ item.invoiceCode || '--' }} </div>
            	    </div>
                    <div class="info-box">
            	    	<div class="info-box-title">开票日期</div>
            	    	<div class="info-box-content"> {{ item.invoiceDate || '--' }} </div>
            	    </div>
                    <div class="info-box">
            	    	<div class="info-box-title">发票附件</div>
            	    	<div class="info-box-content">
                            <span class="link-text" v-if="item.invoiceFileList && item.invoiceFileList.length" @click="fileHandle(item.invoiceFileList, `【发票${index + 1}】附件`)">发票附件</span>
                            <span v-else>--</span>
                        </div>
            	    </div>
                </div>
            </el-card>
        </div>
    </el-card>
    <el-card class="info-card">
        <template #header>
            <span>开票信息</span>
        </template>
        <div class="info-content">
            <div class="info-box">
    	    	<div class="info-box-title">发票类型</div>
    	    	<div class="info-box-content"> {{ getDictLabel('invoice_type', invoice_info.invoiceType) }} </div>
    	    </div>
            <div class="info-box">
    	    	<div class="info-box-title">开票金额</div>
    	    	<div class="info-box-content font-FF4A2B">￥ {{ invoice_info.invoiceAmount }} 元</div>
    	    </div>
            <div class="info-box">
    	    	<div class="info-box-title">需报账资料</div>
    	    	<div class="info-box-content" v-if="invoice_info.accountingInformation">
                    <span class="link-text" v-if="invoice_info.accountingListInfoList && invoice_info.accountingListInfoList.length" @click="fileHandle(invoice_info.accountingListInfoList,'电子版测试清单')">电子版测试清单</span>
                    <span class="link-text" v-if="invoice_info.accountingContractInfoList && invoice_info.accountingContractInfoList.length" @click="fileHandle(invoice_info.accountingContractInfoList,'电子合同')">电子合同</span>
                    <span class="link-text" v-if="invoice_info.accountingReportInfoList && invoice_info.accountingReportInfoList.length" @click="fileHandle(invoice_info.accountingReportInfoList,'电子报告')">电子报告</span>
                    <span class="link-text" v-if="invoice_info.standingbookInfoList && invoice_info.standingbookInfoList.length" @click="fileHandle(invoice_info.standingbookInfoList,'对账单')">对账单</span>
                    <span class="link-text" v-if="invoice_info.accountingOtherInfoList && invoice_info.accountingOtherInfoList.length" @click="fileHandle(invoice_info.accountingOtherInfoList,'其他资料')">其他资料</span>
                </div>
                <div class="info-box-content" v-else> -- </div>
    	    </div>
            <div class="info-box">
    	    	<div class="info-box-title">其他</div>
    	    	<div class="info-box-content"> {{ invoice_info.otherIninvoice_infoation || '--' }} </div>
    	    </div>
            <div class="info-box">
    	    	<div class="info-box-title">开票备注</div>
    	    	<div class="info-box-content"> {{ invoice_info.remark || '--' }} </div>
    	    </div>
        </div>
    </el-card>
    <el-card class="info-card">
        <template #header>
            <span>发票抬头及地址</span>
        </template>
        <div class="info-content">
            <div class="info-box">
    	    	<div class="info-box-title">发票抬头</div>
    	    	<div class="info-box-content"> {{ invoice_info.invoiceTitle || '--' }} </div>
    	    </div>
            <div class="info-box">
    	    	<div class="info-box-title">企业税号</div>
    	    	<div class="info-box-content"> {{ invoice_info.enterpriseTaxNumber || '--' }} </div>
    	    </div>
            <div class="info-box">
    	    	<div class="info-box-title">开户行名称</div>
    	    	<div class="info-box-content"> {{ invoice_info.openBankName || '--' }} </div>
    	    </div>
            <div class="info-box">
    	    	<div class="info-box-title">开户行账户</div>
    	    	<div class="info-box-content"> {{ invoice_info.openBankAccount || '--' }} </div>
    	    </div>
            <div class="info-box">
    	    	<div class="info-box-title">注册地址</div>
    	    	<div class="info-box-content"> {{ invoice_info.registeredAddress || '--' }} </div>
    	    </div>
            <div class="info-box">
    	    	<div class="info-box-title">注册电话</div>
    	    	<div class="info-box-content"> {{ invoice_info.registeredTelephone || '--' }} </div>
    	    </div>
            <div class="info-box">
    	    	<div class="info-box-title">收件人姓名</div>
    	    	<div class="info-box-content"> {{ invoice_info.addressee || '--' }} </div>
    	    </div>
            <div class="info-box">
    	    	<div class="info-box-title">收件地址</div>
    	    	<div class="info-box-content"> {{ invoice_info.deliveryAddress || '--' }} </div>
    	    </div>
            <div class="info-box">
    	    	<div class="info-box-title">收件邮箱</div>
    	    	<div class="info-box-content"> {{ invoice_info.receivingContact || '--' }} </div>
    	    </div>
            <div class="info-box">
    	    	<div class="info-box-title">收件联系方式</div>
    	    	<div class="info-box-content"> {{ invoice_info.receivingContactInformation || '--' }} </div>
    	    </div>
        </div>
    </el-card>
    <el-card class="info-card">
        <template #header>
            <span>打款凭证</span>
        </template>
        <div class="info-content">
            <div class="info-box">
    	    	<div class="info-box-title">凭证附件</div>
    	    	<div class="info-box-content">
                    <span class="link-text" v-if="invoice_info.uploadPaymentVoucherList && invoice_info.uploadPaymentVoucherList.length" @click="fileHandle(invoice_info.uploadPaymentVoucherList)"> {{ invoice_info.invoiceTitle || '--' }} </span>
                    <span v-else>暂无附件</span>
                </div>
    	    </div>
        </div>
    </el-card>
    <el-card class="info-card">
        <template #header>
            <span>开票记录</span>
        </template>
        <div class="info-content">
            <el-timeline :reverse="false" class="timelineWrapper">
                <el-timeline-item v-for="(activity, index) in log_list" :key="index" color="#0bbd87" :timestamp="activity.addTime">{{activity.context}}</el-timeline-item>
            </el-timeline>
        </div>
    </el-card>
</div>
</template>

<style lang="scss" scoped>
.info-card {
    width: 98%;
    margin: 15px auto;
}

.info-content {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    .info-box {
        display: flex;
        width: calc((100% - 10px) / 2 );
        min-height: 60px;
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
            flex-wrap: wrap;
            column-gap: 10px;
            align-items: center;
            padding: 15px;
            width: calc(100% - 120px);
            min-width: 200px;
        }
    }
}

</style>