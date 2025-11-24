<script setup>
import dayjs from "dayjs";
import { computed, nextTick, ref, watch } from "vue";
import { getUserInfo } from '@/utils/auth';
import { useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from 'element-plus';
import { validEnterpriseTax, validInvoiceTitle } from '@/utils/validate.js'
import { useGetInvoiceHeadList, useGetUserInvoiceHeadList, useGetTestItemList, useApplyInvoice } from "@/api";

const router = useRouter()
const emit = defineEmits(['emitChangeShowPage'])

const loading = ref(false)
const apply_success_dialog = ref(false)//申请成功弹框
const user_info = ref(JSON.parse(getUserInfo()))
const form = ref(null)//表单实例
//申请预存数据表单
const form_data = ref({
    applyType: 2, //申请类型  1申请开票  2申请预存
	prestoredType: 1, //预存类型  1个人预存  2团队预存
	storedCourtesy: undefined, //预存有礼
    ifContact: 2,//是否与业务员取得联系 1 是  2否
    salesmanName: '',//业务员工号
	invoice: [{
		clientNeedInvoiceDate: '', //开票日期
		invoiceAmount: null, //该发票总金额
		testItem: '', //检测项目
		//检测项目列表
		checkItems:[
			{
				detectionItemName: '',//设备名称
				detectionItemId: '',//设备ID
				quantity: null,//数量
		        detectionMeteringUnit: '',//检测项目计量单位
				subtotal: null,//金额
				unitPrice: null,//单价
			}
		],
	}],
	remark: '', //开票备注
	invoiceType: 1, //发票类型   1 普通发票  2 专用发票   
	payerInvoiceType: '32', //发票类型  普通发票 32  专用发票 31
	accountingInformation: '', //报账所需资料
	otherInformation: '', // 其他资料
	ifDefault: 2, //是否选择默认抬头
	invoiceTitle: '', //发票抬头
	enterpriseTaxNumber: '', //企业税号
	receivingContact: '', //收件邮箱
	openBankName: '', //开户行名称
	openBankAccount: '', //开户行账号
	registeredAddress: '', //注册地址
	registeredTelephone: '', //注册电话
	addressee: '',//收件人姓名
	deliveryAddress: '',//收件地址
	receivingContact: '',//收件邮箱
	receivingContactInformation: '',//收件联系方式
})
const stored_courtesy_checkbox = ref([])//选择预存有礼
const user_invoice_list = ref([])//用户默认发票抬头列表
const project_list = ref([])//检测项目列表 --- 用于选择框组件
const project_detail_list = ref([])//检测项目详情列表
const accounting_information_list = ref([])//所需报账资料列表

const rules = computed(() => {
    const salesmanNameRules = (rule, value, callback) => {
        if(form_data.value.ifContact == 1 && !form_data.value.salesmanName) {
            callback(new Error('业务员工号不能为空'))
        }
        callback()
    }
    const invoiceRules = (rule, value, callback) => {
        let validate = true
        let invoice_num = 0
        let invoice_desc = ''
        form_data.value.invoice.forEach((item, index) => {
            if(validate) {
                if(!item.clientNeedInvoiceDate) {
                    validate = false
                    invoice_num = index + 1
                    invoice_desc = '开票日期'
                    return
                }
                item.checkItems.forEach(i => {
                    if(!i.detectionItemId || !i.detectionItemName) {
                        validate = false
                        invoice_num = index + 1
                        invoice_desc = '检测项目名称'
                        return
                    }
                    if(!i.detectionMeteringUnit) {
                        validate = false
                        invoice_num = index + 1
                        invoice_desc = '计量单位'
                        return
                    }
                })
            }
        })
        if(validate) {
            callback()
        } else {
            callback(new Error(`【发票${invoice_num}】——【${invoice_desc}】不能为空`))
        }
    }
    const accountingInformationRules = (rule, value, callback) => {
        if(accounting_information_list.value.includes('其他') && !form_data.value.otherInformation) {
            callback(new Error('【其他】报账资料不能为空'))
        } else{
            callback()
        }
    }
    const invoiceInformationRules = (rule, value, callback) => {
        const require = form_data.value.invoiceType == 2
        const dict = [
            { label: '发票抬头', require: true, key: 'invoiceTitle' },
            { label: '企业税号', require: true, key: 'enterpriseTaxNumber' },
            { label: '开户行名称', require: require, key: 'openBankName' },
            { label: '开户行账号', require: require, key: 'openBankAccount' },
            { label: '注册地址', require: require, key: 'registeredAddress' },
            { label: '注册电话', require: require, key: 'registeredTelephone' },
            { label: '收件人', require: require, key: 'addressee' },
            { label: '收件地址', require: require, key: 'deliveryAddress' },
            { label: '收件邮箱', require: require, key: 'receivingContact' },
            { label: '联系方式', require: require, key: 'receivingContactInformation' },
        ]
        let validate = true
        let label = undefined
        dict.forEach(item => {
            if(validate) {
                if(item.require && !form_data.value[item.key]) {
                    validate = false
                    label = item.label
                }
            }
        })
        if(validate) {
            if(validInvoiceTitle(form_data.value.invoiceTitle)) {
                callback(new Error('请输入正确的发票抬头（不能包含空格、换行等字符）'))
            } else if(!validEnterpriseTax(form_data.value.enterpriseTaxNumber)) {
                callback(new Error('请输入正确的企业税号'))
            } else {
                callback()
            }
        } else {
            callback(new Error(`【${label}】不能为空`))
        }
    }
    let obj = {}
    switch(form_data.value.applyType) {
        case 1:
            obj = {
                invoiceInformationRules: [{ validator: invoiceInformationRules, trigger: 'blur' }],
            }
        break
        case 2:
            obj = {
                salesmanNameRules: [{ validator: salesmanNameRules, trigger: 'blur' }],
                invoiceRules: [{ validator: invoiceRules, trigger: 'change' }],
                accountingInformationRules: [{ validator: accountingInformationRules, trigger: 'change' }],
                invoiceInformationRules: [{ validator: invoiceInformationRules, trigger: 'blur' }],
            }
        break
    }
    return obj
})

watch(
    () => form_data.value.ifContact,
    (newValue) => {
        if(newValue == 2) {
            form.value.clearValidate(['salesmanNameRules'])
        }
    },
)

watch(
    () => form_data.value.invoice,
    () => {
        if(form_data.value.applyType == 2) {
            form_data.value.invoice.forEach(item => {
                item.invoiceAmount = item.checkItems.reduce((sum, item) => {
                    return sum + Number(item.subtotal)
                }, 0).toFixed(2)
                item.testItem = item.checkItems.map(item => item.detectionItemName).join(',')
            })
        }
    },
    { deep: true },
    { immediate: true },
)

watch(
    () => form_data.value.ifDefault,
    (newValue) => {
        if(newValue == 1) {
            if(!user_invoice_list.value.length) {
                ElMessageBox.confirm(
                    '您还未添加过发票抬头，是否前往添加？',
                    '温馨提示',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                    }
                ).then(() => {
                    router.push({path: '/'})
                }).catch(() => {
                    form_data.value.ifDefault = 2
                })
            } else {
                const info = user_invoice_list.value[0]
			    form_data.value.invoiceTitle = info.invoiceTitle
			    form_data.value.enterpriseTaxNumber = info.enterpriseTaxNumber
			    form_data.value.receivingContact = info.receivingContact
			    form_data.value.openBankName = info.openBankName
			    form_data.value.openBankAccount = info.openBankAccount
			    form_data.value.registeredAddress = info.registeredAddress
			    form_data.value.registeredTelephone = info.registeredTelephone
			    form_data.value.addressee = info.addressee
			    form_data.value.deliveryAddress = info.deliveryAddress
			    form_data.value.receivingContact = info.receivingContact
			    form_data.value.receivingContactInformation = info.receivingContactInformation
            }
        } else {
            form_data.value.invoiceTitle = ''
			form_data.value.enterpriseTaxNumber = ''
			form_data.value.receivingContact = ''
			form_data.value.openBankName = ''
			form_data.value.openBankAccount = ''
			form_data.value.registeredAddress = ''
			form_data.value.registeredTelephone = ''
			form_data.value.addressee = ''
			form_data.value.deliveryAddress = ''
			form_data.value.receivingContact = ''
			form_data.value.receivingContactInformation = ''
        }
    },
    { immediate: true },
)

function disabledDate(time) {
    return dayjs(time.getTime()).isBefore(dayjs(), 'day')
}

async function initHandle(apply_type, invoice_order_list, invoice_amount) {
    loading.value = true
    const res_invoice = await useGetUserInvoiceHeadList({clientId: user_info.value.clientId})
    user_invoice_list.value = res_invoice.rows.filter(item => item.isDefault == 1)
    if(apply_type == 1) {
        // form.value.clearValidate(['invoiceInformationRules'])
        form_data.value = {
			applyType: 1, //申请类型  1申请开票  2申请预存
			orderInvoice: invoice_order_list,
			// orderInvoice:[
			// 	{
			// 		orderId: null,//订单ID
			// 		prepaidPayment: null,//支付方式
			// 	}
			// ],
			invoiceAmount: invoice_amount,
			remark: '', //开票备注
			invoiceType: 1, //发票类型   1 普通发票  2 专用发票   
			payerInvoiceType: '32', //发票类型  普通发票 32  专用发票 31
			accountingInformation: '', //报账所需资料
			otherInformation: '', // 其他资料
			ifDefault: 1, //是否选择默认抬头
			invoiceTitle: '', //发票抬头
			enterpriseTaxNumber: '', //企业税号
			receivingContact: '', //收件邮箱
			openBankName: '', //开户行名称
			openBankAccount: '', //开户行账号
			registeredAddress: '', //注册地址
			registeredTelephone: '', //注册电话
		}
    } else {
        const project_params = {
            ifSelfSupport: 1, //是否自营
        }
        const res_project = await useGetTestItemList(project_params)
        project_detail_list.value = res_project.data
        project_list.value = res_project.data.map(item => {
            return {
                label: item.detectionItemName,
                value: item.detectionItemId,
            }
        })
    }
    loading.value = false
}

//选择【预存有礼】
function setStoredCourtesy(e) {
    if(e.length >= 2) {
        form_data.value.storedCourtesy = e[e.length - 1]
        stored_courtesy_checkbox.value = [e[e.length - 1]]
    } else if (e.length == 1) {
        form_data.value.storedCourtesy = e[0]
        stored_courtesy_checkbox.value = [e[0]]
    } else {
        form_data.value.storedCourtesy = undefined
        stored_courtesy_checkbox.value = []
    }
}

//【添加发票】
function addInvoice() {
    const obj = {
		clientNeedInvoiceDate: '', //开票日期
		invoiceAmount: null, //该发票总金额
		testItem: '', //检测项目
		//检测项目列表
		checkItems:[
			{
				detectionItemName: '',//设备名称
				detectionItemId: '',//设备ID
				quantity: null,//数量
		        detectionMeteringUnit: '',//检测项目计量单位
				subtotal: null,//金额
				unitPrice: null,//单价
			}
		],
	}
    form_data.value.invoice.push(obj)
}

//【删除发票】
function deleteInvoice(invoice_index) {
    if(form_data.value.invoice.length == 1) {
        form_data.value.invoice[0].detectionItemName = ''
        form_data.value.invoice[0].detectionItemId = ''
        form_data.value.invoice[0].quantity = null
        form_data.value.invoice[0].detectionMeteringUnit = ''
        form_data.value.invoice[0].subtotal = null
        form_data.value.invoice[0].unitPrice = null
    } else {
        form_data.value.invoice.splice(invoice_index, 1)
    }
}

//选择【检测项目】
function selectProject(e, invoiceIndex, checkItemIndex) {
    const filterList = form_data.value.invoice[invoiceIndex].checkItems.filter((item, index) => index !== checkItemIndex)
    if(filterList.some(item => item.detectionItemId == e)) {
        form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].detectionItemId = undefined
        form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].detectionItemName = undefined
        form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].quantity = 1
        form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].unitPrice = undefined
        form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].detectionMeteringUnit = undefined
        form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].subtotal = 0
        ElMessage({
            message: '请勿选择相同的检测项目',
            type: 'warning',
        })
        return
    }
    const project = project_detail_list.value.find(item => item.detectionItemId == e)
    form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].detectionItemId = project.detectionItemId
    form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].detectionItemName = project.detectionItemName
    form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].quantity = 1
    form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].unitPrice = project.unitPrice.toFixed(2)
    form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].detectionMeteringUnit = project.detectionMeteringUnit
    form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].subtotal = project.unitPrice.toFixed(2)
}

//设置【自定义检测项目单价】
function setUnitPrice(e, invoiceIndex, checkItemIndex) {
    form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].unitPrice = e
    form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].subtotal = (e * form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].quantity).toFixed(2)
}

//更改【检测项目】数量
function changeQuantity(invoiceIndex, checkItemIndex) {
    const quantity = form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].quantity
    const unitPrice = form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].unitPrice
    form_data.value.invoice[invoiceIndex].checkItems[checkItemIndex].subtotal = (quantity * unitPrice).toFixed(2)
}

//添加【检测项目】
function addProject(invoiceIndex, detectionItemId) {
    const obj = {
        detectionItemName: '',//设备名称
		detectionItemId: detectionItemId,//设备ID
		quantity: null,//数量
		detectionMeteringUnit: '',//检测项目计量单位
		subtotal: null,//金额
		unitPrice: null,//单价
    }
    if(detectionItemId) {
        obj.quantity = 1
        obj.subtotal = 1
        obj.unitPrice = 1
    }
    form_data.value.invoice[invoiceIndex].checkItems.push(obj)
}

//删除【检测项目】
function deleteProject(invoiceIndex, checkItemIndex) {
    if(form_data.value.invoice[invoiceIndex].checkItems.length == 1) {
        form_data.value.invoice[invoiceIndex].checkItems[0].detectionItemName = ''
        form_data.value.invoice[invoiceIndex].checkItems[0].detectionItemId = ''
        form_data.value.invoice[invoiceIndex].checkItems[0].quantity = null
        form_data.value.invoice[invoiceIndex].checkItems[0].detectionMeteringUnit = ''
        form_data.value.invoice[invoiceIndex].checkItems[0].subtotal = null
        form_data.value.invoice[invoiceIndex].checkItems[0].unitPrice = null
    } else {
        form_data.value.invoice[invoiceIndex].checkItems.splice(checkItemIndex, 1)
    }
}

//选择【发票类型】
function selectInvoiceType(value) {
    form_data.value.payerInvoiceType = value == 1 ? '32' : '31'
}

//选择【报账资料】
function setAccountingInformation() {
    const flag = accounting_information_list.value.includes('其他')
    if(!flag) {
        form_data.value.otherInformation = ''
    }
    form_data.value.accountingInformation = accounting_information_list.value.filter(item => item != '其他').join(',')
}

// 展示【发票抬头】列表
async function showInvoiceList(queryString, cb) {
    try {
        if(queryString) {
            const res = await useGetInvoiceHeadList({invoiceTitle: queryString})
            const results = res.rows.map(item => {
                item.value = item.invoiceTitle
                return item
            })
            cb(results)
        } else {
            cb([])
        }
    }
    catch(err) {
        console.log(err)
    }
}

//选择【发票抬头】
function selectInvoiceTitle(data) {
    form.value.clearValidate(['invoiceInformationRules'])
    form_data.value.invoiceTitle = data.invoiceTitle
	form_data.value.enterpriseTaxNumber = data.enterpriseTaxNumber
	form_data.value.receivingContact = data.receivingContact
	form_data.value.openBankName = data.openBankName
	form_data.value.openBankAccount = data.openBankAccount
	form_data.value.registeredAddress = data.registeredAddress
	form_data.value.registeredTelephone = data.registeredTelephone
	form_data.value.addressee = data.addressee
	form_data.value.deliveryAddress = data.deliveryAddress
	form_data.value.receivingContact = data.receivingContact
	form_data.value.receivingContactInformation = data.receivingContactInformation
}

//校验表单必填项目
function validateFormDate() {
    loading.value = true
    form.value.validate(valid => {
        if(valid) {
            confirmForm()
        } else {
            loading.value = false
        }
    })
}

//【提交申请】
async function confirmForm() {
    const list = [
		'invoiceTitle',
		'enterpriseTaxNumber',
		'receivingContact',
		'openBankName',
		'openBankAccount',
		'registeredAddress',
		'registeredTelephone',
		'addressee',
		'deliveryAddress',
		'receivingContact',
		'receivingContactInformation',
	]
	list.forEach(item => {
		if(form_data.value[item]) {
			form_data.value[item].replace(/[\s\r\n]/g, '')
		}
	})
    try {
        await useApplyInvoice(form_data.value)
        apply_success_dialog.value = true
    }
    catch {
        loading.value = false
    }
}

//返回并刷新
function emitChangeShowPage() {
    apply_success_dialog.value = false
    const data = {
        index: 0,
    }
    emit('emitChangeShowPage', data)
}

//前往我的发票
function toMyInvoice () {
    router.push({path: "/"})
}

// 开票示例预览
function openExample() {
    const url = 'https://pstatic.navi-sci.cn/applicationPre/invoice_Example_row.png'
    window.open(url, '_blank')
}

defineExpose({ initHandle })
</script>

<template>
    <div style="width: 100%; height: 100%;" v-loading="loading">
        <!-- 申请预存/开票 -->
        <div class="page-main">
            <el-scrollbar>
                <el-form class="form" ref="form" :rules="rules" :model="form_data" label-width="130px" label-position="left">
                    <el-form-item v-if="form_data.applyType == 2" label="预存类型">
                        <div>
                            <el-radio border v-model="form_data.prestoredType" :label="1">个人预存</el-radio>
                            <el-radio border :disabled="!user_info.teamId" v-model="form_data.prestoredType" :label="2">团队预存</el-radio>
                            <span v-if="form_data.prestoredType == 2">预存团队：{{ user_info.teamName }}</span>
                        </div>
                    </el-form-item>
                    <el-form-item v-if="form_data.applyType == 2" label="预存有礼">
                        <div style="display: flex;">
                            <el-checkbox-group v-model="stored_courtesy_checkbox" @change="setStoredCourtesy">
                                <el-checkbox border :label="1">平台券</el-checkbox>
                                <el-checkbox border :label="2">测试费</el-checkbox>
                                <el-checkbox border :label="3">积分</el-checkbox>
                            </el-checkbox-group>
                            <span class="storedCourtesy-desc" v-if="form_data.storedCourtesy == 3">* 积分可在PC端 “积分商城” 使用</span>
	            	        <span class="storedCourtesy-desc" v-if="!form_data.storedCourtesy">* 若未选择预存有礼，则可参与预存转盘抽奖</span>
                        </div>
                    </el-form-item>
                    <el-form-item v-if="form_data.applyType == 2" label="业务员" prop="salesmanNameRules">
                        <div style="display: flex;">
                            <el-radio border v-model="form_data.ifContact" :label="2">未取得联系</el-radio>
                            <el-radio border v-model="form_data.ifContact" :label="1">已取得联系</el-radio>
                            <el-input placeholder="请输入业务员工号" v-show="form_data.ifContact == 1" v-model="form_data.salesmanName">
                                <template #prepend><span style="color: #FF4A2B;">*</span>业务员工号</template>
                            </el-input>
                        </div>
                    </el-form-item>
                    <el-form-item v-if="form_data.applyType == 2" prop="invoiceRules">
                        <template v-slot:label><span class="require-icon">*</span>开票信息</template>
                        <div class="invoice-box" v-for="(invoiceItem, invoiceIndex) in form_data.invoice" :key="invoiceIndex">
                            <div class="box-title">
                                <div style="display: flex; column-gap: 15px; align-items: center;">
                                    <span>发票{{ invoiceIndex + 1 }}</span>
                                    <el-date-picker value-format="YYYY/MM/DD" type="date" placeholder="选择日期" :disabled-date="disabledDate" v-model="invoiceItem.clientNeedInvoiceDate"></el-date-picker>
                                </div>
                                <div class="invoice-date">
                                    <el-icon class="el-icon-delete-solid" v-if="form_data.invoice.length > 1" @click="deleteInvoice(invoiceIndex)"><DeleteFilled /></el-icon>
                                    <el-icon class="el-icon-circle-plus" @click="addInvoice()"><CirclePlusFilled /></el-icon>
                                </div>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th style="width: 30%;">检测项目名称</th>
                                        <th style="width: 20%;">检测项目单价</th>
                                        <th style="width: 10%;">数量</th>
                                        <th style="width: 15%;">计量单位</th>
                                        <th style="width: 15%;">小计（元）</th>
                                        <th style="width: 10%;">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(checkItem, checkItemIndex) in invoiceItem.checkItems" :key="checkItemIndex">
                                        <td>
                                            <el-input v-if="checkItem.detectionItemId == 213" placeholder="请输入自定义检测项目名称" v-model="checkItem.detectionItemName"></el-input>
                                            <el-select style="width: 100%;" filterable v-else v-model="checkItem.detectionItemId" @change="selectProject($event, invoiceIndex, checkItemIndex)">
                                                <el-option v-for="item in project_list" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                            </el-select>
                                        </td>
                                        <td>
                                            <el-input-number v-if="checkItem.detectionItemId == 213" placeholder="请输入自定义检测项目单价" :min="1" :precision="2" v-model="checkItem.unitPrice" @change="setUnitPrice($event, invoiceIndex, checkItemIndex)"></el-input-number>
                                            <span v-else> {{ checkItem.unitPrice }} </span>
                                        </td>
                                        <td>
                                            <el-input-number 
                                                v-show="checkItem.detectionItemId" 
                                                v-model="checkItem.quantity" 
                                                :min="checkItem.detectionMeteringUnit == '小时' ? 0.5 : 1" 
                                                :max="1000"
                                                :step="checkItem.detectionMeteringUnit == '小时' ? 0.01 : 1" 
                                                :step-strictly="true" 
                                                @change="changeQuantity(invoiceIndex, checkItemIndex)">
                                            </el-input-number>
                                        </td>
                                        <td>
                                            <el-input v-if="checkItem.detectionItemId == 213" placeholder="请输入计量单位" v-model="checkItem.detectionMeteringUnit"></el-input>
                                            <span v-else> {{ checkItem.detectionMeteringUnit }} </span>
                                        </td>
                                        <td> {{ checkItem.subtotal }} </td>
                                        <td :class="{'td-button': checkItem.detectionItemId || invoiceItem.checkItems.length > 1}" @click="deleteProject(invoiceIndex, checkItemIndex)">
                                            <el-icon style="transform: scale(1.5); color: #FF4A2B;" v-show="checkItem.detectionItemId || invoiceItem.checkItems.length > 1"><CircleCloseFilled /></el-icon>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colspan="1">
                                            <div class="invoice-total">合计： ￥{{ invoiceItem.invoiceAmount }}</div>
                                        </td>
                                        <td colspan="5">
                                            <div class="add-poject-box">
                                                <div class="add-project" @click="addProject(invoiceIndex)">
                                                    <i class="el-icon-circle-plus-outline"></i>
                                                    <span>新增检测项目</span>
                                                </div>
                                                <div class="add-project" @click="addProject(invoiceIndex, 213)">
                                                    <i class="el-icon-circle-plus-outline"></i>
                                                    <span>新增自定义检测项目</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </el-form-item>
                    <el-form-item v-if="form_data.applyType == 1" label="开票金额">
                        <div style="color: #FF4A2B">￥{{ form_data.invoiceAmount }}</div>
                    </el-form-item>
                    <el-form-item label="开票备注">
                        <el-input placeholder="请填写开票备注" show-word-limit :maxlength="50" v-model="form_data.remark"></el-input>
                        <el-button style="float: right; margin-top: 15px;" type="primary" @click="openExample">示例预览</el-button>
                    </el-form-item>
                    <el-form-item label="发票类型">
                        <el-radio-group v-model="form_data.invoiceType" @input="selectInvoiceType">
                            <el-radio border :label="1">普通发票</el-radio>
                            <el-radio border :label="2">专用发票</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item prop="accountingInformationRules">
                        <template v-slot:label><span class="require-icon" v-if="accounting_information_list.includes('其他')">*</span>所需报账资料</template>
                        <div class="flex-center">
                            <el-checkbox-group v-model="accounting_information_list" @change="setAccountingInformation">
                                <el-checkbox border label="电子合同">电子合同</el-checkbox>
                                <el-checkbox border label="电子版测试清单">电子版测试清单</el-checkbox>
                                <el-checkbox border label="电子报告">电子报告</el-checkbox>
                                <el-checkbox border label="其他">其他</el-checkbox>
                            </el-checkbox-group>
                            <el-input style="width: 200px;" v-if="accounting_information_list.includes('其他')" placeholder="请填写其他报账资料" v-model.trim="form_data.otherInformation"></el-input>
                        </div>
                    </el-form-item>
                    <el-form-item label="发票抬头及地址" prop="invoiceInformationRules">
                        <div class="form-invoice-box">
                            <div class="form-invoice-item">
                                <el-radio border v-model="form_data.ifDefault" :label="1">使用默认抬头</el-radio>
                                <el-radio border v-model="form_data.ifDefault" :label="2">填写发票抬头</el-radio>
                            </div>
                            <el-autocomplete class="form-invoice-item" placeholder="请输入发票抬头" v-model="form_data.invoiceTitle" :fetch-suggestions="showInvoiceList" @select="selectInvoiceTitle">
                                <template #prepend>
                                    <div style="width: 80px;">
                                        <span class="require-icon">*</span>
                                        <span>发票抬头</span>
                                    </div>
                                </template>
                            </el-autocomplete>
                            <el-input class="form-invoice-item" placeholder="请输入企业税号" v-model="form_data.enterpriseTaxNumber">
                                <template #prepend>
                                    <div style="width: 80px;">
                                        <span class="require-icon">*</span>
                                        <span>企业税号</span>
                                    </div>
                                </template>
                            </el-input>
                            <el-input class="form-invoice-item" placeholder="请输入开户行名称" v-model="form_data.openBankName">
                                <template #prepend>
                                    <div style="width: 80px;">
                                        <span class="require-icon" v-if="form_data.invoiceType == 2">*</span>开户行名称
                                    </div>
                                </template>
                            </el-input>
                            <el-input class="form-invoice-item" placeholder="请输入开户行账号" v-model="form_data.openBankAccount">
                                <template #prepend>
                                    <div style="width: 80px;">
                                        <span class="require-icon" v-if="form_data.invoiceType == 2">*</span>开户行账号
                                    </div>
                                </template>
                            </el-input>
                            <el-input class="form-invoice-item" placeholder="请输入注册地址" v-model="form_data.registeredAddress">
                                <template #prepend>
                                    <div style="width: 80px;">
                                        <span class="require-icon" v-if="form_data.invoiceType == 2">*</span>注册地址
                                    </div>
                                </template>
                            </el-input>
                            <el-input class="form-invoice-item" placeholder="请输入注册电话" v-model="form_data.registeredTelephone">
                                <template #prepend>
                                    <div style="width: 80px;">
                                        <span class="require-icon" v-if="form_data.invoiceType == 2">*</span>注册电话
                                    </div>
                                </template>
                            </el-input>
                            <el-input class="form-invoice-item" placeholder="请输入收件人姓名" v-model="form_data.addressee">
                                <template #prepend>
                                    <div style="width: 80px;">
                                        <span class="require-icon" v-if="form_data.invoiceType == 2">*</span>收件人
                                    </div>
                                </template>
                            </el-input>
                            <el-input class="form-invoice-item" placeholder="请输入收件地址" v-model="form_data.deliveryAddress">
                                <template #prepend>
                                    <div style="width: 80px;">
                                        <span class="require-icon" v-if="form_data.invoiceType == 2">*</span>收件地址
                                    </div>
                                </template>
                            </el-input>
                            <el-input class="form-invoice-item" placeholder="请输入收件邮箱" v-model="form_data.receivingContact">
                                <template #prepend>
                                    <div style="width: 80px;">
                                        <span class="require-icon" v-if="form_data.invoiceType == 2">*</span>收件邮箱
                                    </div>
                                </template>
                            </el-input>
                            <el-input class="form-invoice-item" placeholder="请输入收件联系方式" v-model="form_data.receivingContactInformation">
                                <template #prepend>
                                    <div style="width: 80px;">
                                        <span class="require-icon" v-if="form_data.invoiceType == 2">*</span>联系方式
                                    </div>
                                </template>
                            </el-input>
                        </div>
                    </el-form-item>
                </el-form>
                <div class="confirm-button custom-button" @click="validateFormDate">提交</div>
            </el-scrollbar>
        </div>
        
    
        <!-- 申请成功弹框 -->
        <div class="success-dialog" v-show="apply_success_dialog">
            <div class="dialog-box">
                <div class="dialog-box-content flex-center-col">
                    <div class="font-large font-600 font-5CC300">申请成功</div>
                    <div class="content-text flex-center-col">
                        <h3>正常开票大约需要<span class="font-FF5000">10～15分钟</span>，如果有疑问请联系客服</h3>
                        <h3>您也可在<span class="font-FF5000">我的发票</span>中查看开票进度</h3>
                    </div>
                    <div class="content-button-box flex-center">
                        <div class="content-button default-button" @click="emitChangeShowPage">返回</div>
                        <div class="content-button custom-button" @click="toMyInvoice()">查看我的发票</div>
                    </div>
                </div>
                <div class="close-button flex-center" @click="emitChangeShowPage">
                    <el-icon class="close-icon"><CircleCloseFilled /></el-icon>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.page-main {
    position: relative;
    width: 100%;
    height: 100%;
    :deep(.el-checkbox),:deep(.el-radio),:deep(.el-input) {
        height: 45px;
    }
    :deep(.el-select__selection) {
        height: 30px;
    }
    .el-input-number:deep(.el-input__wrapper) {
        height: 46px;
    }
}

.el-icon-delete-solid {
    cursor: pointer; 
    transform: scale(1.5);
    font-size: 30px; 
    color: #FF4A2B;
}
.el-icon-circle-plus {
    cursor: pointer; 
    transform: scale(1.5);
    font-size: 30px; 
    color: #4d6fff;
}
.require-icon {
    color: #FF4A2B;
}
table {
    width: 100%;
    min-width: 700px;
    border-collapse: collapse; /* 合并边框 */
    margin: 10px 0;
}
th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
}
th {
    background-color: #f2f2f2;
}
tr:last-child {
    background-color: #f2f2f2;
}
tr:hover {
    background-color: #84B7F930; /* 悬停高亮 */
}
tr:last-child:hover {
    background-color: #f2f2f2; /* 取消最后一行悬停高亮 */
}

.form {
    width: 100%;
    padding: 30px 50px 80px;
    .storedCourtesy-desc {
        margin-left: 30px;
        font-size: 16px;
        color: #5CC300;
    }
    .invoice-box {
        width: 100%;
        min-width: 730px;
        margin-bottom: 15px;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 10px;
        .box-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 18px;
            font-weight: 600;
            .invoice-date {
                display: flex;
                column-gap: 15px;
                align-items: center;
            }
        }
        .td-button {
            cursor: pointer;
        }
        .invoice-total {
            flex: 1;
            font-size: 18px;
            font-weight: 600;
            color: #FF4A2B;
        }
        .add-poject-box {
            display: flex;
            .add-project {
                cursor: pointer;
                flex: 1;
                display: flex;
                column-gap: 15px;
                justify-content: center;
                align-items: center;
                font-size: 20px;
                color: #5D5D5D;
            }
            .add-project:hover {
                color: #84B7F9;
            }
        }
        
    }
    .form-invoice-box {
        display: flex;
        flex-wrap: wrap;
        gap: 30px;
        .form-invoice-item {
            width: calc(50% - 15px);
        }
        .form-invoice-item:first-child {
            width: 100%;
        }
    }
}
.confirm-button {
    z-index: 999;
    position: sticky;
    bottom: 0;
    height: 50px;
}

@keyframes showSuccessDialog {
    0% {
        opacity: 0.1;
        transform: scale(0.5);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}
.success-dialog {
    z-index: 9999;
    animation: showSuccessDialog 0.2s linear forwards;
    position: fixed;
    top: 8%;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 800px;
    background: url('@/assets/img/navi_dialog.png') no-repeat;
    background-position: top; /* 图片居中 */
    background-size: contain;
    .dialog-box {
        position: relative;
        width: 600px;
        height: 800px;
        .dialog-box-content {
            position: absolute;
            top: 25%;
            left: 50%;
            transform: translateX(-50%);
            justify-content: space-between;
            width: 500px;
            height: 420px;
            padding: 20px 0;
            .content-text {
                row-gap: 20px;
            }
            .content-button-box {
                width: 400px;
                justify-content: space-between;
                .content-button {
                    width: 150px;
                    height: 50px;
                }
            }
        }
        .close-button {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 100px;
            .close-icon {
                transform: scale(5);
                color: #5D5D5D;
            }
        }
    }
}
 
</style>