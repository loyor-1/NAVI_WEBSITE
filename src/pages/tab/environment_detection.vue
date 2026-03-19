<script setup>
import { ref } from 'vue'
import { useGetEquipmentList } from '@/api'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)
const tab_value = ref('水')
const content_value = ref({})
const equipment_list = ref([])
const total = ref(0)

const params = ref({
    pageNum: 1,
    pageSize: 10,
    isCloudScene: 6,
    isGrounding: 1,
    status: 1,
})

const data = {
    tab: ['水', '土壤', '气', '固废', '噪音'],
    content: [
        {
            tag: ['国标','行标','CMA/CNAS资质'],
            text: '银、锌、锡、硒、铜、铁、锑、钛、锶、砷、铅、铍、硼、镍、钠、钼、锰、镁、铝、硫、磷、锂、钾、硅、钴、铬、镉、锆、钙、钒、铋、钡、锌、砷、硼、硅、汞、阴离子表面活性剂、悬浮物、细菌总数、五日生化需氧量、石油类、氰化物、耐热大肠菌群、氯化物、硫酸盐、硫化物、挥发酚、化学需氧量、类类大肠菌、植物物油、大肠菌群、氨氮、pH值、六价铬',
        },
        {
            tag: ['国标','行标','CMA/CNAS资质'],
            text: '锌、钒、砷、钼、锑、铜、锌、铅、镉、铬、汞、砷、锰、钡、钒、锶、钛、钙、镁、铁、铝、钾、硅',
        },
        {
            tag: ['国标','行标','CMA/CNAS资质'],
            text: '甲烷、臭气浓度、氨、氣、硫化氢、非甲烷总烃、总烃',
        },
        {
            tag: ['国标','行标','CMA/CNAS资质'],
            text: '银、锌、铜、铁、锑、钛、铊、锶、铅、铍、总镍、钠、锰、镁、铝、钾、钴、铬、镉、钙、钒、钡',
        },
        {
            tag: ['国标','行标','CMA/CNAS资质'],
            text: '工业企业厂界噪声（昼间、夜间）、社会生活环境噪声（昼间、夜间）、建筑施工厂界噪声（昼间、夜间）',
        },
    ]
}

function changeTab(value, index) {
    tab_value.value = value
    content_value.value = data.content[index]
}
changeTab(tab_value.value, 0)

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
        loading.value = false
    }
}
getEquipmentList()

// 前往设备详情
function toEquipmentDetail(equipment_id) {
    router.push(`/equipment_detail?equipment_id=${equipment_id}`)
}
</script>

<template>
    <div class="page-main">
        <img class="head-pic" src="@/assets/img/huanjingjiance.jpg" alt="">
        <div class="flex-center-col box-1">
            <div class="font-middle">业务范围</div>
            <div class="flex-center tab-box">
                <div class="tab-style" :class="[tab_value == item ? 'custom-button' : 'default-button']" v-for="(item, index) in data.tab" :key="index" @click="changeTab(item, index)">{{ item }}</div>
            </div>
            <div class="font-middle title">{{ tab_value }}</div>
            <div class="tag-box">
                <el-tag class="tags" v-for="item in content_value.tag" :key="item" type="primary" effect="dark">{{ item }}</el-tag>
            </div>
            <div class="tag-box">{{ content_value.text }}</div>
        </div>
        <div class="equipment-box">
            <div class="flex-center font-large box-head">环境检测项目</div>
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
                    <div class="custom-button" @click.stop="router.push(`/appoint_order?equipment_id=${item.id}`)">立即下单</div>
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

.head-pic {
    width: 100%;
    vertical-align: middle;
}
.box-1 {
    width: 100%;
    row-gap: 15px;
    padding: 15px;
    background-color: #FFFFFF;
    .tab-box {
        column-gap: 30px;
        .tab-style {
            width: 120px;
            height: 30px;
        }
    }
    .title {
        width: 80%;
        margin-top: 15px;
        border-bottom: 1px solid #111111;
    }
    .tag-box {
        width: 80%;
        .tags {
            margin-right: 15px;
        }
    }
}
.equipment-box {
    width: 80vw;
    min-width: 1440px;
    background-color: #FFFFFF;
    .box-head {
        width: 80vw;
        min-width: 1440px;
        height: 80px;
        background-image: linear-gradient(to right, #9FFFD7, #BAFF75);
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