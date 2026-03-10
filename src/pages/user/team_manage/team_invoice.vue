<script setup>
import { ref, reactive, watch, getCurrentInstance, nextTick } from 'vue'
import { useGetInvoiceList, useGetInvoiceFile, useDeleteInvoice } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import uploadCertificate from '../components/upload_certificate.vue'
import invoiceDetail from '../components/invoice_detail.vue'
import { getUserInfo } from '@/utils/auth'

const instance = getCurrentInstance()

const user_info = getUserInfo()

const loading = ref(false)
const total = ref(0)
const invoice_list = ref([])//发票列表
const status_value = ref('')//发票状态
const child_ref = ref(null)//子界面实例
const show_page_index = ref(-1)//需显示的子界面索引

//我的发票显示的二级子界面列表
const show_page = [
    { label: '上传打款凭证', component: uploadCertificate },
    { label: '发票详情', component: invoiceDetail },
]
//发票列表接口参数
const params = ref({
    pageNum: 1,
    pageSize: 20,
    orderByColumn: 'addDate',
    isAsc: 'desc',
    originTeamId: user_info.teamId,
})
//发票状态筛选列表
const status_list = reactive([
    { label: '全部发票', value: 0 },
	{ label: '开票中', value: 1 },
	{ label: '已开票', value: 3 },
	{ label: '已销毁/失败', value: -1},
])

watch(
    params,
    () => {
        getInvoiceList()
    },
    { 
        deep: true,
        immediate: true,
    }
)

//获取发票列表
async function getInvoiceList() {
    loading.value = true
    try {
        const res = await useGetInvoiceList(params.value)
        invoice_list.value = res.rows
        total.value = res.total
        loading.value = false
    }
    catch(err) {
        console.log(err)
        loading.value = false
    }
}

//刷新页面
function refresh(msg, time) {
    show_page_index.value = -1
    ElMessage({
        message: msg || '操作成功！',
        type: 'success',
        duration: time || 1000
    })
    getInvoiceList()
}

//发票状态筛选
async function changeStatus(value) {
    show_page_index.value = -1
    status_value.value = value
    const new_params = {
        ...params.value
    }
    if(value > 0) {
        new_params.invoiceStatus = value
    } else if(value < 0) {
        switch(value) {
            case -1:
                new_params.invoiceStatuss = '4,6'
                break
        }
    }
    loading.value = true
    try {
        const res = await useGetInvoiceList(new_params)
        invoice_list.value = res.rows
        total.value = res.total
        loading.value = false
    }
    catch(err) {
        console.log(err)
        loading.value = false
    }
}

//发票状态码转换为字符
function statusFilter(row) {
    if(row.invoiceStatus == 1) {
		return '开票中'
	} else if(row.invoiceStatus == 3) {
		return '已开票'
	} else if((row.invoiceStatus == 4 && (row.invoiceResultStatus == 1 || !row.invoiceResultStatus)) || row.invoiceStatus == 6) {
		return '开票失败'
	} else if(row.invoiceStatus == 4 && row.invoiceResultStatus == 2) {
		return '已销毁'
	}
}

// 下载检测报告模板
async function downloadFile() {
    await instance.appContext.config.globalProperties.download.name('检测报告模板.docx', false)
}

// 文件下载
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

//下载发票
async function downInvoice(row) {
    const res = await useGetInvoiceFile(row.invoiceId)
    if (res.data.invoiceFileList.length == 0) {
        ElMessage.warning('暂无发票数据')
    } else {
        fileHandle(res.data.invoiceFileList)
    }
}

//删除
function delHandle(row) {
    ElMessageBox.confirm('确认删除该发票吗？', '温馨提示').then(async () => {
        try {
            loading.value = true
            await useDeleteInvoice(row.invoiceId)
            ElMessage.success('删除成功！')
            getInvoiceList()
        }
        catch(err) {
            console.log(err)
            loading.value = false
        }
    })
}

//打开子界面
function changeShowPage(row, index) {
    show_page_index.value = index
    show_page[index].label = row.invoiceTitle
    nextTick(() => {
        child_ref.value.initInfo(row)
    })
}
</script>

<template>
    <!-- 发票列表 -->
    <div class="page-head flex-center">
        <span class="font-middle">团队发票</span>
    </div>
    <div class="page-main flex-center">
        <div class="utils-box">
            <div class="menu-box">
                <el-scrollbar>
                    <div class="default-button" :class="{'default-button-active': status_value == item.value}" v-for="(item, index) in status_list" :key="index" @click="changeStatus(item.value)"> {{ item.label }} </div>
                </el-scrollbar>
            </div>
            <div class="utils-button flex-center">
                <div class="custom-button" @click="downloadFile">下载测试报告模板</div>
            </div>
        </div>
        <div class="invoice-box">
            <el-table class="invoice-table" v-loading="loading" v-if="show_page_index < 0" :data="invoice_list" height="calc(100vh - 182px)" border :header-cell-style="{backgroundColor: '#94C9FF30', height: '60px'}">
                <el-table-column prop="applyCode" label="申请编号" width="140" align="center"></el-table-column>
                <el-table-column prop="invoiceTitle" label="发票抬头" align="center" show-overflow-tooltip></el-table-column>
                <el-table-column label="发票类型" width="120" align="center">
                    <template #default="scope">{{ getDictLabel('invoice_type', scope.row.invoiceType) }}</template>
                </el-table-column>
                <el-table-column prop="addDate" label="申请时间" width="180" align="center"></el-table-column>
                <el-table-column prop="invoiceAmount" label="开票金额(元)" width="120" align="center">
                    <template #default="scope">¥{{ scope.row.invoiceAmount || '0.00' }}</template>
                </el-table-column>
                <el-table-column label="开票状态" width="120" align="center">
                  <template #default="scope">{{ statusFilter(scope.row) }}</template>
                </el-table-column>        
                <el-table-column prop="paymentStatus" label="是否回款" width="120" align="center">
                    <template #default="scope">
                        {{ getDictLabel('payment_status', scope.row.paymentStatus) }}
                    </template>
                </el-table-column>
                <el-table-column prop="certificateStatus" label="凭证状态" width="120" align="center">
                    <template #default="scope"> {{ scope.row.certificateStatus == 2 ? '已上传' : '未上传' }} </template>
                </el-table-column>
                <el-table-column label="需报账资料" width="150" align="center">
                    <template #default="scope">
                        <div class="link-text" v-if="scope.row.accountingListInfoList && scope.row.accountingListInfoList.length" @click="fileHandle(scope.row.accountingListInfoList,'电子版测试清单')">电子版测试清单</div>
                        <div class="link-text" v-if="scope.row.accountingContractInfoList && scope.row.accountingContractInfoList.length" @click="fileHandle(scope.row.accountingContractInfoList,'电子合同')">电子合同</div>
                        <div class="link-text" v-if="scope.row.accountingReportInfoList && scope.row.accountingReportInfoList.length" @click="fileHandle(scope.row.accountingReportInfoList,'电子报告')">电子报告</div>
                        <div class="link-text" v-if="scope.row.standingbookInfoList && scope.row.standingbookInfoList.length" @click="fileHandle(scope.row.standingbookInfoList,'对账单')">对账单</div>
                        <div class="link-text" v-if="scope.row.accountingOtherInfoList && scope.row.accountingOtherInfoList.length" @click="fileHandle(scope.row.accountingOtherInfoList,'其他资料')">其他资料</div>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150" align="center">
                    <template #default="scope">
                        <div class="link-text" v-if="scope.row.invoiceStatus == 3" @click="downInvoice(scope.row)">下载发票</div>
                        <div class="link-text-FF4A2B" v-if="scope.row.invoiceStatus == 5" @click="delHandle(scope.row)">删除</div>
                        <div 
                          class="link-text"
                          v-if="scope.row.certificateStatus == 1 && (scope.row.invoiceStatus == 2 || scope.row.invoiceStatus == 3)"
                          @click="changeShowPage(scope.row, 0)"
                        >
                            上传打款凭证
                        </div>
                        <div class="link-text" @click="changeShowPage(scope.row, 1)">查看详情</div>
                    </template>
                </el-table-column>
            </el-table>
            <div class="page-view" v-else>
                <div class="view-title flex-center font-600">
                    <div class="view-back custom-button" v-if="show_page_index >= 0" @click="show_page_index = -1">返回</div>
                    <div>{{ show_page[show_page_index].label }}</div>
                </div>
                <div class="view-content">
                    <el-scrollbar>
                        <component ref="child_ref" :is="show_page[show_page_index].component" @refresh="refresh"></component>
                    </el-scrollbar>
                </div>
            </div>
        </div>
    </div>
    <div class="pagination-box">
        <el-pagination
          v-model:current-page="params.pageNum"
          v-model:page-size="params.pageSize"
          :page-sizes="[20, 30, 40, 50]"
          :background="true"
          layout="total, sizes, prev, pager, next"
          :total="total"
        />
    </div>
</template>

<style lang="scss" scoped>
.page-head {
    width: calc(88vw - 30px);
    min-width: 1238px;
    height: 60px;
    border-radius: 10px 10px 0 0;
    background-color: #94C9FF80;
}
.page-main {
    width: calc(88vw - 30px);
    min-width: 1238px;
    height: calc(100vh - 150px);
    border: 1px solid #cccccc;
    background-color: #FFFFFF90;
}

.utils-box {
    width: calc((88vw - 30px) * 0.15);
    min-width: 185px;
    height: calc(100vh - 150px);
    border-right: 1px solid #cccccc;
    .menu-box {
        width: calc((88vw - 30px) * 0.15);
        min-width: 185px;
        height: calc(100% - 80px);
        padding: 15px 0;
        .default-button {
            width: calc(100% - 30px);
            height: 40px;
            margin: 0 auto 15px;
        }
    }
    .utils-button {
        width: calc((88vw - 30px) * 0.15);
        min-width: 185px;
        height: 80px;
        border-top: 1px solid #cccccc;
        .custom-button {
            width: 80%;
            height: 70%;
        }
    }
}

.invoice-box {
    width: calc((88vw - 32px) * 0.85);
    height: calc(100vh - 152px);
    min-width: 1050px;
    padding: 15px;
    .invoice-table {
        width: 100%;
    }
    .page-view {
        width: 100%;
        height: calc(100vh - 182px);
        border-radius: 10px;
            background-color: #FFFFFF;
        .view-title {
            position: relative;
            top: 0;
            width: 100%;
            height: 45px;
            background-color: #94C9FF80;
            border-radius: 10px 10px 0 0;
            .view-back {
                position: absolute;
                left: 15px;
                width: 60px;
                height: 30px;
                font-weight: normal;
            }
        }
        .view-content {
            width: 100%;
            height: calc(100% - 45px);
            border-radius: 0 0 10px 10px;
        }
    }
}

.pagination-box {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: calc(88vw - 30px);
    min-width: 1238px;
    height: 60px;
    padding: 0 15px;
}
</style>