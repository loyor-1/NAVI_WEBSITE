<script setup>
import { computed, nextTick, ref } from 'vue'
import { useGetEquipmentList } from '@/api'
import { useRouter } from 'vue-router'
import step1 from '@/assets/img/analog_computation_img/step1.jpg'
import step2 from '@/assets/img/analog_computation_img/step2.jpg'
import step3 from '@/assets/img/analog_computation_img/step3.jpg'
import step4 from '@/assets/img/analog_computation_img/step4.jpg'
import step5 from '@/assets/img/analog_computation_img/step5.jpg'
import step6 from '@/assets/img/analog_computation_img/step6.jpg'
import { getUserInfo } from '@/utils/auth'

const router = useRouter()
const user_info = getUserInfo()

const menu_index = ref(undefined)
const menu_child_title = ref('')
const pic_name = ref('')
const loading = ref(false)
const equipment_list = ref([])
const total = ref(0)

const params = ref({
    pageNum: 1,
    pageSize: 10,
    isCloudScene: 7,
    isGrounding: 1,
    status: 1,
})
const menu = [
    {
        title: '第一性原理',
        index: '1',
        html_text: '<div style="text-indent: 2em;">第一性原理是指不使用经验参数，只通过基本物理常量 （me、c、e、h、kB） 来计算微观体系基本性质的方法。它包括基于密度泛函的从头算和基于Hartree-Fock自洽计算的从头算，前者以电子密度作为基本变量（Hohenberg-Kohn定理），通过求解Kohn-Sham方程，进行迭代自洽得到体系的基态电子密度，进而求得体系的基态性质；后者则通过自洽求解Hartree-Fock方程，获得体系的波函数进而求得基态性质。</div><div style="text-indent: 2em;">计算内容包括：使用VASP/MS进行晶体结构优化，能带结构计算，态密度（dos）、分态密度（PDOS）计算，差分电荷密度、电荷局域密度（ELF）计算，表面吸附能、空位形成能计算，界面能计算，催化反应路径，弹性性能计算。</div>',
        child: [
            { title: '差分电荷密度', index: '1-1' },
            { title: '电子局域函数', index: '1-2' },
            { title: '分波态密度', index: '1-3' },
            { title: '吉布斯自由能', index: '1-4' },
            { title: '能带结构', index: '1-5' },
            { title: '迁移势垒', index: '1-6' },
            { title: '原子电荷', index: '1-7' },
            { title: '吸附模型', index: '1-8' },
        ],
    },
    {
        title: '分子动力学',
        index: '2',
        html_text: '<div style="text-indent: 2em;">分手的力学要阳理强美牛楼力事来想路分手近动的方生，超地在西力手准系的不同城添的限如系年中油政期本来我体系的份业贸分，并以构型积分为基础进一步计算体系的热力学量和其它宏观性质。</div><div style="text-indent: 2em;">计算内容包括：使用LAMMPS计算径向分布函数、MSD和扩散系数，拉伸模拟，应力应变模拟，比热容模拟计算，溶解度模拟。</div>',
        child: [
            { title: '蛋白研究', index: '2-1' },
            { title: '电池性能', index: '2-2' },
            { title: '反应化学分析', index: '2-3' },
            { title: '分子动力学', index: '2-4' },
            { title: '分子对接', index: '2-5' },
            { title: '分子自组装', index: '2-6' },
            { title: '碳纳米管研究', index: '2-7' },
            { title: '相转变', index: '2-8' },
        ],
    },
    {
        title: '相图计算',
        index: '3',
        html_text: '<div style="text-indent: 2em;">相图计算是指在一个多相体系中，随温度、压力和浓度的变化，相的种类、数量及含量都要相应地发生变化，对于变化情况可用几何图形来描绘，这个图形就可以反映出该系统在一定组成、温度和压力下，达到平衡时所处的状态，这个几何图形称为相图，也叫平衡图、状态图。相图是研究材料成分、工艺、结构与性能之间关系的重要基础。</div><div style="text-indent: 2em;">适合的研究方向包括但不限于：金属材料、非金属材料、纳米材料、半导体材料、电催化光催化、热催化、电池、固体、界面、吸附等。</div><div style="text-indent: 2em;">可以计算的体系包括但不限于：晶体、非晶、二维材料、表面、界面、固体等。</div>',
        child: [
            { title: '比热容计算', index: '3-1' },
            { title: '二元体系热力学数据库建设', index: '3-2' },
            { title: '混合焓计算', index: '3-3' },
            { title: '活度计算', index: '3-4' },
            { title: '热力学数据库建设', index: '3-5' },
            { title: '三元体系热力学数据库建设', index: '3-6' },
            { title: '相成分计算', index: '3-7' },
            { title: '形成焓计算', index: '3-8' },
        ],
    },
    {
        title: '有限元',
        index: '4',
        html_text: '<div style="text-indent: 2em;">有限元法是一种求解偏微分方程的数值计算方法。其本质是通过将结构离散化，产生有限个容易分析求解的单元，从而将连续体看作是仅在节点处连接的有限个单元的集合。通过有限元方程组求解各个节点值，代入到表示单元内场分布规律的插值函数中，就可以得到整个连续体的场函数。</div><div style="text-indent: 2em;">计算内容包括：利用Ansys、Comsol、Fluent等模拟塑性成型，热管理、多层复合结构热防护、多相流动与传热，结构力学，压电效应，电容，锂离子电池相关，锂金属沉积枝晶问题，固态电解质问题，扩散问题，盐差发电，光散射问题，光催化下等离子共振场增强效应，体积膨胀应力等。</div><div style="text-indent: 2em;">利用Aspen等流程模拟软件进行化工工艺流程的模拟计算，可进行含精馏、萃取、吸收、蒸发（含间歇操作）以及反应等整个工艺流程的物料和热量衡算，并进行各单体设备的尺寸计算（主要是换热器、HTR/和精馏塔、FRI）</div>',
        child: [
            { title: 'voronoi类型的晶粒生长', index: '4-1' },
            { title: '单颗粒的电磁场增强', index: '4-2' },
            { title: '电极微观结构中的静水压分布', index: '4-3' },
            { title: '力一化学耦合的内聚力单无', index: '4-4' },
            { title: '模拟电极材料晶界断', index: '4-5' },
            { title: '二维枝晶生长', index: '4-6' },
            { title: '两相流:油水界面', index: '4-7' },
            { title: '相场法模拟轴向拉伸断裂', index: '4-8' },
            { title: '形核生长', index: '4-9' },
            { title: '自发相分离', index: '4-10' },
        ],
    },
]
const list = [
    {
        name: "提交需求",
        content: "选择对应计算项目直接下单，或者通过在线客服沟通需求",
        src: step1,
    },
    {
        name: "免费评估",
        content: "工程师线上会议沟通需求，评估计算周期及费用",
        src: step2,
    },
    {
        name: "合同签定",
        content: "确认计算方案无误后，签定合同&支付定金",
        src: step3,
    },
    {
        name: "进度跟踪",
        content: "项目专人全程跟踪，定期反馈计算进度",
        src: step4,
    },
    {
        name: "审核报告",
        content: "质检团队联合评审，对计算结果负责到底",
        src: step5,
    },
    {
        name: "交付结果",
        content: "查阅报告及计算结果，售后答疑及保密管理",
        src: step6,
    },
]

const pic_url = computed(() => {
    return `/src/assets/img/analog_computation_img/${pic_name.value}.png`
})

function changeMenu(index, data) {
    menu_index.value = index
    menu_child_title.value = data.title
    pic_name.value = data.index
}
changeMenu('1', menu[0].child[0])

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
        <img class="head-pic" src="@/assets/img/analog_computation_img/monijisuan.jpg" alt="">
        <div class="flex-center page-head">
            <el-menu class="menu-box" default-active="1-1" :unique-opened="true">
                <el-sub-menu :index="item.index" v-for="item in menu" :key="item.index">
                    <template #title>{{ item.title }}</template>
                    <el-menu-item :index="i.index" v-for="i in item.child" :key="i.index" @click="changeMenu(item.index, i)">{{ i.title }}</el-menu-item>
                </el-sub-menu>
            </el-menu>
            <div class="page-content">
                <div class="box">
                    <div class="font-middle title">项目介绍</div>
                    <div class="flex-center-col text" v-html="menu[menu_index - 1].html_text"></div>
                </div>
                <div class="flex-center box">
                    <img class="box-pic" :src="pic_url" alt="">
                    <div class="flex-center-col box-content">
                        <div class="flex-center">
                            <span class="font-middle">{{ menu[menu_index - 1].title }}</span>
                            <span style="margin: 0 10px;">——</span>
                            <span class="font-middle">{{ menu_child_title }}</span>
                        </div>
                        <div class="flex-center">
                            <div class="custom-button button-style" @click="scrollToList">立即预约</div>
                            <el-popover placement="right" width="300" trigger="hover">
                                <el-image style="width: 100%" :src="user_info.user_kefu_QRCode">
                                    <template #error>
                                        <img style="width: 100%" src="@/assets/img/kefuCode.jpg" />
                                    </template>
                                </el-image>
                                <template #reference>
                                    <div class="default-button button-style">联系客服</div>
                                </template>
                            </el-popover>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex-center-col step-box">
            <div class="flex-center-col">
                <div class="font-middle">下单步骤</div>
                <div class="font-5D5D5D">ORDER PLACEMENT STEP</div>
            </div>
            <div class="flex-center box-content">
                <div class="flex-center list-box" v-for="item in list" :key="item.name">
                    <div class="flex-center-col list-card">
                        <img class="list-card-img" :src="item.src" alt="">
                        <div>{{ item.name }}</div>
                        <div class="font-mini font-5D5D5D card-content">{{ item.content }}</div>
                    </div>
                    <img class="next-icon" src="@/assets/img/analog_computation_img/next.jpg" alt="">
                </div>
            </div>
        </div>
        <div class="equipment-box" id="equipment-list">
            <div class="flex-center font-large box-head">模拟计算项目</div>
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
    align-items: flex-start;
    width: 80vw;
    min-width: 1440px;
    margin: 0 auto;
    .head-pic {
        width: 100%;
        vertical-align: middle;
    }
    .page-head {
        align-items: flex-start;
        background-color: #FFFFFF;
    }
}

.menu-box {
    width: 300px;
    border: none;
}
.page-content {
    width: calc(100% - 300px);
    border-left: 1px solid #E8E8E8;
    .box {
        justify-content: flex-start;
        column-gap: 15px;
        width: 100%;
        padding: 15px;
        .title {
            padding: 15px 0;
            border-bottom: 1px solid #111111;
        }
        .text {
            row-gap: 15px;
            align-items: flex-start;
            padding: 30px 15px;
        }
        .box-pic {
            width: 200px;
            height: 200px;
            padding: 10px;
            border: 1px solid #E8E8E8;
        }
        .box-content {
            justify-content: space-between;
            align-items: flex-start;
            height: 160px;
            .button-style {
                width: 120px;
                height: 40px;
                margin-right: 30px;
            }
        }
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
            width: calc((100% - 380px) / 6 + 55px);
            .list-card {
                width: calc(100% - 55px);
                padding-bottom: 15px;
                border-radius: 10px;
                background-color: #FFFFFF;
                .list-card-img {
                    width: 100%;
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
            width: calc((100% - 380px) / 6);
            .list-card {
                width: 100%;
            }
        } 
        .list-box:last-child .next-icon {
            display: none;
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