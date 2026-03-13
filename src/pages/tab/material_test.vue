<script setup>
import { ref } from 'vue'
import { useGetEquipmentList } from '@/api'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)
const menu_value = ref('全部')
const equipment_list = ref([])
const total = ref(0)

const params = ref({
    pageNum: 1,
    pageSize: 10,
    isCloudScene: 2,
    isGrounding: 1,
    status: 1,
    equipmentClassification: '',
})
const menu = [
    { label: '全部', value: '全部', },
    { label: '组织形貌', value: '组织形貌' },
    { label: '成分含量', value: '成分含量' },
    { label: '化学结构', value: '化学结构' },
    { label: '物理性能', value: '物理性能' },
    { label: '力学性能', value: '力学性能' },
    { label: '光电磁声', value: '光电磁声' },
    { label: '冷门测试', value: '冷门测试' },
    { label: '可靠性测试', value: '可靠性测试' },
]

async function getEquipmentList() {
    try {
        loading.value = true
        const res = await useGetEquipmentList(params.value)
        res.rows.forEach(item => {
            item.equipment_pic = (item.fileList && item.fileList.length) ? import.meta.env.VITE_FILE_API + item.fileList[0].url : ''
        })
        equipment_list.value = res.rows
        total.value = res.total
        loading.value = false
    }
    catch(err) {
        console.log(err)
    }
}
getEquipmentList()

function changeMenu(value) {
    if(menu_value.value == value) return
    menu_value.value = value
    params.value.pageNum = 1
    params.value.equipmentClassification = value == '全部' ? '' : value
    getEquipmentList()
}

// 前往设备详情
function toEquipmentDetail(equipment_id) {
    router.push(`/equipment_detail?equipment_id=${equipment_id}`)
}
</script>

<template>
    <div class="page-main">
        <div class="equipment-box">
            <div class="flex-center font-large box-head">材料检测项目</div>
            <div class="flex-center menu-box">
                <div 
                  class="button-style" 
                  :class="[item.value == menu_value ? 'custom-button' : 'default-button']" 
                  v-for="item in menu" 
                  :key="item.value"
                  @click="changeMenu(item.value)"
                >
                    <span>{{ item.label }}</span>
                </div>
            </div>
            <div class="box-main" v-loading="loading">
                <div style="width: 100%; height: 100%;" v-if="!equipment_list.length">
                    <el-empty description="暂无数据" />
                </div>
                <div class="card" v-else v-for="item in equipment_list" :key="item.id" @click="toEquipmentDetail(item.id)">
                    <div class="flex-center img-box">
                        <el-image class="card-img" :src="item.equipment_pic">
                            <template #error>
                                <img class="card-img" src="@/assets/img/fail_pic.png" />
                            </template>
                        </el-image>
                    </div>
                    <div class="card-info">
                        <div class="font-middle multi-line-ellipsis-1 info-name">{{ item.equipmentName }}</div>
                        <div class="font-5D5D5D multi-line-ellipsis-1">{{ item.equipmentModel }}</div>
                        <div class="data-box font-5D5D5D">
                            <div>
                                <span class="font-mini">已测试</span>
                                <span class="font-mini font-light">{{ item.testsNumber }}</span>
                                <span class="font-mini">次</span>
                            </div>
                            <div class="slider"></div>
                            <div>
                                <span class="font-mini">服务周期：平均</span>
                                <span class="font-mini font-light">{{ item.serviceDays }}</span>
                                <span class="font-mini">个工作日</span>
                            </div>
                        </div>
                    </div>
                    <div class="custom-button" @click.stop="router.push(`/appoint_order?equipment_id=${item.id}`)">立即预约</div>
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
        </div>
    </div>
</template>

<style lang="scss" scoped>
.page-main {
    width: 80vw;
    min-width: 1440px;
    margin: 0 auto;
}

.equipment-box {
    width: 80vw;
    min-width: 1440px;
    margin-top: 15px;
    background-color: #FFFFFF;
    .box-head {
        width: 80vw;
        min-width: 1440px;
        height: 80px;
        background-image: linear-gradient(to right, #9FFFD7, #BAFF75);
    }
    .menu-box {
        column-gap: 15px;
        justify-content: space-around;
        width: 100%;
        height: 60px;
        padding: 0 15px;
        background-color: #FFFFFF;
        .button-style {
            flex: 1;
            height: 35px;
        }
    }
    .box-main {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        perspective: 500px;
        width: 80vw;
        min-width: 1440px;
        min-height: calc((80vw - 90px) / 5 * 1.3);
        padding: 15px;
        .card {
            overflow: hidden;
            animation: card 0.5s linear;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: calc((80vw - 90px) / 5);
            min-width: 270px;
            border: 1px solid #E8E8E8;
            border-bottom: none;
            border-radius: 5% 5% 0 0;
            background-color: #fff;
            .img-box {
                width: calc((80vw - 90px) / 5);
                min-width: 270px;
                padding: 15px 0;
                background: url('@/assets/img/equipment_background.png');
                background-size: cover;
                background-color: transparent;
                .card-img {
                    width: calc((80vw - 90px) / 5 * 0.8);
                    min-width: 216px;
                    height: calc((80vw - 90px) / 5 * 0.65);
                    min-height: 175.5px;
                }
            }
            .card-info {
                cursor: default;
                display: flex;
                flex-direction: column;
                row-gap: 10px;
                align-items: center;
                width: calc((80vw - 90px) / 5);
                min-width: 270px;
                height: calc((80vw - 90px) / 5 / 3);
                min-height: 110px;
                border-top: none;
                .multi-line-ellipsis-1 {
                    width: 80%;
                    text-align: center;
                }
                .data-box {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 90%;
                    .slider {
                        height: 1rem;
                        border-left: 1px solid #E8E8E8;
                    }
                }
            }
            .custom-button {
                width: calc((80vw - 90px) / 5);
                min-width: 270px;
                height: calc((80vw - 90px) / 5 / 8);
                min-height: 34px;
                border: 1px solid #E8E8E8;
                border-top: none;
                border-radius: 0;
            }
        }
        .card:hover {
            box-shadow: -5px 5px 5px rgba(0, 0, 0, 0.2);
            transform: translateZ(3px);
            .card-info .info-name {
                color: #94C9FF;
            }
        }
    }
    .pagination-box {
        justify-content: flex-end;
        width: 100%;
        height: 60px;
        padding: 0 15px;
    }
}
</style>