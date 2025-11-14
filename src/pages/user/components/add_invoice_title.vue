<script setup>
import { ElMessage } from 'element-plus'
import { useSaveInvoiceHead, useGetInvoiceHeadContrastList } from '@/api';
import { isMobile, isLandline, validEmail, validEnterpriseTax, validOpenBankAccount, validInvoiceTitle } from '@/utils/validate.js'
import { ref } from 'vue';

function validateMobile(rule, value, callback) {
    if (value && !(isMobile(value) || isLandline(value))) {
        return callback(new Error('请输入正确的手机号'))
    }
    callback()
}

function validemail(rule, value, callback) {
    if (value && !validEmail(value)) {
        return callback(new Error('请输入正确的邮箱'))
    }
    callback()
}

function validateInvoiceTitle(rule, value, callback) {
    if(validInvoiceTitle(value)) {
        callback(new Error('请输入正确的发票抬头（不能包含空格、换行等字符）'))
    }
    callback();
}

function validateEnterpriseTax(rule, value, callback) {
    if (value && !validEnterpriseTax(value)) {
        return callback(new Error('请输入正确的企业税号'));
    }
    callback();
}

function validateOpenBankAccount(rule, value, callback) {
    if (value && !validOpenBankAccount(value)) {
        return callback(new Error('请输入正确的企业税号'));
    }
    callback();
}

const emit = defineEmits(['updateInvoiceTitleList'])

const show_dialog = ref(false)
const ref_form = ref(null)
const title = ref('新增发票抬头')
const invoice_title_list = ref([])

const form = ref({
    invoiceTitle: '',
    enterpriseTaxNumber: '',
    openBankName: '',
    openBankAccount: '',
    registeredAddress: '',
    registeredTelephone: '',
    addressee: '',
    deliveryAddress: '',
    receivingContact: '',
    receivingContactInformation: ''
})
const rules = {
    invoiceTitle: [
        { required: true, trigger: 'blur', message: '请输入发票抬头' },
        { max: 50, message: '发票抬头不能超过50个字', trigger: 'blur' },
        { validator: validateInvoiceTitle, trigger: 'blur' }
    ],
    enterpriseTaxNumber: [
        { required: true, trigger: 'blur', message: '请输入企业税号' },
        { max: 20, message: '企业税号不能超过20个字', trigger: 'blur' },
        { validator: validateEnterpriseTax, trigger: 'blur' }
    ],
    addressee: [
        { required: true, trigger: 'blur', message: '请输入收件人姓名' },
        { max: 20, message: '收件人姓名不能超过20个字', trigger: 'blur' }
    ],
    openBankName: [{ max: 50, message: '开户行名称不能超过50个字', trigger: 'blur' }],
    openBankAccount: [
        { max: 20, message: '开户行账号不能超过20个字', trigger: 'blur' },
        { validator: validateOpenBankAccount, trigger: 'blur' },
    ],
    registeredAddress: [{ max: 50, message: '注册地址不能超过50个字', trigger: 'blur' }],
    registeredTelephone: [{ validator: validateMobile, trigger: 'blur' }],
    deliveryAddress: [
        { required: true, trigger: 'blur', message: '请输入收件地址' },
        { max: 50, message: '收件地址不能超过50个字', trigger: 'blur' }
    ],
    receivingContact: [
        { required: true, trigger: 'blur', message: '请输入收件邮箱' },
        { validator: validemail, trigger: 'blur' }
        // { max: 20, message: "收件联系人不能超过20个字", trigger: "blur" }
    ],
    receivingContactInformation: [
        { required: true, trigger: 'blur', message: '请输入收件联系方式' },
        { validator: validateMobile, trigger: 'blur' }
    ]
}

//初始化弹框表单
function initForm(data) {
    show_dialog.value = true;
    if (data) {
        title.value = '修改发票抬头';
        const new_data = JSON.parse(JSON.stringify(data))
        for(let key in form.value) {
            form.value[key] = new_data[key]
        }
        form.value.headId = new_data.headId
    }
}

//获取发票抬头
async function searchInvoiceHeadList(val, cb) {
    const params = {
        invoiceTitle: val
    }
    const res = await useGetInvoiceHeadContrastList(params)
    const list = res.rows.map((x) => ({
        ...x,
        value: x.invoiceTitle,
        id: x.id,
        label: x.invoiceTitle
    }));
    invoice_title_list.value = list;
    cb(list);
}
 
function handleSelect(e) {
    const data = invoice_title_list.value.filter((item) => {
        return item.id == e.id;
    });
    form.value.registeredAddress = data[0].registeredAddress;
    form.value.enterpriseTaxNumber = data[0].enterpriseTaxNumber;
}

//确认结果
function submitHandle() {
    ref_form.value.validate(async valid => {
        if (valid) {
            await useSaveInvoiceHead(form.value)
            ElMessage({
                message: '设置成功！',
                type: 'success',
            })
            close()
            emit('updateInvoiceTitleList')
        }
    })
}

function close() {
    show_dialog.value = false;
    ref_form.value.resetFields()
}

defineExpose({
    initForm,
})
</script>


<template>
    <el-dialog :title="title" v-model="show_dialog" width="700px" center :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form ref="ref_form" :model="form" :rules="rules" label-width="120px" label-position="left">
            <el-form-item label="发票抬头" prop="invoiceTitle">
                <el-autocomplete
                    class="inline-input"
                    v-model="form.invoiceTitle"
                    :debounce="300"
                    :trigger-on-focus="false"
                    :select-when-unmatched="true"
                    :fetch-suggestions="searchInvoiceHeadList"
                    placeholder="请输入发票抬头"
                    style="width: 100%"
                    @select="handleSelect"></el-autocomplete>
            </el-form-item>
            <el-form-item label="企业税号" prop="enterpriseTaxNumber">
                <el-input v-model="form.enterpriseTaxNumber" placeholder="请输入企业税号"></el-input>
            </el-form-item>
            <el-form-item label="开户行名称" prop="openBankName">
                <el-input v-model="form.openBankName" placeholder="请输入开户行名称"></el-input>
            </el-form-item>
            <el-form-item label="开户行账户" prop="openBankAccount">
                <el-input v-model="form.openBankAccount" placeholder="请输入开户行账户"></el-input>
            </el-form-item>
            <el-form-item label="注册地址" prop="registeredAddress">
                <el-input v-model="form.registeredAddress" placeholder="请输入注册地址"></el-input>
            </el-form-item>
            <el-form-item label="注册电话" prop="registeredTelephone">
                <el-input v-model="form.registeredTelephone" placeholder="请输入注册电话"></el-input>
            </el-form-item>
            <el-form-item label="收件人姓名" prop="addressee">
                <el-input v-model="form.addressee" placeholder="请输入收件人姓名"></el-input>
            </el-form-item>
            <el-form-item label="收件地址" prop="deliveryAddress">
                <el-input v-model="form.deliveryAddress" placeholder="请输入收件地址"></el-input>
            </el-form-item>
            <el-form-item label="收件邮箱" prop="receivingContact">
                <el-input v-model="form.receivingContact" placeholder="请输入收件邮箱"></el-input>
            </el-form-item>
            <el-form-item label="联系方式" prop="receivingContactInformation">
                <el-input v-model="form.receivingContactInformation" placeholder="请输入联系方式"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="footer_btn">
                <el-button type="primary" plain @click="close()">取消</el-button>
                <el-button type="primary" @click="submitHandle()">提交</el-button>
            </div>
        </template>
        
    </el-dialog>
</template>

<style lang="scss" scoped>
.footer_btn {
    display: flex;
    justify-content: space-around;
}
</style>
