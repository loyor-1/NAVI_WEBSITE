<script setup>
import { useGetEquipmentList } from '@/api'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const equipment_list = ref([])
const total = ref(0)

const params = ref({
    pageNum: 1,
    pageSize: 10,
    status: 1,
    isGrounding: 1,
    equipmentName: '',
})

watch(
    () => route.query,
    (newValue) => {
        params.value.equipmentName = newValue.key_value
        getEquipmentList()
    },
    {
        deep: true,
        immediate: true,
    }
)

async function getEquipmentList() {
    try {
        const res = await useGetEquipmentList(params.value)
        res.rows.forEach(item => {
            item.equipment_pic = (item.fileList && item.fileList.length) ? import.meta.env.VITE_FILE_API + item.fileList[0].url : ''
        })
        equipment_list.value = res.rows
        total.value = res.total
    }
    catch(err) {
        console.log(err)
    }
}

// 前往设备详情
function toEquipmentDetail(equipment_id) {
    router.push(`/equipment_detail?equipment_id=${equipment_id}`)
}

function toAppointOrder(equipment_id) {
    router.push(`/appoint_order?equipment_id=${equipment_id}`)
}
</script>

<template>
    <div class="flex-center-col page-main">
        <div style="width: 100%; height: 100%;" v-if="!equipment_list.length">
            <el-empty description="暂无数据" />
        </div>
        <div class="flex-center card" v-else v-for="item in equipment_list" :key="item.id">
            <div class="flex-center equipment-pic" @click="toEquipmentDetail(item.id)">
                <img :src="item.equipment_pic" alt="">
            </div>
            <div class="flex-center-col equipment-info">
                <div class="equipment-name">
                    <div class="font-middle">{{ item.equipmentName }}</div>
                    <div class="flex-center time-box">
                        <div class="font-5D5D5D">{{ item.equipmentModel }}</div>
                        <div>
                            <span class="font-5D5D5D">已测试</span>
                            <span class="font-light">{{ item.testsNumber }}</span>
                            <span class="font-5D5D5D">次</span>
                        </div>
                        <div>
                            <span class="font-5D5D5D">服务周期：平均</span>
                            <span class="font-light">{{ item.serviceDays }}</span>
                            <span class="font-5D5D5D">个工作日</span>
                        </div>
                    </div>
                </div>
                <div class="multi-line-ellipsis-2 font-5D5D5D introdection">检测项目：{{ item.detectionItemName }}</div>
                <div class="flex-center button-box">
                    <div class="default-button button-style" @click.stop="toEquipmentDetail(item.id)">查看详情</div>
                    <div class="custom-button button-style" @click.stop="toAppointOrder(item.id)">立即预约</div>
                </div>
            </div>
        </div>
    </div>
    <div class="pagination-box flex-center">
        <el-pagination
          v-model:current-page="params.pageNum"
          v-model:page-size="params.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :background="true"
          layout="total, sizes, prev, pager, next"
          :total="total"
          @change="getEquipmentList"
        />
    </div>
</template>

<style lang="scss" scoped>
.page-main {
    row-gap: 15px;
    justify-content: flex-start;
    width: 80vw;
    min-width: 1440px;
    min-height: calc(100vh - 580px);
    margin: 0 auto;
    padding: 15px;
    background-color: #FFFFFF90;
}

.card {
    justify-content: space-between;
    width: calc(80vw - 30px);
    min-width: 1410px;
    padding: 15px;
    border: 1px solid #E8E8E8;
    border-radius: 10px;
    background-color: #FFFFFF;
    .equipment-pic {
        cursor: pointer;
        width: calc((80vw - 30px) * 0.1);
        height: calc((80vw - 30px) * 0.1);
        padding: 15px;
        border: 1px solid #cccccc;
        border-radius: 10px;
        background: url('@/assets/img/equipment_background.png');
        background-size: cover;
        background-color: transparent;
        img {
            width: 100%;
            vertical-align: middle;
        }
    }
    .equipment-info {
        justify-content: space-between;
        align-items: flex-start;
        width: calc((80vw - 30px) * 0.87);
        height: calc((80vw - 30px) * 0.1);
        .equipment-name {
            width: 100%;
            height: 40%;
            .time-box {
                column-gap: 15px;
                justify-content: flex-start;
            }
        }
        .introdection {
            width: 100%;
            height: 35%;
            text-indent: 2em;
        }
        .button-box {
            column-gap: 30px;
            justify-content: flex-start;
            width: 100%;
            height: 25%;
            .button-style {
                width: 120px;
                height: 100%;
            }
        }
    }
}
.card:hover {
    background: linear-gradient(to right, #9FFFD730, #FFFFFF 50%);
}
.pagination-box {
    justify-content: flex-end;
    width: 80vw;
    min-width: 1440px;
    height: 60px;
    margin: 0 auto;
}
</style>