<script setup>
import { useGetInviteFriendsInfo } from '@/api'
import withdraw_1 from '../static/invite_friend/withdraw_1.png'
import withdraw_2 from '../static/invite_friend/withdraw_2.png'
import withdraw_3 from '../static/invite_friend/withdraw_3.png'
import withdraw_4 from '../static/invite_friend/withdraw_4.png'
import withdraw_arr from '../static/invite_friend/withdraw_arr.png'
import { ref } from 'vue'

const emits = defineEmits(['clickItem'])

const list = ref([
    {
        title: '可提现',
        money: 0,
        icon: withdraw_1,
        prefix: '￥',
        arrowSlot: true,
        color:'#FF4A2B'
    },
    {
        title: '邀请人数',
        money: 0,
        icon: withdraw_2,
        prefix: ''
    },
    {
        title: '预估收益',
        money: 0,
        icon: withdraw_3,
        prefix: '￥'
    },
    {
        title: '已结算',
        money: 0,
        icon: withdraw_4,
        prefix: '￥'
    }
])

async function getInviteFriendsInfo() {
    const res = await useGetInviteFriendsInfo()
    const {
        acquiredNumber = 0, // 已得收益
        estimateNumber = 0, // 预估收益
        inviteeNumber = 0, // 邀请人数
        withDrawnAbleNumber = 0, // 可提现金额
    } = res.data
    list.value[0].money = withDrawnAbleNumber ? Number(withDrawnAbleNumber).toFixed(2) : 0
    list.value[1].money = inviteeNumber || 0
    list.value[2].money = estimateNumber ? Number(estimateNumber).toFixed(2) : 0
    list.value[3].money = acquiredNumber ? Number(acquiredNumber).toFixed(2) : 0
}
getInviteFriendsInfo()

function handleClick(item) {
    emits('clickItem', item)
}
</script>

<template>
    <div class="invite-friends-grid">
        <div class="invite-friends-grid-item" v-for="(item, index) in list" :key="index" @click="handleClick(item)">
            <div class="img-container">
                <img :src="item.icon" alt="" />
            </div>
            <div class="right">
                <div class="title">
                    {{ item.title }}
                    <span v-if="item.arrowSlot" class="arrow-slot">提现</span>
                    <img v-else :src="withdraw_arr" alt="" style="width: 15px; height: 15px;margin-left: 5px;" />
                </div>
                <div class="money" :style="{ color: item.color }">
                    {{ item.prefix }}{{ item.money }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.invite-friends-grid {
    display: flex;
    align-items: center;
    width: 100%;
    cursor: pointer;
    .invite-friends-grid-item {
        display: flex;
        flex: 1;
        .img-container {
            width: 32px;
            height: 32px;
            margin-left: 20px;
            margin-right: 8px;
            img {
                width: 100%;
                height: 100%;
            }
        }
        .right {
            .title {
                color: #5d5d5d;
                font-size: 14px;
                font-weight: 400;
                line-height: 1;
                display: flex;
                align-items: center;
                .arrow-slot{
                    text-decoration: underline;
                    color: #FA6B04;
                    margin-left: 5px;
                }
            }
            .money {
                color: #111;
                font-size: 24px;
                font-weight: 600;
                margin-top: 10px;
            }
        }
    }
}
</style>
