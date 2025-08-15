<script setup>
import { ref } from 'vue'
import { useGetCarouselList } from '@/api'

const carousel_list = ref([])

async function getCarouselList() {
    const params = {
        type: 1, 
        ifShow: 1,
        categoryType: 1
    }
    const res = await useGetCarouselList(params)
}
getCarouselList()

</script>

<template>
    <div class="carousel-box">
        <div class="carousel-list">
            <div class="list-item flex-center" :class="{'list-item-active': true}"><span class="multi-line-ellipsis-1">项目</span></div>
            <div class="list-item flex-center" :class="{'list-item-active': true}"><span class="multi-line-ellipsis-1">项目</span></div>
            <div class="list-item flex-center" :class="{'list-item-active': true}"><span class="multi-line-ellipsis-1">项目</span></div>
            <div class="list-item flex-center" :class="{'list-item-active': true}"><span class="multi-line-ellipsis-1">项目</span></div>
            <div class="list-item flex-center" :class="{'list-item-active': true}"><span class="multi-line-ellipsis-1">项目</span></div>
        </div>
        <img class="carousel-pic" src="@/assets/img/default_carousel.jpeg" alt="">
    </div>
</template>

<style lang="scss" scoped>
.carousel-box {
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
            flex: 1;
            width: 100%;
            padding: 0 20px;
        }
        .list-item-active {
            background-color: #94C9FF50;
        }
    }
    .carousel-pic {
        width: 85%;
        vertical-align: middle;
    }
}
</style>