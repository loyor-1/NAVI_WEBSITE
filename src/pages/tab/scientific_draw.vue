<script setup>
import { ref } from 'vue'
import { useGetEquipmentList } from '@/api'
import { useRouter } from 'vue-router'
import tjxq from '@/assets/img/tjxq.png'
import gtxj from '@/assets/img/gtxj.png'
import qrxq from '@/assets/img/qrxq.png'
import qrcg from '@/assets/img/qrcg.png'
import jfdg from '@/assets/img/jfdg.png'


const router = useRouter()

const loading = ref(false)
const equipment_list = ref([])
const total = ref(0)

const params = ref({
    pageNum: 1,
    pageSize: 10,
    isCloudScene: 10,
    isGrounding: 1,
    status: 1,
})

const list = [
    {
        name: "提交需求",
        content: "填写具体需求并提交，建议准备好详细介绍文字、草图、 参考图等，可加快沟通进展",
        src: tjxq,
    },
    {
        name: "沟通细节",
        content: "确认要求、预估周期、具体费用等",
        src: gtxj,
    },
    {
        name: "确认需求",
        content: "要求、周期以及费用无异议后， 开启作图流程",
        src: qrxq,
    },
    {
        name: "确认初稿",
        content: "3-5个工作日给出初稿，经过确认无误后按照细节继续完善图稿",
        src: qrcg,
    },
    {
        name: "交付定稿",
        content: "终稿完成后，所有不动大结构的修改全部免费，直到您满意为止",
        src: jfdg,
    },
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

// 前往设备详情
function toEquipmentDetail(equipment_id) {
    router.push(`/equipment_detail?equipment_id=${equipment_id}`)
}
</script>

<template>
    <div class="page-main">
        <img class="head-pic" src="@/assets/img/keyanhuitu.jpg" alt="">
        <div class="equipment-box">
            <div class="flex-center font-large box-head">科研绘图项目</div>
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
        <div class="flex-center-col step-box">
            <div class="font-middle">科研绘图服务流程</div>
            <div class="flex-center box-content">
                <div class="flex-center list-box" v-for="item in list" :key="item.name">
                    <div class="flex-center-col list-card">
                        <img class="list-card-img" :src="item.src" alt="">
                        <div>{{ item.name }}</div>
                        <div class="font-mini font-5D5D5D card-content">{{ item.content }}</div>
                    </div>
                    <img class="next-icon" src="@/assets/img/next.png" alt="">
                </div>
            </div>
        </div>
        <div class="flex-center img-box">
            <img src="@/assets/img/exhibitImage1.jpg" alt="">
            <img src="@/assets/img/exhibitImage2.jpg" alt="">
            <img src="@/assets/img/exhibitImage3.jpg" alt="">
            <img src="@/assets/img/exhibitImage4.jpg" alt="">
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
.step-box {
    row-gap: 30px;
    width: 80vw;
    min-width: 1440px;
    padding: 30px 0;
    background: url('@/assets/img/flowbg.png') no-repeat;
    background-size: 100% 100%;
    .box-content {
        column-gap: 15px;
        width: 80vw;
        min-width: 1440px;
        .list-box {
            column-gap: 15px;
            width: calc((100% - 310px) / 5 + 55px);
            .list-card {
                width: calc(100% - 55px);
                padding-bottom: 15px;
                .list-card-img {
                    width: 60%;
                }
                .card-content {
                    width: 60%;
                    text-align: center;
                    margin-top: 15px;
                }
            }
            .next-icon {
                width: 40px;
            }
        }
        .list-box:last-child {
            width: calc((100% - 310px) / 5);
            .list-card {
                width: 100%;
            }
        } 
        .list-box:last-child .next-icon {
            display: none;
        }
    }
}
.img-box {
    column-gap: 30px;
    padding: 15px;
    border-top: 1px solid #E8E8E8;
    background-color: #F8F8FA;
    img {
        width: calc((100% - 120px) / 4);
        vertical-align: middle;
    }
}
</style>