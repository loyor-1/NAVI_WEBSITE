<script setup>
import { ref } from 'vue'
import { useGetEquipmentList } from '@/api'
import { useRouter } from 'vue-router'
import gtxd from '@/assets/img/gtxd.png'
import yysj from '@/assets/img/yysj.png'
import xccs from '@/assets/img/xccs.png'
import fyjs from '@/assets/img/fyjs.png'
import yjyp from '@/assets/img/yjyp.png'
import spcs from '@/assets/img/spcs.png'

const router = useRouter()

const loading = ref(false)
const equipment_list = ref([])
const total = ref(0)

const params = ref({
    pageNum: 1,
    pageSize: 10,
    isCloudScene: 1,
    isGrounding: 1,
    status: 1,
})
const list_1 = [
    {
        name: "沟通下单",
        content: "与客服沟通样品需求，确认样品满足现场测试需求并下单",
        src: gtxd,
    },
    {
        name: "预约时间",
        content: "预约好具体测试时间，按照预约时间合理安排自己的行程",
        src: yysj,
    },
    {
        name: "现场测试",
        content: "带上样品按照预约时间到现场测试，样品编号请尽量简洁",
        src: xccs,
    },
    {
        name: "费用结算",
        content: "在测试完成后，根据测试时间长短进行费用的结算工作",
        src: fyjs,
    }
]
const list_2 = [
    {
        name: "沟通下单",
        content: "与客服沟通样品需求，确认样品满足现场测试需求并下单",
        src: gtxd,
    },
    {
        name: "邮寄样品",
        content: "打印订单，和样品一起邮寄，样品编号请尽量用简单数字",
        src: yjyp,
    },
    {
        name: "视频测试",
        content: "收到样品，约定好时间，通过腾讯会议进行云现场测试",
        src: spcs,
    },
    {
        name: "费用结算",
        content: "在测试完成后，根据测试时间长短进行费用的结算工作",
        src: fyjs,
    }
]
const list_3 = [
    {
        index: 1,
        content:"粉末，液体，薄膜，块体样品均可测试，粉末准备10mg，液体准备1ml，薄膜标记好测试面，块体尺寸：长宽最好≤10mm，高度最好≤5mm，并标记好测试面；样品需无放射性、无毒、无腐蚀性和无其他危险性。"
    },
    {
        index: 2,
        content:"云现场客户，为能及时联系您，请写清楚您的联系方式，测试时间会提前告知，请您安排好时间。若开始前20分钟联系不上您，我们可取消您的预约。若您无法参与已经预约的测试,请提前联系取消预约或更改时间。"
    },
    {
        index: 3,
        content:"具体收费项目包括:实验时长和制样部分。下单后客服会与您联系确认具体预约时长，最终收费按实际时长，多退少补。预约时长半小时起，半小时为节点；只有剩余时长超过半小时才会退费，退费以半小时为节点。"
    }
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
        <img class="box-1" src="@/assets/img/yunxianchang.jpg" alt="">
        <div class="equipment-box">
            <div class="flex-center font-large box-head">热门设备</div>
            <div class="box-main" v-loading="loading">
                <div class="card" v-for="item in equipment_list" :key="item.id" @click="toEquipmentDetail(item.id)">
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
            <div class="pagination-box flex-center" v-if="!apply_invoice_switch">
                <el-pagination
                  v-model:current-page="params.pageNum"
                  v-model:page-size="params.pageSize"
                  :page-sizes="[20, 30, 40, 50]"
                  :background="true"
                  layout="total, sizes, prev, pager, next"
                  :total="total"
                />
            </div>
        </div>
        <div class="flex-center-col box-2">
            <div class="font-middle font-94C9FF">高清实时直连电镜屏幕，测试老师与您一对一</div>
            <div class="font-5D5D5D">预约前务必提前沟通，预约热线400-168-0661</div>
            <img src="@/assets/img/cloud_img1.png" alt="">
        </div>
        <div class="flex-center-col box-3">
            <div class="font-middle">现场测试流程</div>
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
            <div class="font-middle">云现场测试流程</div>
            <div class="flex-center box-content">
                <div class="flex-center list-box" v-for="item in list_2" :key="item.name">
                    <div class="flex-center-col list-card">
                        <img class="list-card-img" :src="item.src" alt="">
                        <div>{{ item.name }}</div>
                        <div class="font-mini font-5D5D5D card-content">{{ item.content }}</div>
                    </div>
                    <img class="next-icon" src="@/assets/img/next.png" alt="">
                </div>
            </div>
        </div>
        <div class="flex-center-col box-4">
            <div class="font-middle">实验说明</div>
            <div class="flex-center tips" v-for="item in list_3" :key="item.index">
                <div class="flex-center font-middle font-FFFFFF index-icon">{{ item.index }}</div>
                <div class="box-4-content">{{ item.content }}</div>
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

.box-1 {
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
.box-2 {
    row-gap: 15px;
    width: 100%;
    padding-top: 15px;
    background-color: #F8F8FA;
    img {
        width: 100%;
    }
}
.box-3 {
    row-gap: 30px;
    width: 100%;
    padding: 15px 0 30px;
    background: url('@/assets/img/flowbg.png') no-repeat;
    background-size: 100% 100%;
    .box-content {
        column-gap: 30px;
        justify-content: space-around;
        .list-box {
            column-gap: 30px;
            .list-card {
                padding-bottom: 15px;
                border-radius: 10px;
                background-color: #FFFFFF;
                .list-card-img {
                    width: 12vw;
                    min-width: 216px;
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
        .list-box:last-child .next-icon {
            display: none;
        }
    }
}
.box-4 {
    row-gap: 30px;
    width: 100%;
    padding: 15px 0 30px;
    background: url('@/assets/img/tipsbg.png') no-repeat;
    background-size: 100% 100%;
    .tips {
        column-gap: 20px;
        justify-content: space-between;
        width: 95%;
        height: 80px;
        padding: 10px;
        border-radius: 40px 10px 10px 40px;
        background-color: #FFFFFF;
        .index-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #94C9FF;
        }
        .box-4-content {
            width: calc(100% - 80px);
        }
    }
}
</style>