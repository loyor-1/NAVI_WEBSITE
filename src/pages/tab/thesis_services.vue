<script setup>
import { ref } from 'vue'
import { useGetEquipmentList } from '@/api'
import { useRouter } from 'vue-router'
import zybj from '@/assets/img/zybj.png'
import fwqm from '@/assets/img/fwqm.png'
import shws from '@/assets/img/shws.png'
import bzbj from '@/assets/img/bzbj.png'
import tjxq from '@/assets/img/tjxq.png'
import zxbjdd from '@/assets/img/zxbjdd.png'
import qrxq from '@/assets/img/qrxq.png'
import qrcg from '@/assets/img/qrcg.png'
import jfdg from '@/assets/img/jfdg.png'
import bzfw from '@/assets/img/bzfw.png'
import gjfw from '@/assets/img/gjfw.png'
import zwfy from '@/assets/img/zwfy.png'
import yzfw from '@/assets/img/yzfw.png'


const router = useRouter()

const loading = ref(false)
const equipment_list = ref([])
const total = ref(0)

const params = ref({
    pageNum: 1,
    pageSize: 10,
    isCloudScene: 9,
    isGrounding: 1,
    status: 1,
})
const list_1 = [
    {
        name: "确定需求",
        content: "确定论文服务需求",
        src: tjxq,
    },
    {
        name: "在线提交订单",
        content: "上传文章并完善相关信息",
        src: zxbjdd,
    },
    {
        name: "确认报价",
        content: "确认费用与交稿时间",
        src: qrxq,
    },
    {
        name: "编辑服务",
        content: "母语资深编辑修改",
        src: qrcg,
    },
    {
        name: "结果交付",
        content: "官网下载或邮箱接收结果",
        src: jfdg,
    },
]
const list_2 = [
    {
        name: "专业编辑",
        content: "每一份稿件均由资深母语专家进行处理， 根据您的学科领域、润色偏好为您挑选 匹配度最高的编辑",
        src: zybj,
    },
    {
        name: "服务全面",
        content: "个性化服务方案可选：选刊、排版、查重降重、同行评审、投稿全程支持等，满足您的不同需求",
        src: fwqm,
    },
    {
        name: "售后完善",
        content: "为您提供响应迅速、流程清晰的对接服务，专属客服人员第一时间与您沟通，客户满意度高达98",
        src: shws,
    },
    {
        name: "报账便捷",
        content: "为您提供优质售后服务，同测试服务一样，可以先润色后付款，开票内容可选，报账更加方便快捷",
        src: bzbj,
    },
]
const list_3 = [bzfw, gjfw, zwfy, yzfw]

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

function scrollToList() {
    const target = document.getElementById('equipment-list')
    if (target) {
        const rect = target.getBoundingClientRect()
        // 2. 计算最终滚动位置：视口顶部到目标的距离 + 页面已滚动高度 - 100px（下移100px）
        const targetTop = rect.top + window.scrollY - 180
        // 3. 滚动到计算后的位置
        window.scrollTo({
            top: targetTop,
            behavior: 'smooth' // 平滑滚动
        })
    }
}
</script>

<template>
    <div class="page-main">
        <img class="head-pic" src="@/assets/img/lunwenrunse.jpg" alt="">
        <div class="equipment-box" id="equipment-list">
            <div class="flex-center font-large box-head">材料加工项目</div>
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
            <div class="font-middle">论文润色服务流程</div>
            <div class="flex-center box-content">
                <div class="flex-center list-box" v-for="item in list_1" :key="item.name">
                    <div class="flex-center-col list-card">
                        <img class="list-card-img" :src="item.src" alt="">
                        <div>{{ item.name }}</div>
                        <div class="font-mini font-5D5D5D card-content">{{ item.content }}</div>
                    </div>
                    <img class="next-icon" src="@/assets/img/next.png" alt="">
                </div>
            </div>
        </div>
        <div class="flex-center-col advantage-box">
            <div class="font-middle">优势特点</div>
            <div class="flex-center box-content">
                <div class="flex-center list-box" v-for="item in list_2" :key="item.name">
                    <div class="flex-center-col list-card">
                        <img class="list-card-img" :src="item.src" alt="">
                        <div>{{ item.name }}</div>
                        <div class="font-mini font-5D5D5D card-content">{{ item.content }}</div>
                    </div>
                    <div class="border-icon"></div>
                </div>
            </div>
        </div>
        <div class="flex-center price-box">
            <div class="box-item" v-for="(item, index) in list_3" :key="index">
                <img class="price-pic" :src="item" alt="">
                <div class="flex-center-col button-box">
                    <div class="custom-button button-style" @click="scrollToList">立即下单</div>
                    <el-popover placement="top" width="700" trigger="hover">
                        <img style="width: 100%" src="@/assets/img/preview.jpg"/>
                        <template #reference>
                            <div class="default-button button-style">效果预览</div>
                        </template>
                    </el-popover>
                    
                </div>
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
.advantage-box {
    row-gap: 30px;
    width: 80vw;
    min-width: 1440px;
    padding: 30px 0;
    background-color: #FFFFFF;
    .box-content {
        column-gap: 15px;
        width: 80vw;
        min-width: 1440px;
        .list-box {
            column-gap: 15px;
            width: calc((100% - 75px) / 4);
            .list-card {
                width: 100%;
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
            .border-icon {
                width: 1px;
                height: 200px;
                background-color: #cccccc;
            }
        }
        .list-box:last-child .border-icon {
            display: none;
        }
    }
}
.price-box {
    column-gap: 15px;
    padding: 15px;
    background-color: #F6F8FF;
    .box-item {
        position: relative;
        width: calc((100% - 75px) / 4);
        .price-pic {
            width: 100%;
            vertical-align: middle;
        }
        .button-box {
            position: absolute;
            bottom: 3%;
            left: 50%;
            transform: translateX(-50%);
            row-gap: 10px;
            width: 80%;
            .button-style {
                width: 100%;
                height: 35px;
            }
        }
    }
}

</style>