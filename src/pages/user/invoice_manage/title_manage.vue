<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref } from 'vue';
import { getUserInfo } from '@/utils/auth';
import { useGetInvoiceTitleList, useSetDefault, useDeleteInvoiceHead } from '@/api'
import addInvoiceTitle from '../components/add_invoice_title.vue';

const loading = ref(false)
const ref_add_dialog = ref(null)
const user_info = getUserInfo()
const invoice_title_list = ref([])

async function getInvoiceTitleList() {
    try {
        loading.value = true
        console.log(user_info)
        const params = {
            clientId: user_info.clientId
        }
        const res = await useGetInvoiceTitleList(params)
        invoice_title_list.value = res.rows
        loading.value = false
    }
    catch(err) {
        console.log(err)
        loading.value = false
    }
}
getInvoiceTitleList()

//设置默认抬头
async function setDefault(headId) {
    try {
        loading.value = true
        const data = {
            clientId: user_info.clientId,
            headId,
        }
        await useSetDefault(data)
        getInvoiceTitleList()
        ElMessage({
            message: '设置成功！',
            type: 'success',
        })
    }
    catch(err) {
        console.log(err)
    }
}

// 打开新增、编辑抬头弹框
function openAddDialog(data) {
    ref_add_dialog.value.initForm(data)
}

//删除抬头
function deleteInvoiceTitle(headId) {
    ElMessageBox.confirm('是否确认删除该发票抬头？', '温馨提示',).then(async () => {
        await useDeleteInvoiceHead(headId)
        getInvoiceTitleList()
        ElMessage({
            message: '删除成功！',
            type: 'success',
        })
    })
}
</script>

<template>
    <div class="page-main">
        <div class="page-head flex-center">
            <div class="custom-button add-head" @click="openAddDialog()">新增抬头</div>
            <div class="font-middle">抬头管理</div>
        </div>
        <div class="page-content" v-loading="loading">
            <el-scrollbar>
                <div class="flex-center-col card-box">
                    <div class="flex-center card" v-for="item in invoice_title_list" :key="item.headId">
                        <img class="card-img" src="@/assets/img/invoice_title.png" alt="">
                        <div class="flex-center card-info-box">
                            <div class="flex-center card-info">
                                <div class="flex-center title">发票抬头</div>
                                <div class="flex-center content">{{item.invoiceTitle || '-'}}</div>
                            </div>
                            <div class="flex-center card-info">
                                <div class="flex-center title">企业税号</div>
                                <div class="flex-center content">{{item.enterpriseTaxNumber || '-'}}</div>
                            </div>
                            <div class="flex-center card-info">
                                <div class="flex-center title">开户行名称</div>
                                <div class="flex-center content">{{item.openBankName || '-'}}</div>
                            </div>
                            <div class="flex-center card-info">
                                <div class="flex-center title">开户行账户</div>
                                <div class="flex-center content">{{item.openBankAccount || '-'}}</div>
                            </div>
                            <div class="flex-center card-info-col">
                                <div class="flex-center title">注册地址</div>
                                <div class="flex-center content">{{item.registeredAddress || '-'}}</div>
                            </div>
                            <div class="flex-center card-info">
                                <div class="flex-center title">注册电话</div>
                                <div class="flex-center content">{{item.registeredTelephone || '-'}}</div>
                            </div>
                            <div class="flex-center card-info">
                                <div class="flex-center title">收件人姓名</div>
                                <div class="flex-center content">{{item.addressee || '-'}}</div>
                            </div>
                            <div class="flex-center card-info">
                                <div class="flex-center title">收件邮箱</div>
                                <div class="flex-center content">{{item.receivingContact || '-'}}</div>
                            </div>
                            <div class="flex-center card-info">
                                <div class="flex-center title">联系方式</div>
                                <div class="flex-center content">{{item.receivingContactInformation || '-'}}</div>
                            </div>
                            <div class="flex-center card-info-col">
                                <div class="flex-center title">收件地址</div>
                                <div class="flex-center content">{{item.deliveryAddress || '-'}}</div>
                            </div>
                        </div>
                        <div class="flex-center-col button-box">
                            <div class="disabled-button button-col" v-if="item.isDefault === 1">默认抬头</div>
                            <div class="custom-button button-col" v-if="item.isDefault === 0 || item.isDefault == null" @click="setDefault(item.headId)">设为默认</div>
                            <div class="default-button button-col" @click="openAddDialog(item)">修改抬头</div>
                            <div class="delete-button button-col" v-if="item.isDefault !== 1" @click="deleteInvoiceTitle(item.headId)">删除抬头</div>
                        </div>
                    </div>
                </div>
            </el-scrollbar>
        </div>
    </div>

    <addInvoiceTitle ref="ref_add_dialog" @updateInvoiceTitleList="getInvoiceTitleList"></addInvoiceTitle>
</template>

<style lang="scss" scoped>
.page-main {
    width: calc(88vw - 30px);
    min-width: 1238px;
    height: calc(100vh - 30px);
    border-radius: 10px;
    background-color: #FFFFFF90;
}

.page-head {
    position: relative;
    width: calc(88vw - 30px);
    min-width: 1238px;
    height: 50px;
    border-radius: 10px 10px 0 0;
    background-color: #94C9FF80;
    .add-head {
        position: absolute;
        right: 20px;
        padding: 5px 20px;
        font-weight: 400;
    }
}

.page-content {
    width: calc(88vw - 30px);
    min-width: 1238px;
    height: calc(100vh - 80px);
    padding: 20px;
    border-radius: 0 0 10px 10px;
    .card-box {
        row-gap: 20px;
        justify-content: flex-start;
        width: calc(88vw - 70px);
        min-width: 1198px;
        height: calc(100vh - 80px);
        .card {
            width: calc(88vw - 70px);
            min-width: 1198px;
            border: 1px solid #5D5D5D50;
            .card-img {
                width: 50px;
                height: 300px;
                border-right: 1px solid #5D5D5D50;
            }
            .card-info-box {
                flex-wrap: wrap;
                gap: 10px;
                justify-content: space-around;
                align-items: flex-start;
                width: 100%;
                height: 300px;
                padding: 15px;
                background-color: #FFFFFF;
                .card-info {
                    justify-content: flex-start;
                    width: calc((100% - 10px) / 2);
                    height: calc((100% - 80px) / 6);
                    border: 1px solid #E8E8E8;
                }
                .card-info-col {
                    justify-content: flex-start;
                    width: 100%;
                    height: calc((100% - 80px) / 6);
                    border: 1px solid #E8E8E8;
                }
                .title {
                    justify-content: flex-start;
                    width: 150px;
                    height: 100%;
                    padding-left: 5px;
                    border-right: 1px solid #E8E8E8;
                    background-color: #94C9FF30;
                }
                .content {
                    justify-content: flex-start;
                    height: 100%;
                    padding-left: 5px;
                }
            }
            .button-box {
                justify-content: space-around;
                width: 80px;
                height: 300px;
                border-left: 1px solid #5D5D5D50;
                background-color: #94C9FF30;
                .button-col {
                    writing-mode: vertical-rl;
                    width: 40px;
                    height: 80px;
                }
            }
        }
    }

}
</style>