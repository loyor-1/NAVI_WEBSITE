<script setup>
// import Player from "xgplayer"
import "xgplayer/dist/index.min.css"
// import video from "@/assets/video/xuanchuan.mp4"
import { onMounted } from "vue"
import { useRouter } from "vue-router"
import { useTabStore } from "@/stores/tab"

const router = useRouter()
const tab_store = useTabStore()

onMounted(() => {
    // let player = new Player({
    //     id: "mse",
    //     url: video,
    //     width: "100%",
    //     height: "100%",
    //     autoplay: true,
    //     autoplayMuted: true,
    //     loop: true,
    //     miniprogress: false,
    //     controls: false,
    // })
})

const list_1 = ['国企控股', '设备丰富', '技术精湛', '快捷服务']
</script>

<template>
    <div class="page-main">
        <div class="box-1">
            <img src="@/assets/img/banner_about.jpg" alt="">
            <div class="font-FFFFFF text-1-1">一站式科研服务平台</div>
            <div class="flex-center tag-box">
                <div class="font-FFFFFF font-middle tag" v-for="item in list_1" :key="item">{{ item }}</div>
            </div>
        </div>
        <div class="flex-center box-2">
            <div class="box-2-left">
                <div>
                    <span class="font-large font-94C9FF font-600" style="margin: 15px;">走进纳微</span>
                    <span class="font-large font-E8E8E8 font-600">ABOUT US</span>
                </div>
                <div class="flex-center border-box">
                    <div class="border-blue"></div>
                    <div class="border-gray"></div>
                </div>
                <div class="font-5D5D5D text-1-2">
                    湖南纳微新材料科技有限公司成立于2018年6月，注册资本750万元，是一家专注于科研服务及材料检测的高新技术企业。于2021年底被湘江集团大科城公司注资控股，旗下品牌纳微创新是湖南大型的一站式科研服务平台，提供材料检测、生物检测、高分子检测、金属检测、模拟计算、科研绘图等全方位的科研服务。
                </div>
                <div class="flex-center text-box">
                    <div class="flex-center-col text-box-item">
                        <div>
                            <span class="font-94C9FF font-middle">7500</span>
                            <span class="font-94C9FF">万+</span>
                        </div>
                        <div class="font-5D5D5D">自营设备</div>
                    </div>
                    <div class="flex-center-col text-box-item">
                        <div>
                            <span class="font-94C9FF font-middle">7500</span>
                            <span class="font-94C9FF">万+</span>
                        </div>
                        <div class="font-5D5D5D">自营设备</div>
                    </div>
                    <div class="flex-center-col text-box-item">
                        <div>
                            <span class="font-94C9FF font-middle">7500</span>
                            <span class="font-94C9FF">万+</span>
                        </div>
                        <div class="font-5D5D5D">自营设备</div>
                    </div>
                </div>
            </div>
            <div class="box-2-right">
                <div id="mse"></div>
            </div>
        </div>
        <div class="box-3">
            <img src="@/assets/img/hexinyewu.jpg" alt="">
            <div class="text-3-1">
                <span class="font-large font-94C9FF font-600" style="margin: 15px;">核心业务</span>
                <span class="font-large font-E8E8E8 font-600">SERVICE</span>
            </div>
            <div class="flex-center border-box">
                <div class="border-blue"></div>
                <div class="border-gray"></div>
            </div>
            <div class="flex-center pic-box">
                <div class="pic-item" @click="tab_store.toTabbar(2)">
                    <img src="@/assets/img/cljcab.jpg" alt="">
                    <div class="font-FFFFFF font-large pic-text">材料检测</div>
                </div>
                <div class="pic-item" @click="tab_store.toTabbar(7)">
                    <img src="@/assets/img/sjhcab.jpg" alt="">
                    <div class="font-FFFFFF font-large pic-text">试剂耗材</div>
                </div>
                <div class="pic-item" @click="tab_store.toTabbar(10)">
                    <img src="@/assets/img/kyfwab.jpg" alt="">
                    <div class="font-FFFFFF font-large pic-text">科研服务</div>
                </div>
            </div>
        </div>
        <div class="box-4">
            <div>
                <span class="font-large font-94C9FF font-600" style="margin: 15px;">荣誉证书</span>
                <span class="font-large font-E8E8E8 font-600">HONOR</span>
            </div>
            <div class="flex-center border-box">
                <div class="border-blue"></div>
                <div class="border-gray"></div>
            </div>
            <div class="flex-center pic-box">
                <img class="pic-item" src="@/assets/img/ryzs1ab.png" alt="">
                <img class="pic-item" src="@/assets/img/ryzs2ab.png" alt="">
                <img class="pic-item" src="@/assets/img/ryzs3ab.png" alt="">
            </div>
        </div>
        <div class="box-5">
            <div>
                <span class="font-large font-94C9FF font-600" style="margin: 15px;">经典案例</span>
                <span class="font-large font-E8E8E8 font-600">CASE</span>
            </div>
            <div class="flex-center border-box">
                <div class="border-blue"></div>
                <div class="border-gray"></div>
            </div>
            <div class="pic-box">
                <img src="@/assets/img/caseab.png" alt="">
            </div>
        </div>
        <div class="box-6">
            <img src="@/assets/img/hezuoab.jpg" alt="">
            <div class="title-box">
                <div>
                    <span class="font-large font-94C9FF font-600" style="margin: 15px;">合作客户</span>
                    <span class="font-large font-E8E8E8 font-600">PARTNER</span>
                </div>
                <div class="flex-center border-box">
                    <div class="border-blue"></div>
                    <div class="border-gray"></div>
                </div>
            </div>
            <img class="box-6-img" src="@/assets/img/oneab.png" alt="">
            <img class="box-6-img" src="@/assets/img/twoab.png" alt="">
            <img class="box-6-img" src="@/assets/img/threeab.png" alt="">
            <img class="box-6-img" src="@/assets/img/fourab.png" alt="">
            <img class="box-6-img" src="@/assets/img/fiveab.png" alt="">
            <img class="box-6-img" src="@/assets/img/sixab.png" alt="">
            <img class="box-6-img" src="@/assets/img/sevenab.png" alt="">
            <img class="box-6-img" src="@/assets/img/eightab.png" alt="">
            <img class="box-6-img" src="@/assets/img/nineab.png" alt="">
            <div class="font-FFFFFF tips">*排名不分先后</div>
        </div>
        <div class="box-7">
            <div>
                <span class="font-large font-94C9FF font-600" style="margin: 15px;">社会责任</span>
                <span class="font-large font-E8E8E8 font-600">RESPONSIBILITY</span>
            </div>
            <div class="flex-center border-box">
                <div class="border-blue"></div>
                <div class="border-gray"></div>
            </div>
            <div class="flex-center pic-box">
                <div class="pic-item">
                    <img src="@/assets/img/news1ab.jpg" alt="">
                    <div class="flex-center pic-text">
                        <div class="flex-center-col date-box">
                            <div class="font-large">08</div>
                            <div class="font-5D5D5D">2023-04</div>
                        </div>
                        <div class="slider"></div>
                        <div class="news">《人民日报》刊发的《湖南加力推进科技创新（新时代新征程新伟业•坚定不移推动高质量发展）》中，湖南纳微新材料科技有限公司被点名。</div>
                    </div>
                </div>
                <div class="pic-item">
                    <img src="@/assets/img/news2ab.jpg" alt="">
                    <div class="flex-center pic-text">
                        <div class="flex-center-col date-box">
                            <div class="font-large">17</div>
                            <div class="font-5D5D5D">2023-04</div>
                        </div>
                        <div class="slider"></div>
                        <div class="news">《湖南卫视》报道《稳增长 促发展 强信心 湖南：加力推进科技创新构建战略科技力量》中，湖南纳微新材料科技有限公司被点赞。</div>
                    </div>
                </div>
                <div class="pic-item">
                    <img src="@/assets/img/news3ab.jpg" alt="">
                    <div class="flex-center pic-text">
                        <div class="flex-center-col date-box">
                            <div class="font-large">04</div>
                            <div class="font-5D5D5D">2023-12</div>
                        </div>
                        <div class="slider"></div>
                        <div class="news">《人民日报》刊发的《湖南加力推进科技创新（新时代新征程新伟业•坚定不移推动高质量发展）》中，湖南纳微新材料科技有限公司被点名。</div>
                    </div>
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
img {
    width: 100%;
    vertical-align: middle;
}

.box-1 {
    position: relative;
    width: 100%;
    
    .text-1-1 {
        position: absolute;
        top: 18%;
        left: 5%;
        font-size: clamp(50px, 4vw, 100px);
    }
    .tag-box {
        position: absolute;
        top: 50%;
        left: 5%;
        column-gap: 30px;
        .tag {
            padding: 5px 15px;
            border: 1px solid #FFFFFF;
            border-radius: 5px;
        }
    }
}
.box-2 {
    justify-content: space-between;
    padding: 15px;
    background-color: #FFFFFF;
    .box-2-left {
        width: 40%;
        .border-box {
            width: 100%;
            .border-blue {
                width: 33%;
                height: 1px;
                border: 1px solid #94C9FF;
            }
            .border-gray {
                width: 85%;
                height: 1px;
                border: 1px solid #E8E8E8;
            }
        }
        .text-1-2 {
            text-indent: 2em;
            padding: 15px;
        }
        .text-box {
            width: 100%;
            .text-box-item {
                flex: 1;
                border-right: 1px dashed #cccccc;
            }
            .text-box-item:last-child {
                border: none;
            }
        }
    }
    .box-2-right {
        width: 40vw;
        min-width: 720px;
        height: 22.5vw;
        min-height: 405px;
    }
}
.box-3 {
    position: relative;
    width: 100%;
    .text-3-1 {
        position: absolute;
        top: 8%;
        left: 5%;
    }
    .border-box {
        position: absolute;
        top: 15%;
        left: 5%;
        width: 90%;
        .border-blue {
            width: 12%;
            height: 1px;
            border: 1px solid #94C9FF;
        }
        .border-gray {
            width: 88%;
            height: 1px;
            border: 1px solid #E8E8E8;
        }
    }
    .pic-box {
        position: absolute;
        top: 25%;
        left: 5%;
        column-gap: 30px;
        width: 90%;
        .pic-item {
            position: relative;
            flex: 1;
            .pic-text {
                position: absolute;
                top: 45%;
                left: 50%;
                transform: translateX(-50%);
            }
        }
    }
}
.box-4 {
    padding: 30px 5%;
    background-color: #FFFFFF;
    .border-box {
        width: 100%;
        .border-blue {
            width: 12%;
            height: 1px;
            border: 1px solid #94C9FF;
        }
        .border-gray {
            width: 88%;
            height: 1px;
            border: 1px solid #E8E8E8;
        }
    }
    .pic-box {
        column-gap: 30px;
        margin-top: 30px;
        .pic-item {
            width: calc((100% - 60px) / 3);
        }
    }
}
.box-5 {
    padding: 30px 5%;
    background-color: #F8F8FA;
    .border-box {
        width: 100%;
        .border-blue {
            width: 12%;
            height: 1px;
            border: 1px solid #94C9FF;
        }
        .border-gray {
            width: 88%;
            height: 1px;
            border: 1px solid #E8E8E8;
        }
    }
    .pic-box {
        margin-top: 30px;
    }
}
.box-6 {
    position: relative;
    width: 100%;
    background-color: #F8F8FA;
    .title-box {
        position: absolute;
        top: 5%;
        left: 5%;
        width: 90%;
        .border-box {
            width: 100%;
            .border-blue {
                width: 33%;
                height: 1px;
                border: 1px solid #94C9FF;
            }
            .border-gray {
                width: 85%;
                height: 1px;
                border: 1px solid #E8E8E8;
            }
        }
    }
    .tips {
        position: absolute;
        bottom: 16%;
        right: 3%;
    }
    .box-6-img {
        position: absolute;
    }
    .box-6-img:nth-child(3) {
        width: 15%;
        top: 50%;
        right: 4%;
    }
    .box-6-img:nth-child(4) {
        width: 15%;
        top: 70%;
        right: 2%;
    }
    .box-6-img:nth-child(5) {
        width: 15%;
        top: 32%;
        right: 19%;
    }
    .box-6-img:nth-child(6) {
        width: 15%;
        top: 50%;
        right: 22%;
    }
    .box-6-img:nth-child(7) {
        width: 15%;
        top: 50%;
        right: 40%;
    }
    .box-6-img:nth-child(8) {
        width: 15%;
        top: 66%;
        right: 19%;
    }
    .box-6-img:nth-child(9) {
        width: 15%;
        top: 32%;
        right: 37%;
    }
    .box-6-img:nth-child(10) {
        width: 15%;
        top: 64%;
        right: 36%;
    }
    .box-6-img:nth-child(11) {
        width: 15%;
        top: 29%;
        right: 2%;
    }
}
.box-7 {
    width: 100%;
    padding: 30px 5%;
    background-color: #FFFFFF;
    .border-box {
        width: 100%;
        .border-blue {
            width: 12%;
            height: 1px;
            border: 1px solid #94C9FF;
        }
        .border-gray {
            width: 88%;
            height: 1px;
            border: 1px solid #E8E8E8;
        }
    }
    .pic-box {
        column-gap: 30px;
        align-items: stretch;
        width: 100%;
        margin-top: 30px;
        .pic-item {
            width: calc((100% - 60px) / 3);
            border: 1px solid #E8E8E8;
            .pic-text {
                justify-content: space-between;
                align-items: stretch;
                padding: 15px;
                .date-box {
                    width: 25%;
                }
                .slider {
                    border-left: 1px dashed #cccccc;                    
                }
                .news {
                    width: 65%;
                }
            }
        }
    }
}
</style>