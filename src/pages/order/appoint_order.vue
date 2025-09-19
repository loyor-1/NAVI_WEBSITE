<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useGetEquipmentInfo, useGetActives, useGetFieIdList } from '@/api'
import { reactive, ref, watch } from 'vue';
import { initFieIdList, changeRelevance } from '@/utils/order';
import { ElMessageBox } from 'element-plus'
import radio from './components/radio.vue'
import checkbox from './components/checkbox.vue';
import singleLine from './components/single_line.vue';
import multiLine from './components/multi_line.vue';
import richText from './components/rich_text.vue'
import integer from './components/integer.vue';
import float from './components/float.vue';
import uploadFile from './components/uploadFile.vue';
import range from './components/range.vue';
import periodic from './components/periodic.vue';
import downloadFile from './components/downloadFile.vue';
import fieIdGroup from './components/fieIdGroup.vue';
import timer from './components/timer.vue';

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const actvie_flag = ref(false)
const show_instructions = ref(true)
const show_global = ref(true)
const equipment_info = ref({})//设备详情
const groups_fieId_list = ref([])//用于添加样品组的初始化字段
const sample_name_list = reactive(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'])// A-Z 大写字母数组

//预约设备接口参数
const appoint_data = ref({
    equipmentId: route.query.equipment_id,//预约设备id
    //全局字段列表
	globalFieldValues: [
		{
			sampleName: '全局问题',
			fieIdList: [], //配置字段列表
		}
	],
    //样品组数据
    groups: [
        {
            show_groups: true,
            sampleName: "A",
            specimenNum: 0, //样品数量
            specimen_code_list: [],
            specimenCode: "", //样品编号
            specimenIngredient: "", //样品成分
            fieIdList: [], //配置字段列表,
        }
    ],
    message: '',//实验留言
    customRemark: '',//订单备注
    fieIdList: [],//上传附件
})

watch(
    () => appoint_data.value.groups.length,
    () => {
        console.log('appoint_data.value.groups', appoint_data.value.groups)
        appoint_data.value.groups.forEach((item, index) => {
            item.sampleName = sample_name_list[index]
            item.specimen_code_list.forEach(i => {
                if(i) {
                    i.value = i.value.replace(/^([A-Z])组/, `${sample_name_list[index]}组`)
                }
            })
        })
    },
    {
        deep: true,
    }
)

//获取设备详情
async function getEquipentInfo() {
    try {
        const res = await useGetEquipmentInfo(route.query.equipment_id)
        res.data.quipment_pic = import.meta.env.VITE_FILE_API + res.data.fileList[0].url
        res.data.QRCode_pic = import.meta.env.VITE_FILE_API + res.data.qrCodeFileList[0].url
        equipment_info.value = res.data
    }
    catch(err) {
        console.log(err)
    }
}
getEquipentInfo()

//判断是否可参与下单返现活动
async function getActives() {
    try {
        const res = await useGetActives(2)
        actvie_flag.value = res.data.activityStatusEnum == 2 ? true : false
    }
    catch(err) {
        console.log(err)
    }
}
getActives()

// 获取设备字段信息
async function getFieIdList() {
    loading.value = true
    const global_params = {
        equipmentId: route.query.equipment_id,
        type: 1,
    }
    const groups_params = {
        equipmentId: route.query.equipment_id,
        type: 2,
    }
    try {
        const res_global = await useGetFieIdList(global_params)
        appoint_data.value.globalFieldValues[0].fieIdList = initFieIdList(res_global.data)// 处理全局字段
        const res_groups = await useGetFieIdList(groups_params)
        appoint_data.value.groups[0].fieIdList = initFieIdList(res_groups.data)// 处理样品组字段
        groups_fieId_list.value = initFieIdList(res_groups.data)
    }
    finally{
        loading.value = false
    }
}
getFieIdList()

//添加样品组
function addGroup() {
    appoint_data.value.groups.push({
        show_groups: true,
        sampleName: sample_name_list[appoint_data.value.groups.length],
        specimenNum: 0, //样品数量
        specimen_code_list: [],
        specimenCode: "", //样品编号
        specimenIngredient: "", //样品成分
        fieIdList: groups_fieId_list.value, //配置字段列表,
    })
}
//删除样品组
function deleteGroup(group_index) {
    ElMessageBox.alert('是否删除该样品组', '温馨提示', {
        showCancelButton: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消',
    }).then(() => {
        appoint_data.value.groups.splice(group_index, 1)
    })
}
//复制样品组
function copyGroup(data) {
    const {show_groups, specimenNum, specimen_code_list, specimenCode, specimenIngredient, fieIdList} = data
    appoint_data.value.groups.push({
        show_groups,
        sampleName: sample_name_list[appoint_data.value.groups.length],
        specimenNum, //样品数量
        specimen_code_list,
        specimenCode, //样品编号
        specimenIngredient, //样品成分
        fieIdList, //配置字段列表,
    })
}
//更改全局字段的值
function updateGlobalValue(item, index, value) {
    const new_value = {
        ...item,
        ...value
    }
    appoint_data.value.globalFieldValues[0].fieIdList[index] = new_value
    appoint_data.value.globalFieldValues[0].fieIdList = changeRelevance(appoint_data.value.globalFieldValues[0].fieIdList, new_value, true)
}
//更改字段组字段的值
function updateGroupValue(fieId_item, group_index, fieId_index, value) {
    const new_value = {
        ...fieId_item,
        ...value
    }
    appoint_data.value.groups[group_index].fieIdList[fieId_index] = new_value
    appoint_data.value.groups[group_index].fieIdList = changeRelevance(appoint_data.value.groups[group_index].fieIdList, new_value, false)
}
// 更改样品数量
function changeNum(newValue, oldValue, group_index) {
    const num = newValue - oldValue
    if(num >= 0) {
        for(let i = 1; i <= num; i++) {
            appoint_data.value.groups[group_index].specimen_code_list.push({
                id: oldValue + i,
                value: `${appoint_data.value.groups[group_index].sampleName}组-${oldValue + i}`,
            })
        }
    } else {
        appoint_data.value.groups[group_index].specimen_code_list.splice(newValue, Math.abs(num))
    }
}
// 上传附件
function uploadOrderFile(fieIdList) {
    appoint_data.value.fieIdList = fieIdList
}
</script>

<template>
    <div>
        <div>还剩</div>
        <div>订单价格</div>
        <div>订单价格明细</div>
    </div>
    <div class="euipment-box flex-center">
        <div class="img-box flex-center">
            <el-image class="euipment-img" :src="equipment_info.quipment_pic">
                <template #error>
                    <img class="fail-pic" src="@/assets/img/fail_pic.png" />
                </template>
            </el-image>
        </div>
        <div class="info-box flex-center" v-loading="loading">
            <div class="font-middle font-600 font-5CC300">预约：{{ equipment_info.equipmentName }}</div>
            <div class="info-item flex-center">
                <span class="item-title">设备型号</span>
                <span class="font-5D5D5D">{{ equipment_info.equipmentModel }}</span>
            </div>
            <div class="info-item flex-center">
                <span class="item-title">预约次数</span>
                <span class="font-5D5D5D">{{ equipment_info.testsNumber }}次</span>
            </div>
            <div class="info-item flex-center">
                <span class="item-title">服务周期</span>
                <span class="font-5D5D5D">收到样品后平均{{ equipment_info.serviceDays }}个工作日完成</span>
            </div>
            <div class="info-item flex-center">
                <span class="item-title">实验员</span>
                <span class="font-5D5D5D">{{ equipment_info.testerName }}</span>
            </div>
            <div class="info-item flex-center font-FF4A2B" v-if="actvie_flag"> * 完成订单即可参与下单返现活动返现 * </div>
        </div>
        <div style="flex: 1;"></div>
        <div class="tips flex-center">
            <el-image class="tips-pic" :src="equipment_info.QRCode_pic">
                <template #error>
                    <img class="fail-pic" src="@/assets/img/fail_pic.png" alt="">
                </template>
             </el-image>
            <div class="multi-line-ellipsis-1 font-mini">{{ equipment_info.technicalAdvisorTextPrompts }}</div>
        </div>
    </div>
    
    <div class="profile">
        <div class="profile-head flex-center">
            <div class="flex-center">
                <div class="slider"></div>
                <span class="font-middle font-600">预约须知</span>
            </div>
            <div @click="show_instructions = !show_instructions">
                <el-icon class="caret-icon" v-if="show_instructions"><CaretTop /></el-icon>
                <el-icon class="caret-icon" v-else><CaretBottom /></el-icon>
            </div>
        </div>
        <el-collapse-transition>
            <div v-loading="loading" v-show="show_instructions">
                <div class="profile-content show_instructions" v-html="equipment_info.testingInstructions"></div>
            </div>
        </el-collapse-transition>
    </div>

    <div class="profile" v-if="appoint_data.globalFieldValues[0].fieIdList.length">
        <div class="profile-head flex-center">
            <div class="flex-center">
                <div class="slider"></div>
                <span class="font-middle font-600">全局问题</span>
            </div>
            <div @click="show_global = !show_global">
                <el-icon class="caret-icon" v-if="show_global"><CaretTop /></el-icon>
                <el-icon class="caret-icon" v-else><CaretBottom /></el-icon>
            </div>
        </div>
        <el-collapse-transition>
            <div class="profile-content" v-show="show_global" v-loading="loading">
                <div v-for="(item, index) in appoint_data.globalFieldValues[0].fieIdList" :key="item.fieIdId">
                    <!-- 单选 -->
                    <radio v-if="item.fieIdType == 1 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></radio>
                    <!-- 多选 -->
                    <checkbox v-else-if="item.fieIdType == 2 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></checkbox>
                    <!-- 单行文本 -->
                    <singleLine v-else-if="item.fieIdType == 3 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></singleLine>
                    <!-- 多行文本 -->
                    <multiLine v-else-if="item.fieIdType == 4 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></multiLine>
                    <!-- 富文本 -->
                    <richText v-else-if="item.fieIdType == 5 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></richText>
                    <!-- 整数 -->
                    <integer v-else-if="item.fieIdType == 6 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></integer>
                    <!-- 浮点数 -->
                    <float v-else-if="item.fieIdType == 7 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></float>
                    <!-- 上传附件 -->
                    <uploadFile v-else-if="item.fieIdType == 8 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></uploadFile>
                    <!-- 数字范围 -->
                    <range v-else-if="item.fieIdType == 9 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></range>
                    <!-- 元素周期表 -->
                    <periodic v-else-if="item.fieIdType == 10 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></periodic>
                    <!-- 附件下载 -->
                    <downloadFile v-else-if="item.fieIdType == 11 && item.show" :base_data="item"></downloadFile>
                    <!-- 字段组 -->
                    <fieIdGroup v-else-if="item.fieIdType == 12 && item.show" :base_data="item"></fieIdGroup>
                    <!-- 时间 -->
                    <timer v-else-if="item.fieIdType == 14 && item.show" :base_data="item" @updateValue="(value) => updateGlobalValue(item, index, value)"></timer>
                </div>
            </div>
        </el-collapse-transition>
    </div>

    <div v-if="appoint_data.groups.length">
        <div class="profile" v-for="(item, group_index) in appoint_data.groups" :key="group_index">
            <div class="profile-head flex-center">
                <div class="flex-center">
                    <div class="slider"></div>
                    <span class="font-middle font-600">{{ item.sampleName }}组样品</span>
                </div>
                <div class="flex-center">
                    <el-icon class="delete-icon" v-show="appoint_data.groups.length > 1" @click="deleteGroup(group_index)"><DeleteFilled /></el-icon>
                    <span class="copy-icon flex-center" @click="copyGroup(item)"><el-icon><CopyDocument /></el-icon>复制</span>
                    <el-icon class="caret-icon" v-if="item.show_groups" @click="item.show_groups = !item.show_groups"><CaretTop /></el-icon>
                    <el-icon class="caret-icon" v-else @click="item.show_groups = !item.show_groups"><CaretBottom /></el-icon>
                </div>
            </div>
            <el-collapse-transition>
                <div class="profile-content" v-show="item.show_groups" v-loading="loading">
                    <div class="fieId-box">
                        <div class="fieId-label">样品数量</div>
                        <div class="fieId-content">
                            <el-input-number :min="0" :step="1" step-strictly v-model="item.specimenNum" @change="(newValue, oldValue) => changeNum(newValue, oldValue, group_index)"/>
                        </div>
                    </div>
                    <div class="fieId-box">
                        <div class="fieId-label">样品编号</div>
                        <div class="fieId-content">
                            <div class="specimen-code" v-for="i in item.specimen_code_list" :key="i.id">
                                <el-input placeholder="请输入样品编号" v-model="i.value"/>
                            </div>
                        </div>
                    </div>
                    <div class="fieId-box">
                        <div class="fieId-label">样品成分</div>
                        <div class="fieId-content">
                            <el-input v-model="item.specimenIngredient" placeholder="请输入样品成分"/>
                        </div>
                    </div>
                    <div v-for="(fieId_item, fieId_index) in item.fieIdList" :key="fieId_item.fieIdId">
                        <!-- 单选 -->
                        <radio v-if="fieId_item.fieIdType == 1 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></radio>
                        <!-- 多选 -->
                        <checkbox v-else-if="fieId_item.fieIdType == 2 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></checkbox>
                        <!-- 单行文本 -->
                        <singleLine v-else-if="fieId_item.fieIdType == 3 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></singleLine>
                        <!-- 多行文本 -->
                        <multiLine v-else-if="fieId_item.fieIdType == 4 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></multiLine>
                        <!-- 富文本 -->
                        <richText v-else-if="fieId_item.fieIdType == 5 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></richText>
                        <!-- 整数 -->
                        <integer v-else-if="fieId_item.fieIdType == 6 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></integer>
                        <!-- 浮点数 -->
                        <float v-else-if="fieId_item.fieIdType == 7 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></float>
                        <!-- 上传附件 -->
                        <uploadFile v-else-if="fieId_item.fieIdType == 8 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></uploadFile>
                        <!-- 数字范围 -->
                        <range v-else-if="fieId_item.fieIdType == 9 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></range>
                        <!-- 元素周期表 -->
                        <periodic v-else-if="fieId_item.fieIdType == 10 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></periodic>
                        <!-- 附件下载 -->
                        <downloadFile v-else-if="fieId_item.fieIdType == 11 && fieId_item.show" :base_data="fieId_item"></downloadFile>
                        <!-- 字段组 -->
                        <fieIdGroup v-else-if="fieId_item.fieIdType == 12 && fieId_item.show" :base_data="fieId_item"></fieIdGroup>
                        <!-- 时间 -->
                        <timer v-else-if="fieId_item.fieIdType == 14 && fieId_item.show" :base_data="fieId_item" @updateValue="(value) => updateGroupValue(fieId_item, group_index, fieId_index, value)"></timer>
                    </div>
                </div>
            </el-collapse-transition>
        </div>
    </div>

    <div class="profile">
        <div class="profile-head flex-center">
            <div class="flex-center">
                <div class="slider"></div>
                <span class="font-middle font-600">其他实验信息</span>
            </div>
        </div>
        <div class="upload-file">
            <uploadFile :base_data="{fieIdName: '上传附件'}" @updateValue="uploadOrderFile"></uploadFile>
        </div>
        <div class="other-info-box">
            <div class="other-info">
                <div class="fieId-box">
                    <div class="fieId-label">实验留言</div>
                    <div class="fieId-content">
                        <el-input type="textarea" resize="none" :rows="4" placeholder="请输入实验留言" v-model="appoint_data.message"/>
                    </div>
                </div>
                <div class="fieId-box">
                    <div class="fieId-label">订单备注</div>
                    <div class="fieId-content">
                        <el-input type="textarea" resize="none" :rows="4" placeholder="请输入订单备注(可输入结算项目名称)" v-model="appoint_data.customRemark"/>
                    </div>
                </div>
            </div>
            <div class="button-box">
                <div class="flex-center price">
                    <span class="font-5D5D5D">合计费用： </span>
                    <span class="font-FF4A2B font-middle">￥{{ 99999 }}</span>
                    <img class="gold" src="@/assets/svg/money.svg" alt="">
                </div>
                <div class="default-button" @click="addGroup">添加样品</div>
                <div class="custom-button">下一步</div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.multi-line-ellipsis-1 {
    text-align: center;
}
:deep(.specimen-code .el-input__wrapper) {
    background-color: #94C9FF30 !important;
}

.euipment-box {
    justify-content: space-between;
    column-gap: 15px;
    width: 80vw;
    min-width: 1440px;
    margin: 10px auto 0;
    padding: 15px;
    border-radius: 10px;
    background-color: #FFFFFF;
    .img-box {
        width: 12vw;
        min-width: 172px;
        height: 12vw;
        min-height: 172px;
        border-radius: 12px;
        background: url('@/assets/img/equipment_background.png');
        background-size: cover;
        background-color: transparent;
        .euipment-img {
            width: 12vw;
            min-width: 172px;
            height: 12vw;
            min-height: 172px;
        }
    }
    .info-box {
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-around;
        width: 25vw;
        min-width: 360px;
        height: 12vw;
        min-height: 172px;
        padding: 0 15px;
        .info-item {
            justify-content: flex-start;
            width: 100%;
            .item-title {
                width: 30%;
            }
        }
    }
    .tips {
        flex-direction: column;
        justify-content: space-around;
        width: 10vw;
        min-width: 144px;
        height: 11vw;
        min-height: 158px;
        .tips-pic {
            width: 10vw;
            min-width: 144px;
            height: 10vw;
            min-height: 144px;
            border: 1px solid #E8E8E8;
            border-radius: 10px;
            background-color: #11111150;
        }
    }
}

.profile {
    width: 80vw;
    min-width: 1440px;
    margin: 10px auto 0;
    border-radius: 10px;
    background-color: #FFFFFF;
    .profile-head {
        justify-content: space-between;
        padding: 15px;
        width: 80vw;
        min-width: 1440px;
        background-color: #94C9FF30;
        .slider {
            width: 10px;
            height: 2rem;
            margin-right: 15px;
            background-color: #94C9FF;
        }
        .delete-icon {
            cursor: pointer;
            transform: scale(1.2);
            margin-right: 15px;
            color: #FF4A2B;
        }
        .copy-icon {
            cursor: pointer;
            margin-right: 15px;
        }
        .copy-icon:hover {
            color: #5CC300;
        }
        .caret-icon {
            cursor: pointer;
            transform: scale(2);
            margin-right: 15px;
        }
    }
    .profile-content {
        display: flex;
        flex-direction: column;
        row-gap: 10px;
        width: 80vw;
        min-width: 1440px;
        height: fit-content;
        padding: 15px;
 
    }
    .upload-file {
        padding: 15px;
        padding-bottom: 0;
    }
    .other-info-box {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        width: 80vw;
        min-width: 1440px;
        padding: 15px;
        .other-info {
            display: flex;
            flex-direction: column;
            row-gap: 15px;
            width: 75%;
            min-width: 1080px;
        }
        .button-box {
            display: flex;
            flex-direction: column;
            row-gap: 15px;
            width: 20%;
            min-width: 288px;
            height: 100%;
            .price {
                height: 80px;
                border: 1px solid #C8C9CC;
                border-radius: 5px;
                .gold {
                    width: 50px;
                    height: 50px;
                    margin-left: 5px;
                }
            }
            .default-button {
                height: 60px;
            }
            .custom-button {
                height: 60px;
            }
        }
    }
}
</style>