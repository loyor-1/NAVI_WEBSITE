<script setup>
import { useGetEquipmentList } from '@/api'
import zljs from '@/assets/img/zljs.png'
import zlpy from '@/assets/img/zlpy.png'
import zldh from '@/assets/img/zldh.png'
import zybj from '@/assets/img/zybj.png'
import fwqm from '@/assets/img/fwqm.png'
import ynzj from '@/assets/img/ynzj.png'
import shws from '@/assets/img/shws.png'
import zyjd from '@/assets/img/zyjd.png'
import zljx from '@/assets/img/zljx.png'
import djzlj from '@/assets/img/djzlj.png'
import cbsc from '@/assets/img/cbsc.png'
import szsc from '@/assets/img/szsc.png'
import sqjf from '@/assets/img/sqjf.png'
import hdzs from '@/assets/img/hdzs.png'
import kyjx from '@/assets/img/kyjx.png'
import jjrc from '@/assets/img/jjrc.png'
import kypt from '@/assets/img/kypt.png'
import kyxm from '@/assets/img/kyxm.png'
import xmsb from '@/assets/img/xmsb.png'
import xmlx from '@/assets/img/xmlx.png'
import xmyj from '@/assets/img/xmyj.png'
import xmjt from '@/assets/img/xmjt.png'
import xmpj from '@/assets/img/xmpj.png'
import xmgs from '@/assets/img/xmgs.png'
import tjwx from '@/assets/img/tjwx.png'
import tcyq from '@/assets/img/tcyq.png'
import bj from '@/assets/img/bj.png'
import qrhz from '@/assets/img/qrhz.png'
import ksyz from '@/assets/img/ksyz.png'
import jgjf from '@/assets/img/jgjf.png'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const first_list = [
    { name: "专利检索与申请", content: "帮您保护来之不易的科研成果", src: zljs },
    { name: "专利培育与挖掘", content: "帮您寻找科研成果闪光点", src: zlpy },
    { name: "专利导航与分析", content: "帮您寻找科研新路径", src: zldh },
]
const seconed_list = [
    { name: "专业的博士团队", src: zybj },
    { name: "优选代理机构合作", src: fwqm },
    { name: "资深的业内专家", src: ynzj },
    { name: "订单直通车1V1服务", src: shws }
]
const third_list = [
    { name: "1.专业交底", src: zyjd },
    { name: "2.专利撰写", src: zljx },
    { name: "3.递交专利局", src: djzlj },
    { name: "4.初步审查", src: cbsc },
    { name: "5.实质审查", src: szsc },
    { name: "6.授权缴费", src: sqjf },
    { name: "7.获得证书", src: hdzs },
]
const fourth_list = [
    { name: "科技奖项", content: "进步/发明/自然/杰出贡献", src: kyjx },
    { name: "基金人才", content: "长江/中原/杰青/优青/百千万/院士", src: jjrc },
    { name: "科研平台", content: "技术中心/研发机构/重点实验室/院士工作站", src: kypt },
    { name: "科研项目", content: "科技攻关/重大专项/重点项目", src: kyxm },
]
const fifth_list = [
    { name: "1.申报", src: xmsb },
    { name: "2.立项", src: xmlx },
    { name: "3.研究", src: xmyj },
    { name: "4.评估", src: xmsb },
    { name: "5.结题", src: xmjt },
    { name: "6.评奖", src: xmpj },
    { name: "7.公示", src: xmgs },
]
const sixth_list = [
    { name: "1.添加微信", src: tjwx },
    { name: "2.提出要求", src: tcyq },
    { name: "3.报价", src: bj },
    { name: "4.确认合作", src: qrhz },
    { name: "5.开始运作", src: ksyz },
    { name: "6.结果交付", src: jgjf },
]

const loading = ref(false)
const equipment_list = ref([])

async function getEquipmentList() {
    try {
        loading.value = true
        const params = {
            pageNum: 1,
            pageSize: 20,
            isCloudScene: 11,
            isGrounding: 1,
            status: 1,
        }
        const res = await useGetEquipmentList(params)
        res.rows.forEach(item => {
            item.equipment_pic = (item.fileList && item.fileList.length) ? import.meta.env.VITE_FILE_API + item.fileList[0].url : ''
        })
        equipment_list.value = res.rows
        loading.value = false
    }
    catch(err) {
        console.log(err)
        loading.value = false
    }
}
getEquipmentList()
</script>

<template>
    <div class="flex-center page-main">
        <el-scrollbar>
            <div class="flex-center-col service-list">
                <div class="flex-center-col equipment-card" v-for="item in equipment_list" :key="item.id">
                    <el-image class="card-img" :src="item.equipment_pic">
                        <template #error>
                            <img class="card-img" src="@/assets/img/fail_pic.png" />
                        </template>
                    </el-image>
                    <div class="font-600 multi-line-ellipsis-1 card-text">{{ item.equipmentName }}</div>
                    <div class="card-text">
                        <span class="font-mini font-5D5D5D">服务周期：平均</span>
                        <span class="font-mini font-5D5D5D font-FF5000">{{ item.serviceDays }}</span>
                        <span class="font-mini font-5D5D5D">个工作日</span>
                    </div>
                    <div class="flex-center card-text">
                        <div class="font-mini font-5D5D5D">{{ item.equipmentModel }}</div>
                        <div>
                            <span class="font-mini font-5D5D5D">已测试</span>
                            <span class="font-mini font-5D5D5D font-FF5000">{{ item.testsNumber }}</span>
                            <span class="font-mini font-5D5D5D">次</span>
                        </div>
                    </div>
                    <div class="custom-button button-style" @click.stop="router.push(`/appoint_order?equipment_id=${item.id}`)">立即预约</div>
                </div>
            </div>
        </el-scrollbar>
        
        <el-scrollbar>
            <div class="info-box">
                <img class="first-pic" src="@/assets/img/zhuanlifuwu.jpg" alt="">
                <div class="flex-center-col first-list">
                    <div class="font-large font-600">专利服务</div>
                    <div class="font-5D5D5D list-title">资深专利专家与数十位硕博团队，为您提供专业的专利服务，涵盖专利申请、运用全流程，赋予您的科研成果权利、价值和荣誉。</div>
                    <div class="flex-center first-list-box">
                        <div class="flex-center-col first-list-item" v-for="(item, index) in first_list" :key="index">
                            <img :src="item.src" alt="">
                            <div>{{ item.name }}</div>
                            <div class="font-5D5D5D">{{ item.content }}</div>
                        </div>
                    </div>
                </div>
                <div class="flex-center-col seconed-list">
                    <div class="font-large font-600">优势特点</div>
                    <div class="flex-center seconed-list-box">
                        <div class="flex-center-col seconed-list-item" v-for="(item, index) in seconed_list" :key="index">
                            <img :src="item.src" alt="">
                            <div>{{ item.name }}</div>
                        </div>
                    </div>
                </div>
                <div class="flex-center-col third-list">
                    <div class="font-large font-600">专利申请流程</div>
                    <div class="flex-center third-list-box">
                        <div class="flex-center-col third-list-item" v-for="(item, index) in third_list" :key="index">
                            <img :src="item.src" alt="">
                            <div class="third-item-text">{{ item.name }}</div>
                        </div>
                    </div>
                </div>
                <div class="flex-center-col fourth-list">
                    <div class="font-large font-600">成果报奖</div>
                    <div class="font-5D5D5D list-title">全球知名的科研平台，优秀专业的成果报奖团队为您提供PPT、视频、专利、项目书的策划、制作服务。将您的科研生动地呈现在专家评面前！</div>
                    <div class="flex-center fourth-list-box">
                        <div class="flex-center-col fourth-list-item" v-for="(item, index) in fourth_list" :key="index">
                            <img :src="item.src" alt="">
                            <div>{{ item.name }}</div>
                            <div class="font-mini font-5D5D5D">{{ item.content }}</div>
                        </div>
                    </div>
                </div>
                <div class="flex-center-col fifth-list">
                    <div class="font-large font-600">项目申报流程</div>
                    <div class="flex-center fifth-list-box">
                        <div class="flex-center fifth-list-item" v-for="(item, index) in fifth_list" :key="index">
                            <div class="flex-center-col fitth-img-box">
                                <img class="fifth-list-icon" :src="item.src" alt="">
                                <div>{{ item.name }}</div>
                            </div>
                            <img class="fifth-list-next" src="@/assets/img/next.png" />
                        </div>
                    </div>
                </div>
                <div class="flex-center-col sixth-list">
                    <div class="font-large font-600">服务流程</div>
                    <div class="flex-center sixth-list-box">
                        <div class="flex-center sixth-list-item" v-for="(item, index) in sixth_list" :key="index">
                            <div class="sixth-item-border"></div>
                            <div class="flex-center-col">
                                <img class="sixth-list-icon" :src="item.src" alt="">
                                <div>{{ item.name }}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex-center-col seventh-list">
                    <div class="font-large font-600">PPT美化</div>
                    <div class="flex-center seventh-list-box">
                        <div class="flex-center-col seventh-list-item">
                            <img src="@/assets/img/ppt1.jpeg" alt="">
                            <div class="font-5D5D5D">深度优化（PPT封面）   100元/页起</div>
                        </div>
                        <div class="flex-center-col seventh-list-item">
                            <img src="@/assets/img/ppt2.jpeg" alt="">
                            <div class="font-5D5D5D">深度优化（PPT封面）   100元/页起</div>
                        </div>
                    </div>
                </div>
            </div>
        </el-scrollbar>
    </div>

</template>

<style lang="scss" scoped>
.page-main {
    width: calc(88vw - 30px);
    min-width: 1238px;
    height: calc(100vh - 30px);
    background-color: #FFFFFF90;
}
.service-list {
    row-gap: 15px;
    justify-content: flex-start;
    perspective: 500px;
    width: calc((88vw - 30px) * 0.2);
    min-width: 247px;
    min-height: calc(100vh - 30px);
    padding: 15px 0;
    background-color: #FFFFFF;
}
.info-box {
    width: calc((88vw - 30px) * 0.8);
    min-width: 990px;
    height: calc(100vh - 30px);
    border-left: 1px solid #E8E8E8;
}

.equipment-card {
    transition: all 0.3s ease;
    overflow: hidden;
    row-gap: 5px;
    width: calc((88vw - 30px) * 0.2 * 0.9);
    min-width: 222px;
    border: 1px solid #E8E8E8;
    border-radius: 10px 10px 0 0;
    background-color: #FFFFFF;
    .card-img {
        width: calc((88vw - 30px) * 0.2 * 0.9);
        height: calc((88vw - 30px) * 0.2 * 0.9 * 0.62);
    }
    .card-text {
        justify-content: space-between;
        width: 80%;
        text-align: center;
    }
    .button-style {
        width: 100%;
        height: 35px;
        border-radius: 0;
    }
}
.equipment-card:hover {
    box-shadow: -5px 5px 5px rgba(0, 0, 0, 0.2);
    transform: translateZ(3px);
    .card-info .font-middle {
        color: #94C9FF;
    }
}

.first-pic {
    width: 100%;
    vertical-align: middle;
}
.first-list {
    row-gap: 30px;
    padding: 30px 0;
    background-color: #E4EBF8;
    .list-title {
        padding: 0 15px;
        text-align: center;
    }
    .first-list-box {
        justify-content: space-around;
        width: 100%;
        .first-list-item {
            width: 30%;
            padding: 30px 0;
            border: 1px solid #afafaf;
            img {
                width: 30%;
            }
        }
    }
}
.seconed-list {
    row-gap: 30px;
    padding: 30px 0;
    justify-content: space-around;
    background-color: #F8F8FA;
    .seconed-list-box {
        width: 100%;
        .seconed-list-item {
            flex: 1;
            row-gap: 15px;
            border-left: 1px solid #afafaf;
            img {
                width: 40%;
            }
        }
        .seconed-list-item:first-child {
            border: none;
        }
    }
}
.third-list {
    row-gap: 30px;
    padding: 30px 0;
    justify-content: space-around;
    background-color: #E4EBF8;
    .third-list-box {
        width: 100%;
        column-gap: 15px;
        .third-list-item {
            width: calc((100% - 120px) / 7);
            border-radius: 10px 10px 0 0;
            img {
                width: 100%;
            }
            .third-item-text {
                width: 100%;
                text-align: center;
                padding: 10px 0;
                color: #FFFFFF;
                background-color: #4D6FFF;
            }
        }
    }
}
.fourth-list {
    row-gap: 30px;
    padding: 30px 0;
    background-color: #F8F8FA;
    .list-title {
        padding: 0 15px;
        text-align: center;
    }
    .fourth-list-box {
        justify-content: space-around;
        width: 100%;
        .fourth-list-item {
            width: 24%;
            padding: 30px 0;
            border: 1px solid #E8E8E8;
            img {
                width: 30%;
            }
        }
    }
}
.fifth-list {
    row-gap: 30px;
    padding: 30px 0;
    background-color: #E4EBF8;
    .fifth-list-box {
        justify-content: space-around;
        width: 100%;
        .fifth-list-item {
            align-items: flex-start;
            .fitth-img-box {
                row-gap: 15px;
                .fifth-list-icon {
                    width: 45%;
                }
            }
            .fifth-list-next {
                width: 20%;
                margin-top: 10%;
            }
        }
        .fifth-list-item:last-child .fifth-list-next{
            display: none;
        }
    }
}
.sixth-list {
    row-gap: 30px;
    padding: 30px 0;
    background-color: #F8F8FA;
    .sixth-list-box {
        width: calc((88vw - 30px) * 0.8);
        min-width: 990px;
        padding: 0 20px;
        .sixth-list-item {
            position: relative;
            width: calc(((88vw - 30px) * 0.8 - 40px) / 6);
            min-width: 160px;
            height: calc(((88vw - 30px) * 0.8 - 40px) / 6);
            min-height: 160px;
            .sixth-item-border {
                box-sizing: content-box;
                position: absolute;
                width: calc(100% - 8px);
                min-width: 152px;
                height: calc(50% - 8px);
                min-height: 72px;
                border: 8px solid #4D6FFF;
            }
        }
        .sixth-list-item:nth-child(2n - 1) .sixth-item-border{
            top: 0;
            border-bottom: none;
            border-radius: 50% 50% 0 0/100% 100% 0 0;
            border-color: #4D6FFF50;
        }
        .sixth-list-item:nth-child(2n) .sixth-item-border {
            bottom: 0;
            border-top: none;
            border-radius: 0 0 50% 50%/ 0 0 100% 100%;
        }
    }
}
.seventh-list {
    row-gap: 30px;
    padding: 30px 0;
    background-color: #E4EBF8;
    .seventh-list-box {
        column-gap: 30px;
        width: 100%;
        .seventh-list-item {
            row-gap: 15px;
            width: calc((100% - 90px) / 2);
            img {
                width: 100%;
            }
        }
        
    }
}
</style>