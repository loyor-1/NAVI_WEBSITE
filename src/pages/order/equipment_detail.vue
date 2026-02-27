<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useGetEquipmentInfo } from '@/api'
import { ref } from 'vue';

const route = useRoute()
const router = useRouter()

const equipment_info = ref({})//设备详情

//获取设备详情
async function getEquipmentInfo() {
    try {
        const res = await useGetEquipmentInfo(route.query.equipment_id)
        res.data.equipment_pic = import.meta.env.VITE_FILE_API + res.data.fileList[0].url
        res.data.QRCode_pic = import.meta.env.VITE_FILE_API + res.data.qrCodeFileList[0].url
        equipment_info.value = res.data
    }
    catch(err) {
        console.log(err)
    }
}
getEquipmentInfo()

</script>

<template>
    <div class="euipment-box flex-center">
        <div class="img-box flex-center">
            <el-image class="euipment-img" :src="equipment_info.equipment_pic">
                <template #error>
                    <img class="fail-pic" src="@/assets/img/fail_pic.png" />
                </template>
            </el-image>
        </div>
        <div class="info-box flex-center">
            <div class="font-middle font-600">{{ equipment_info.equipmentName }}</div>
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
            <div class="custom-button" @click="router.push(`/appoint_order?equipment_id=${equipment_info.id}`)">立即预约</div>
        </div>
        <div style="flex: 1;"></div>
        <div class="tips flex-center">
            <el-image class="tips-pic" :src="equipment_info.QRCode_pic">
                <template #error>
                    <img class="fail-pic" src="@/assets/img/fail_pic.png" alt="">
                </template>
             </el-image>
            <div class="multi-line-ellipsis-1">{{ equipment_info.technicalAdvisorTextPrompts }}</div>
        </div>
        <div class="tips flex-center">
            <img class="tips-pic" src="@/assets/img/advantage.png" alt="">
            <div class="multi-line-ellipsis-1">我们的优势</div>
        </div>
    </div>

    <div class="profile">
        <div class="profile-head flex-center">
            <div class="slider"></div>
            <span class="font-middle font-600">项目简介</span>
        </div>
        <div class="profile-content" v-html="equipment_info.projectIntroduction"></div>
    </div>

    <div class="profile">
        <div class="profile-head flex-center">
            <div class="slider"></div>
            <span class="font-middle font-600">样品要求</span>
        </div>
        <div class="profile-content" v-html="equipment_info.sampleRequirements"></div>
    </div>

    <div class="profile">
        <div class="profile-head flex-center">
            <div class="slider"></div>
            <span class="font-middle font-600">常见问题</span>
        </div>
        <div class="profile-content profile-QA" v-html="equipment_info.frequentlyQuestion"></div>
    </div>

    <div class="profile">
        <div class="profile-head flex-center">
            <div class="slider"></div>
            <span class="font-middle font-600">检测须知</span>
        </div>
        <div class="profile-content" v-html="equipment_info.testingInstructions"></div>
    </div>

    <div class="profile">
        <div class="profile-head flex-center">
            <div class="slider"></div>
            <span class="font-middle font-600">结果展示</span>
        </div>
        <div class="profile-content" v-html="equipment_info.resultsDisplay"></div>
    </div>
</template>

<style lang="scss" scoped>
.multi-line-ellipsis-1 {
    text-align: center;
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
        width: 14vw;
        min-width: 200px;
        height: 14vw;
        min-height: 200px;
        border-radius: 12px;
        background: url('@/assets/img/equipment_background.png');
        background-size: cover;
        background-color: transparent;
        .euipment-img {
            width: 100%;
        }
    }
    .info-box {
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-around;
        width: 25vw;
        min-width: 360px;
        height: 14vw;
        min-height: 200px;
        padding: 0 15px;
        .info-item {
            justify-content: flex-start;
            width: 100%;
            .item-title {
                width: 30%;
            }
        }
        .custom-button {
            width: 100%;
            height: 40px;
        }
    }
    .tips {
        flex-direction: column;
        justify-content: space-around;
        width: 12vw;
        min-width: 172px;
        height: 13vw;
        min-height: 187px;
        .tips-pic {
            width: 12vw;
            min-width: 172px;
            height: 12vw;
            min-height: 172px;
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
        justify-content: flex-start;
        padding: 15px;
        background-color: #94C9FF30;
        .slider {
            width: 10px;
            height: 2rem;
            margin-right: 15px;
            background-color: #94C9FF;
        }
    }
    .profile-content {
        display: flex;
        flex-direction: column;
        row-gap: 10px;
        padding: 15px;
    }
    .profile-QA {
        :nth-child(2n - 1) {
            margin-top: 20px;
        }
    }
}
</style>