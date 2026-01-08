<script setup>
import uploadImage from "@/components/upload_image.vue"
import mitt_bus from "@/utils/mitt_bus"
import { ref, reactive, computed, watch } from "vue"
import { validEmail } from "@/utils/validate"
import { getUserInfo } from '@/utils/auth'

import { useGetSchoolList, useApplyCert } from "@/api"
import { regionData, codeToText } from "element-china-area-data"
import { ElMessage } from "element-plus"
import { useRouter } from "vue-router"

const useValidemail = (rule, value, callback) => {
    if (value && !validEmail(value)) {
        return callback(new Error("请输入正确的邮箱"))
    }
    callback()
}

const valideTeacherName = (rule, value, callback) => {
    if (!value && form_data.value.identityType == 0) {
        return callback(new Error("请输入导师名称"))
    }
    callback()
}

const router = useRouter()

const form_dom = ref(null)
const upload_image_upload = ref(null)
const upload_image_download = ref(null)
const user_info = reactive(getUserInfo())//用户信息
const loading = ref(false)

const school_options = ref([])//高校列表
const faculty_ptions = ref([])//院校列表
const campus_options = ref([])//校区列表

const form_data = ref({
    type: 1,// 申请类型 1 学生认证
	clientName: '',//客户昵称
	email: '',//邮箱
    name: '',//客户真实姓名
	cardType: undefined,//证件类型
    idCard: '',//客户证件号码
    identityType: 0,//客户身份类型  0=学生,1=教职工,2=公司员工
    teacherName: '',//关联导师名称
    certType: 1,//认证材料类型
    certPic: '',//认证图片地址
	upList: '',
	downList: '',
    colleges: '',//所在高校
	collegesId: undefined,//所在高校id
	faculty: '',//所在院系
	facultyId: undefined,//所在院系id
	campus: '',//所在校区
	campusId: undefined,//所在校区id 
    province: '',//所在地区
	provinceCode: undefined,//所在地区id
    provinceValue: undefined,//所在地区id的数组
    companyName: '',//企业名称
    address: '',//详细地址
})

const rules = ref({
    clientName: [{ required: true, message: "昵称不能为空", trigger: "blur" },],
    email: [
        { required: true, message: "邮箱不能为空", trigger: "blur" },
        { validator: useValidemail, trigger: "blur" }
    ],
    name: [{ required: true, message: "真实姓名不能为空", trigger: "blur" },],
    idCard: [{ required: true, message: "证件号码不能为空", trigger: "blur" },],
    upList: [{ required: true, message: "请上传认证材料", trigger: "blur" },],
    downList: [{ required: true, message: "请上传认证材料", trigger: "blur" },],
    collegesId: [{ required: true, message: "所在高校不能为空", trigger: "blur" },],
    facultyId: [{ required: true, message: "所在院系不能为空", trigger: "blur" },],
    province: [{ required: true, message: "所在地区不能为空", trigger: "blur" },],
    companyName: [{ required: true, message: "企业名称不能为空", trigger: "blur" },],
    teacherName: [{ validator: valideTeacherName, trigger: "blur" },],
})

const desc = computed(() => {
    let result = ''
    switch(form_data.value.certType) {
        case 1:
            result = '请上传您的校园卡正面+反面，上传的证件照片/截图中需含有您的真实姓名、所在高校/单位名称，'
            break
        case 2:
            result = '请上传您的学生证封面，上传的证件照片/截图中需含有您的真实姓名、所在高校/单位名称，'
            break
        case 3:
            result = '请您上传您在读学籍的学信网截图，上传的证件照片/截图中需含有您的真实姓名、学籍所在高校/单位名称，'
            break
        case 4:
            result = '请请您上传您所在的企业营业执照，上传的证件照片/截图中需含有企业名称、税号等信息，'
            break
    }
    return result
})

watch(
    () => form_data.value.certType,
    (newValue) => {
        switch(newValue) {
            case 0:
				form_data.value.companyName = undefined
				break
			case 1: 
				form_data.value.companyName = undefined
				break
			case 2:
				form_data.value.colleges = undefined
				form_data.value.collegesId = undefined
				form_data.value.faculty = undefined
				form_data.value.facultyId = undefined
				form_data.value.campus = undefined
				form_data.value.campusId = undefined
				break
        }
        form_data.value.certPic = ''
        form_data.value.upList = ''
        form_data.value.downList = ''
        if(upload_image_upload.value) {
            upload_image_upload.value.cleanList()
        }
        if(upload_image_download.value) {
            upload_image_download.value.cleanList()
        }
    }
)

watch(
    () => form_data.value.identityType,
    (newValue) => {
        if(newValue == 2) {
            form_data.value.colleges = undefined
            form_data.value.collegesId = undefined
            form_data.value.faculty = undefined
            form_data.value.facultyId = undefined
            form_data.value.campus = undefined
            form_data.value.campusId = undefined
        } else {
            form_data.value.province = undefined
            form_data.value.provinceCode = undefined
            form_data.value.provinceValue = undefined
            form_data.value.companyName = undefined
        }
    }
)



function initData() {
    form_data.value.clientName = user_info.clientName
	form_data.value.province = user_info.province
	form_data.value.provinceCode = user_info.provinceCode
}
initData()

//选择身份认证类型
function changeIdentityType(e) {
    switch(e) {
        case 0:
            form_data.value.certType = 1
            break
        case 1:
            form_data.value.certType = 1
            break
        case 2:
            form_data.value.certType = 4
            break
    }
}

//上传图片
function updateUpList(list) {
    form_data.value.upList = list[0].url
    if(list.length <= 0){
        ElMessage.warning(`请上传相关附件`)
    }
}
function updateDownList(list) {
    form_data.value.downList = list[0].url
    if(list.length <= 0){
        ElMessage.warning(`请上传相关附件`)
    }
}

//选择地区
async function changeProvince(value) {
    form_data.value.provinceCode = value.toString()
    form_data.value.province = getCodeToText(value)
    form_data.value.colleges = undefined
    form_data.value.collegesId = undefined
    const params = {
      type: 1,
      areaCode: form_data.value.provinceCode.split(',')[0],
    }
    const res = await useGetSchoolList(params)
    school_options.value = res.data.map(item => {
        return {
            label: item.schoolName,
            value: item.schoolId,
        }
    })
}

//把区域码转成汉字
function getCodeToText(value) {
    var name = ""
    value.map(item => (name += codeToText[item] + "/"))
    return name
}

//选择学校
async function changeSchool(e) {
    const schoolInfo = school_options.value.find(item => item.value == e)
    form_data.value.colleges = schoolInfo.label
    form_data.value.collegesId = schoolInfo.value
    form_data.value.faculty = undefined
    form_data.value.facultyId = undefined
    form_data.value.campus = undefined
    form_data.value.campusId = undefined
    //查询所在院系下拉
    const facultyRes = await useGetSchoolList({type: 2, parentId: schoolInfo.value})
    //查询所在校区下拉
    const campusRes = await useGetSchoolList({type: 3, parentId: schoolInfo.value})
    faculty_ptions.value = facultyRes.data.map(item => {
        return {
            label: item.schoolName,
            value: item.schoolId,
        }
    })
    campus_options.value = campusRes.data.map(item => {
        return {
            label: item.schoolName,
            value: item.schoolId,
        }
    })
}

//选择院系
function changeFaculty(e) {
    const facultyInfo = faculty_ptions.value.find(item => item.value == e)
    form_data.value.faculty = facultyInfo.label
    form_data.value.facultyIdId = facultyInfo.value
    form_data.value.campus = undefined
    form_data.value.campusId = undefined
}

//选择校区
function changeCampus(e) {
    const campusInfo = campus_options.value.find(item => item.value == e)
    form_data.value.campus = campusInfo.label
    form_data.value.campusId = campusInfo.value
}

//返回个人中心
async function toUserSpace() {
  // index对应的页面根据@/pages/user/menu_list.js查看
  // type 为所需对应子页面的附加操作
  const data = {index: '1-1'}
  await router.push('/user')
  mitt_bus.emit('changeUserActiveIndex', data)
}

//提交身份认证申请
function validateFormDate() {
    const keyList = ['upList', 'downList']
    const fileList = []
    keyList.forEach(item => {
        if(form_data.value[item]) {
            fileList.push(form_data.value[item])
        }
    })
    form_data.value.certPic = JSON.stringify(fileList)
    form_dom.value.validate(async valid => {
        if(valid) {
            loading.value = true
            try {
                await useApplyCert(form_data.value)
                loading.value = false
                ElMessage.success('身份认证申请提交成功')
                toUserSpace()
            }
            catch(err) {
                console.log(err)
                loading.value = false
            }
        }
    })
}

</script>

<template>
    <div class="page-main">
        <div class="page-head flex-center font-600">身份认证</div>
        <el-form class="form-dom" ref="form_dom" :rules="rules" :model="form_data" label-width="130px" label-position="left">
            <el-form-item label="昵称" prop="clientName">
                <el-input placeholder="请输入昵称" disabled v-model="form_data.clientName"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input placeholder="请输入邮箱" v-model="form_data.email"></el-input>
            </el-form-item>
            <el-form-item label="真实姓名" prop="name">
                <el-input placeholder="请输入真实姓名" v-model="form_data.name"></el-input>
            </el-form-item>
            <el-form-item label="证件类型">
                <el-radio border :label="undefined" v-model="form_data.cardType">中国居民身份证</el-radio>
                <!-- <el-radio border :label="414" v-model="form_data.cardType">定居国外的中国公民护照</el-radio>
                <el-radio border :label="516" v-model="form_data.cardType">港澳居民来往内地通行证</el-radio>
                <el-radio border :label="511" v-model="form_data.cardType">台湾居民来往大陆通行</el-radio>
                <el-radio border :label="553" v-model="form_data.cardType">外国人永久居留证</el-radio> -->
            </el-form-item>
            <el-form-item label="证件号码" prop="idCard">
                <el-input placeholder="请输入证件号码" v-model="form_data.idCard"></el-input>
            </el-form-item>
            <el-form-item label="身份认证类型">
                <el-radio-group v-model="form_data.identityType" @input="changeIdentityType">
                    <el-radio border :label="0">学生</el-radio>
                    <el-radio border :label="1">教师</el-radio>
                    <el-radio border :label="2">企业员工</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item v-if="form_data.identityType == 0" prop="teacherName">
                <template #label><span class="font-FF4A2B" style="margin-right: 5px">*</span>导师名称</template>
                <el-input placeholder="请输入导师名称" v-model="form_data.teacherName"></el-input>
            </el-form-item>
            <el-form-item label="身份认证材料">
                <div>
                    <div class="identity-radio-box">
                        <el-radio border :label="1" v-model="form_data.certType" v-show="form_data.identityType == 0 || form_data.identityType == 1">校园卡</el-radio>
                        <el-radio border :label="2" v-model="form_data.certType" v-show="form_data.identityType == 0">学生证</el-radio>
                        <el-radio border :label="3" v-model="form_data.certType" v-show="form_data.identityType == 0 || form_data.identityType == 1">学信网截图</el-radio>
                        <el-radio border :label="4" v-model="form_data.certType" v-show="form_data.identityType == 2">营业执照</el-radio>
                    </div>
                    <div v-if="form_data.certType != 4">
                        <div class="demo-pic flex-center" v-if="form_data.certType == 1">
                            <img src="@/assets/img/auth_card_up.png" alt="" srcset="" />
                            <img src="@/assets/img/auth_card_down.png" alt="" srcset="" />
                        </div>
                        <div class="demo-pic flex-center" v-else-if="form_data.certType == 2">
                            <img src="@/assets/img/auth_student_up.png" alt="" srcset="" />
                            <img src="@/assets/img/auth_student_down.png" alt="" srcset="" />
                        </div>
                        <div class="demo-pic flex-center" v-else-if="form_data.certType == 3">
                            <img class="xuexinwang" src="@/assets/img/xuexiwang.jpg" alt="" srcset="" />
                        </div>
                        <div class="font-5D5D5D">
                            <span class="font-FF4A2B">*</span>
                            <span>{{ desc || '-' }}</span>
                            <span class="font-FF5000">并与您填写的资料保持一致</span>
                        </div>
                    </div>
                </div>
            </el-form-item>
            <el-form-item :label="form_data.certType === 1 ? '校园卡正面:' : form_data.certType === 2 ? '学生证正面:' : form_data.certType === 3 ? '学习网截图' : ''" prop="upList">
                <uploadImage ref="upload_image_upload" fileType="jpg,png,jpeg,JPG,PNG,JPEG" @updateValue="updateUpList"></uploadImage>
            </el-form-item>
            <el-form-item v-if="form_data.certType !== 3 && form_data.certType !== 4" :label="form_data.certType === 1 ? '校园卡反面:' : form_data.certType === 2 ? '学生证反面:' : ''" prop="downList">
                <uploadImage ref="upload_image_download" @updateValue="updateDownList"></uploadImage>
            </el-form-item>
            <el-form-item label="所在地区" prop="province">
                <el-cascader style="width: 100%;" placeholder="请选择所在地区" :options="regionData" v-model="form_data.provinceValue" @change="changeProvince"></el-cascader>
            </el-form-item>
            <el-form-item v-if="form_data.identityType != 2" label="所在高校" prop="collegesId">
                <el-select style="width: 100%;" filterable placeholder="请选择所在高校" v-model="form_data.collegesId" @change="changeSchool">
                    <el-option v-for="item in school_options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-if="form_data.identityType != 2" label="所在院系" prop="facultyId">
                <el-select style="width: 100%;" placeholder="请选择所在院系" v-model="form_data.facultyId" @change="changeFaculty">
                    <el-option v-for="item in faculty_ptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-if="form_data.identityType != 2" label="所在校区">
                <el-select style="width: 100%;" placeholder="请选择所在校区" v-model="form_data.campusId" @change="changeCampus">
                    <el-option v-for="item in campus_options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-if="form_data.identityType == 2" label="企业名称" prop="companyName">
                <el-input placeholder="请输入企业名称" v-model="form_data.companyName"></el-input>
            </el-form-item>
            <el-form-item label="详细地址">
                <el-input placeholder="请输入详细地址" v-model="form_data.address"></el-input>
            </el-form-item>
            <div class="button-box flex-center">
                <el-button :loading="loading" @click="toUserSpace">返回</el-button>
                <el-button type="primary" :loading="loading" @click="validateFormDate">提交</el-button>
            </div>
        </el-form>
    </div>
    
</template>



<style lang="scss" scoped>
.page-main {
    width: calc(88vw - 30px);
    min-width: 1237px;
    border-radius: 10px;
    border: 1px solid #cccccc;
    background-color: #FFFFFF90;
}

.page-head {
    padding: 10px;
    border-radius: 10px 10px 0 0;
    background-color: #94C9FF;
}
.form-dom {
    padding: 15px;
    .identity-radio-box {
        margin-bottom: 15px;
    }
    .demo-pic {
        column-gap: 30px;
        justify-content: flex-start;
        img {
            width: 300px;
        }
        .xuexinwang {
            width: 700px;
            height: 500px;
        }
    }
    .button-box {
        column-gap: 150px;
        .el-button {
            width: 200px;
            height: 50px;
        }
    }
}
</style>