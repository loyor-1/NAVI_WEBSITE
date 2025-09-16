<script setup>
import * as echarts from 'echarts';
import { onMounted, ref } from 'vue'
import { useGetCarouselList, useGetHotList } from '@/api'
import { useRouter } from 'vue-router'
import { left, right } from '@/utils/scroll_list.js'
import chinaMap from '@/utils/china_map.json';
import { useTabStore } from '@/stores/tab';

const router = useRouter()
const tab_store = useTabStore()

const carousel_list = ref([])//轮播图列表
const carousel = ref()//轮播图实例
const hot_list = ref([])//热门设备列表
const service_timer = ref(null)//服务流程卡片计时器
const service_list_index = ref(0)//服务流程卡片索引
const project_timer = ref(null)//服务项目卡片计时器
const project_list_index = ref(0)//服务项目卡片索引
const chart = ref(null);
//服务流程图
const service_list = ref([
    {
        name: "客户注册",
        src: "/src/assets/img/khzc.png",
        desc: "进行网站注册提升测试效率",
    },
    {
        name: "加入会员",
        src: "/src/assets/img/jrhy.png",
        desc: "加入纳微会员享受千元优惠",
    },
    {
        name: "填写需求",
        src: "/src/assets/img/txxq.png",
        desc: "测试确定项目填写测试需求",
    },
    {
        name: "完成支付",
        src: "/src/assets/img/wczf.png",
        desc: "核对测试费用完成订单支付",
    },
    {
        name: "打印详情",
        src: "/src/assets/img/dyxq.png",
        desc: "打印详情",
    },
    {
        name: "结果评价",
        src: "/src/assets/img/jgpj.png",
        desc: "下载测试结果进行结果评估",
    },
])
//服务流程dom配置
const service_card_options = {
    options: {
        threshold: 0
    },
    callback: showServiceCard,
}
//项目列表
const project_list = ref([
    {
        name: "材料测试",
        src: "/src/assets/img/clcs.png",
        desc_1: "扫描电子显微镜(SEM)",
        desc_2: "电子显微镜(TEM)",
        desc_3: "射线光电子能谱(XPS)",
        desc_4: "比表面及分析(BET)",
    },
    {
        name: "生物电路",
        src: "/src/assets/img/swdl.png",
        desc_1: "生物扫描电镜(SEM)",
        desc_2: "生物电镜(TEM)",
        desc_3: "八飞",
        desc_4: "活体影像",
    },
    {
        name: "环境检测",
        src: "/src/assets/img/hjjc.png",
        desc_1: "扫常规水质分析",
        desc_2: "土壤肥力测试",
        desc_3: "固体废物检测",
        desc_4: "大气样品检测",
    },
    {
        name: "模拟计算",
        src: "/src/assets/img/mnjs.png",
        desc_1: "第—性原理",
        desc_2: "分子动力学",
        desc_3: "有限元模拟",
        desc_4: "量子化学",
    },
    {
        name: "科研绘图",
        src: "/src/assets/img/kyht.png",
        desc_1: "封面图",
        desc_2: "摘要图",
        desc_3: "插图",
        desc_4: "动画",
    },
    {
        name: "数据分析",
        src: "/src/assets/img/sjfx.png",
        desc_1: "XPS数据分析",
        desc_2: "XRD数据分析",
        desc_3: "金属失效分析",
        desc_4: "单晶数据解析",
    },
    {
        name: "论文润色",
        src: "/src/assets/img/lwrs.png",
        desc_1: "中文论文润色",
        desc_2: "中文学术翻译",
        desc_3: "SCl论文投稿",
        desc_4: "SCI论文查重",
    },
    {
        name: "试剂耗材",
        src: "/src/assets/img/sjhc.png",
        desc_1: "石墨烯",
        desc_2: "碳纳米管",
        desc_3: "金属有机框架材米料MOF",
        desc_4: "氧钛金属碳",
    },
    {
        name: "纳微学院",
        src: "/src/assets/img/nwxy.png",
        desc_1: "模拟计算·直播课",
        desc_2: "科研绘图·直播课",
        desc_3: "金属有机框架材米料MOF",
        desc_4: "氧钛金属碳",
    },
])
//服务项目dom配置
const project_card_options = {
    options: {
        threshold: 0
    },
    callback: showProjectCard,
}
const cities = ref([
    { name: "太原", value: [112.53, 37.87] },
    { name: "西安", value: [108.95, 34.27] },
    { name: "合肥", value: [117.27, 31.86] },
    { name: "武汉", value: [114.31, 30.52] },
    { name: "杭州", value: [120.19, 30.26] },
    { name: "重庆", value: [106.54, 29.59] },
    { name: "南昌", value: [115.89, 28.68] },
    { name: "长沙", value: [113, 28.21] },
    { name: "贵阳", value: [106.71, 26.57] },
    { name: "昆明", value: [102.73, 25.04] },
    { name: "南宁", value: [108.37, 22.82] },
    { name: "广州", value: [113.23, 23.16] },
    { name: "福州", value: [119.3, 26.08] },
    { name: "南海群岛", value: [114.17, 15.77] }
]);
const other_options = {
    options: {
        threshold: 0
    },
    callback: (isVisible, entry) => {
        if(isVisible) {
            entry.target.classList.add('service-show')
            
        } else {
            entry.target.classList.remove('service-show')
        }
    },
}


//获取轮播图
async function getCarouselList() {
    const params = {
        type: 1, 
        ifShow: 1,
        categoryType: 1
    }
    const res = await useGetCarouselList(params)
    carousel_list.value = res.rows
}
getCarouselList()

//更改轮播图显示状态
function changeActive(index) {
    carousel.value.setActiveItem(index)
}

//跳转页面
function toPage(data) {
    if(data.skipStatus == 0) {
        if(data.skipType == 1) {
            router.push(data.skipPage)
        } else if(data.skipType == 2) {
            router.push('/carouselDetail')
        } else if(data.skipType == 3) {
            router.push('/carouselDetail')
        }
    }
}

// 获取热门设备列表
async function getHotList() {
    try {
        const res = await useGetHotList()
        res.rows.forEach(item => {
            item.equipment_pic = import.meta.env.VITE_FILE_API + item.fileList[0].url
        })
        hot_list.value = res.rows
    }
    catch(err) {
        console.log(err)
    }
}
getHotList()

//显示服务流程
function showServiceCard(isVisible, entry) {
    if(isVisible) {
        entry.target.classList.add('service-show')
        if(service_timer.value) return
        service_timer.value = setInterval(() => {
            if(service_list_index.value < service_list.value.length) {
                service_list.value[service_list_index.value].show = true
                service_list_index.value += 1
            } else {
                clearServiceCardTimer()
            }
        }, 100)
    } else {
        clearServiceCardTimer()
        service_list.value.forEach(item => item.show = false)
        entry.target.classList.remove('service-show')
    }
}

//删除服务流程卡片定时器
function clearServiceCardTimer() {
    clearInterval(service_timer.value)
    service_timer.value = null
    service_list_index.value = 0
}

//显示服务项目
function showProjectCard(isVisible, entry) {
    if(isVisible) {
        entry.target.classList.add('service-show')
        if(project_timer.value) return
        project_timer.value = setInterval(() => {
            if(project_list_index.value < project_list.value.length) {
                project_list.value[project_list_index.value].show = true
                project_list_index.value += 1
            } else {
                clearProjectCardTimer()
            }
        }, 100)
    } else {
        clearProjectCardTimer()
        project_list.value.forEach(item => item.show = false)
        entry.target.classList.remove('service-show')
    }
}

//删除服务项目卡片定时器
function clearProjectCardTimer() {
    clearInterval(project_timer.value)
    project_timer.value = null
    project_list_index.value = 0
}

// 初始化地图
function initChart() {
    const chartDom = document.getElementById('china-map');
    chart.value = echarts.init(chartDom);
    echarts.registerMap('china', chinaMap);
    // 配置ECharts选项
    const option = {
        title: {
            text: '平台优势',
            subtext: '价值超亿元大型共享设备，10大科研板块，500余种检测项目，自营实验室布局全国',
            left: 'center',
            textStyle: {
                color: '#5CC300',
                fontSize: 36,
            },
        },
        tooltip: {
            trigger: 'item',
            formatter: function(params) {
                if (params.componentType === 'series' && params.value) {
                    return params.name + '<br/>坐标: ' + params.value[0].toFixed(2) + ', ' + params.value[1].toFixed(2);
                }
                return params.name;
            }
        },
        geo: {
            map: 'china',
            label: {
                emphasis: {
                    show: false
                }
            },
            itemStyle: {
                normal: {
                    areaColor: '#e6f3ec',
                    borderColor: '#1a5632',
                    borderWidth: 1,
                },
                emphasis: {
                    areaColor: '#cce8d7'
                }
            },
            zoom: 1.2
        },
        series: [
            {
                name: '城市',
                type: 'scatter',
                coordinateSystem: 'geo',
                data: cities.value,
                symbolSize: 12,
                label: {
                    show: true,
                    formatter: '{b}',
                    position: 'right',
                    color: '#1a5632',
                    fontSize: 12
                },
                itemStyle: {
                    color: '#d64e3f'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 14,
                        fontWeight: 'bold'
                    },
                    itemStyle: {
                        color: '#ff0000'
                    }
                }
            },
            {
                name: '南海诸岛',
                type: 'map',
                map: 'china',
                geoIndex: 0,
                data: [],
                itemStyle: {
                    normal: {
                        opacity: 0.7,
                        areaColor: '#e6f3ec'
                    }
                }
            }
        ]
    };
    
    chart.value.setOption(option);
    
    // 添加窗口调整大小事件监听
    window.addEventListener('resize', function() {
        if (chart.value) {
            chart.value.resize();
        }
    });
};
onMounted(() => {
    const timer = setTimeout(() => {
        initChart()
        clearTimeout(timer)
    }, 0);
})

// 前往设备详情
function toEquipmentDetail(equipment_id) {
    router.push(`/equipment_detail?equipment_id=${equipment_id}`)
}

</script>

<template>
    <div class="carousel-box">
        <div class="carousel-list">
            <div class="list-item" :class="{'list-item-active': item.active, 'list-item-1': carousel_list.length <= 5, 'list-item-2': carousel_list.length > 5}" v-for="(item, index) in carousel_list" :key="item.carouselId" @mouseenter="changeActive(index)" @mouseleave="changeActive(item ,false)">
                <span class="multi-line-ellipsis-1">{{ item.realteTitle }}</span>
                <span class="multi-line-ellipsis-1 font-5D5D5D">{{ item.realteDesc }}</span>
            </div>
        </div>
        <div class="carousel-pic">
            <el-carousel v-if="carousel_list.length" ref="carousel" height="auto" :interval="2000">
                <el-carousel-item class="carousel-pic" v-for="item in carousel_list" :key="item.carouselId" @click="toPage(item)">
                    <div class="carousel-pic" :style="{'backgroundImage': `url(${item.picUrl})`}" v-if="item.picUrl"></div>
                    <div class="carousel-pic-default" v-else></div>
                </el-carousel-item>
            </el-carousel>
            <div class="carousel-pic" v-else>
                <div class="carousel-pic-default"></div>
            </div>
        </div>
    </div>

    <div class="hot-box">
        <div class="box-head">
            <div class="head-item-left font-large">热门设备</div>
            <div class="head-item-right font-5D5D5D">自营设备品类丰富，高效快捷</div>
        </div>
        <div class="box-main" v-if="!hot_list.length">
            <div class="card-default" v-for="item in 10" :key="item" v-loading="true">
                <div class="img-box flex-center">
                    <div class="card-img"></div>
                </div>
            </div>
            <div class="card-info"></div>
        </div>
        <div class="box-main" v-else>
            <div class="card" v-for="item in hot_list" :key="item.id" @click="toEquipmentDetail(item.id)">
                <div class="img-box flex-center">
                    <el-image class="card-img" :src="item.equipment_pic">
                        <template #error>
                            <img class="card-img" src="@/assets/img/fail_pic.png" />
                        </template>
                    </el-image>
                </div>
                <div class="card-info">
                    <div class="font-middle multi-line-ellipsis-1">{{ item.equipmentName }}</div>
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
    </div>

    <div class="service flex-center" v-intersection="service_card_options">
        <div class="font-large">服务流程</div>
        <div class="font-middle font-5D5D5D">一对一定制，专业化检测，可视化报告</div>
        <div class="setup-box">
            <div class="setup flex-center" v-for="item in service_list.length" :key="item">
                <div class="left-dash" :class="{'hide-dash': item == 1}"></div>
                <img class="setup-icon" src="@/assets/img/service_icon.png" />
                <div class="right-dash" :class="{'hide-dash': item == service_list.length}"></div>
            </div>
        </div>
        <div class="service-box">
            <div class="service-card" :class="{'service-card-show': item.show}" v-for="item in service_list" :key="item.index">
                <div class="card-content">
                    <img class="card-img" :src="item.src" />
                    <div class="font-middle">{{ item.name }}</div>
                    <div class="font-mini">{{ item.desc }}</div>
                </div>
            </div>
        </div>
    </div>

    <div class="service flex-center" v-intersection="project_card_options">
        <div class="font-large">服务项目</div>
        <div class="font-middle font-5D5D5D">多维技术支持，一站式科研检测服务</div>
        <div class="project-box">
            <div class="project-card" v-for="(item, index) in project_list" :key="index">
                <img class="project-img" :class="{'project-img-active': item.show}" :src="item.src" alt="">
                <div class="font-middle">{{ item.name }}</div>
                <div>
                    <div class="flex-center">
                        <div class="font-mini font-5D5D5D">{{ item.desc_1 }}</div>
                        <div class="slider"></div>
                        <div class="font-mini font-5D5D5D">{{ item.desc_2 }}</div>
                    </div>
                    <div class="flex-center">
                        <div class="font-mini font-5D5D5D">{{ item.desc_3 }}</div>
                        <div class="slider"></div>
                        <div class="font-mini font-5D5D5D">{{ item.desc_4 }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="service flex-center" v-intersection="other_options">
        <div id="china-map"></div>
        <div class="bubble bubble-1 flex-center">
            <div class="font-large">10000000万</div>
            <div class="font-middle">科研设备</div>
        </div>
        <div class="bubble bubble-2 flex-center">
            <div class="font-large">100000位</div>
            <div class="font-middle">年服务人数</div>
        </div>
        <div class="bubble bubble-3 flex-center">
            <div class="font-large">50万份</div>
            <div class="font-middle">年样品检测数量</div>
        </div>
        <div class="bubble bubble-4 flex-center">
            <div class="font-large">800家</div>
            <div class="font-middle">合作伙伴</div>
        </div>
    </div>

    <div class="service flex-center" v-intersection="other_options">
        <div class="font-large">纳微会员</div>
        <div class="font-middle font-5D5D5D">实力国企，源于品质的信赖</div>
        <div class="scroll-box flex-center">
            <div class="box">
                <div class="box-title"></div>
                <div class="box-main">
                    <div class="box-content">
                        <div class="content-item font-5D5D5D" v-for="(item, index) in left" :key="index">
                            <div class="item-title font-mini">{{ item.title }}</div>
                            <div class="item-name font-mini">{{ item.name }}</div>
                            <div class="item-time font-mini">{{ item.time }}</div>
                            <div class="item-pay font-mini">{{ item.pay }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="box">
                <div class="box-title"></div>
                <div class="box-main">
                    <div class="box-content">
                        <div class="content-item font-5D5D5D" v-for="(item, index) in right" :key="index">
                            <div class="item-title font-mini">{{ item.title }}</div>
                            <div class="item-name font-mini">{{ item.name }}</div>
                            <div class="item-time font-mini">{{ item.time }}</div>
                            <div class="item-pay font-mini">{{ item.pay }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@keyframes showCarousel {
    0% {
        opacity: 0;
        transform: scale(0.8);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.carousel-box {
    animation: showCarousel 0.5s forwards;
    display: flex;
    width: 80vw;
    min-width: 1440px;
    margin: 10px auto 0;
    border: 1px solid #94C9FF;
    .carousel-list {
        display: flex;
        flex-direction: column;
        width: 15%;
        background-color: #FFFFFF50;
        .list-item {
            cursor: default;
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 100%;
            padding: 0 20px;
        }
        .list-item-1 {
            height: 20%;
        }
        .list-item-2 {
            flex: 1;
        }
        .list-item:hover {
            background-color: #94C9FF50;
        }
        .list-item-active {
            background-color: #94C9FF50;
        }
    }
    .carousel-pic {
        width: 68vw;
        min-width: 1224px;
        height: 18vw;
        min-height: 320px;
        background-position: center;
        background-size: cover;
    }
    .carousel-pic-default {
        width: 68vw;
        min-width: 1224px;
        height: 18vw;
        min-height: 320px;
        background: url('@/assets/img/default_carousel.jpeg');
        background-size: cover;
    }
}

@keyframes  head_item_left{
    0% {
        top: 15px;
        left: 0;
    }
    100% {
        top: 15px;
        left: 50%;
        transform: translateX(-50%);
    }
}
@keyframes  head_item_right{
    0% {
        bottom: 15px;
        right: 0;
    }
    100% {
        bottom: 15px;
        right: 50%;
        transform: translateX(50%);
    }
}
@keyframes card {
    0% {
        opacity: 0;
        transform: scale(0.7);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}
.hot-box {
    width: 80vw;
    min-width: 1440px;
    margin: 40px auto 0;
    .box-head {
        position: relative;
        height: 120px;
        background-image: linear-gradient(to right, #9FFFD7, #BAFF75);
        .head-item-left {
            animation: head_item_left 0.5s forwards;
            position: absolute;
        }
        .head-item-right {
            animation: head_item_right 0.5s forwards;
            position: absolute;
        }
    }
    .box-main {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        width: 80vw;
        min-width: 1440px;
        min-height: calc((80vw - 90px) / 5 * 1.3);
        padding: 15px;
        background-color: #FFFFFF;
        .card-default {
            width: calc((80vw - 90px) / 5);
            min-width: 270px;
            border-radius: 5%;
            background-color: #fff;
        }
        .card {
            animation: card 0.5s linear forwards;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: calc((80vw - 90px) / 5);
            min-width: 270px;
            border-radius: 5%;
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
                border: 1px solid #E8E8E8;
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
            box-shadow: 0 0 5px 5px #94C9FF30;
            .card-info .font-middle {
                color: #94C9FF;
            }
        }
    }
}

@keyframes showService {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
@keyframes showServiceCard {
    0% {
        opacity: 0;
        transform: scale(1.5);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}
@keyframes showProjectCard {
    0% {
    }
    100% {
        transform: rotateY(360deg);
    }
}
@keyframes scrollList {
    0% {
        top: 0;
    }
    100% {
        top: -100%;
    }
}
.service {
    position: relative;
    opacity: 0;
    flex-direction: column;
    row-gap: 25px;
    width: 80vw;
    min-width: 1440px;
    margin: 40px auto 0;
    padding: 25px 0;
    background-color: #FFFFFF90;
    .setup-box {
        display: flex;
        width: 80vw;
        min-width: 1440px;
        .setup {
            flex: 1;
            .setup-icon {
                width: 40px;
            }
            .left-dash {
                width: calc(50% - 22px);
                border: 2px dashed #94C9FF;
            }
            .right-dash {
                width: calc(50% - 22px);
                border: 2px dashed #94C9FF;
            }
            .hide-dash {
                border: 2px dashed transparent;
            }
        }
        
    }
    .service-box {
        overflow: hidden;
        display: flex;
        justify-content: space-between;
        width: 80vw;
        min-width: 1440px;
        .service-card {
            opacity: 0;
            flex: 1;
            .card-content {
                display: flex;
                flex-direction: column;
                row-gap: 25px;
                align-items: center;
                .card-img {
                    width: 10vw;
                    min-width: 220px;
                }
            }
        }
        .service-card-show {
            animation: showServiceCard 0.5s linear forwards;
        }
    }
    .project-box {
        display: flex;
        flex-wrap: wrap;
        row-gap: 80px;
        justify-content: space-around;
        .project-card {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            row-gap: 15px;
            width: calc((80vw - 60px) / 3);
            min-width: 460px;
            .project-img {
                width: calc((80vw - 60px) / 15);
                min-width: 92px;
                height: calc((80vw - 60px) / 15);
                min-height: 92px;
            }
            .project-img-active {
                animation: showProjectCard 0.5s linear forwards;
            }
            .slider {
                height: 1rem;
                margin: 0 10px;
                border-left: 1px solid #cccccc;
            }
        }
    }
    .bubble {
        flex-direction: column;
        width: 12vw;
        min-width: 230px;
        height: 12vw;
        min-height: 230px;
        color: #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 0 15px 5px #94C9FF90;
        background-color: #94C9FF90;
    }
    .bubble-1 {
        position: absolute;
        top: 5%;
        left: 5%;
    }
    .bubble-2 {
        position: absolute;
        top: 25%;
        right: 5%;
    }
    .bubble-3 {
        position: absolute;
        bottom: 10%;
        left: 20%;
    }
    .bubble-4 {
        position: absolute;
        bottom: 10%;
        right: 10%;
    }
    .scroll-box {
        column-gap: 150px;
        width: 80vw;
        min-width: 1440px;
        margin-top: 50px;
        .box {
            width: 20vw;
            min-width: 500px;
            background-color: #FFFFFF;
            .box-title {
                width: 100%;
                height: 100px;
                background: url('@/assets/img/left_scroll_title.png') no-repeat;
                background-size: 100% 100%;
                background-color: transparent;
            }
            .box-main {
                overflow: hidden;
                position: relative;
                width: 20vw;
                min-width: 500px;
                height: 600px;
                .box-content {
                    animation: scrollList 25s linear infinite;
                    position: absolute;
                    top: 0;
                    left: 0;
                    .content-item {
                        display: flex;
                        justify-content: space-between;
                        width: 20vw;
                        min-width: 500px;
                        height: 40px;
                        line-height: 40px;
                        padding: 0 15px;
                        border-bottom: 1px dashed #cccccc;
                        .item-title {
                            width: 50%;
                        }
                        .item-name {
                            width: 10%;
                        }
                        .item-time {
                            width: 10%;
                        }
                        .item-pay {
                            width: 20%;
                        }
                    }
                }
            }
        }
    }
}
.service-show {
    animation: showService 1.2s linear forwards;
}

#china-map {
    width: 80vw;
    min-width: 1440px;
    height: 1200px;
}
</style>