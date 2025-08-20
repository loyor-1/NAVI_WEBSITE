<script setup>
import { ref } from 'vue'
import { useGetCarouselList, useGetHotList } from '@/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const carousel_list = ref([])//轮播图列表
const carousel = ref()//轮播图实例
const hot_list = ref([])//热门设备列表

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
            <el-carousel ref="carousel" height="auto" :interval="2000" autoplay :pause-on-hover="false">
                <el-carousel-item class="carousel-pic" v-if="!carousel_list.length">
                    <div class="carousel-pic-default"></div>
                </el-carousel-item>
                <el-carousel-item class="carousel-pic" v-else v-for="item in carousel_list" :key="item.carouselId" @click="toPage(item)">
                    <div class="carousel-pic" :style="{'backgroundImage': `url(${item.picUrl})`}" v-if="item.picUrl"></div>
                    <div class="carousel-pic-default" v-else></div>
                </el-carousel-item>
            </el-carousel>
        </div>
    </div>

    <div class="hot-box">
        <div class="box-head">
            <div class="head-item-left">热门设备</div>
            <div class="head-item-right font-5D5D5D">自营设备品类丰富，高效快捷</div>
        </div>
        <div class="box-main" v-if="!hot_list.length">
            <div class="card" v-for="item in 10" :key="item" v-loading="true">
                <div class="img-box flex-center">
                    <div class="card-img"></div>
                </div>
            </div>
            <div class="card-info"></div>
        </div>
        <div class="box-main" v-else>
            <div class="card" v-for="item in hot_list" :key="item.equipmentUnitId">
                <div class="img-box flex-center">
                    <el-image class="card-img" :src="item.equipment_pic">
                        <template #error>
                            <img class="card-img" src="@/assets/img/default_equipment.png" />
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
                <div class="custom-button">立即预约</div>
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
            font-size: clamp(24px, 1.5vw, 100px);
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
</style>