<script setup>
import dayjs from 'dayjs'
import { computed, nextTick, ref } from 'vue'
import { useGetActivityCouponList, useGetCoupon, useClaimCoupon } from '@/api'
import { getUserInfo } from '@/utils/auth'
import { useTabStore } from '@/stores/tab'
import { ElMessage } from 'element-plus'

const tab_store = useTabStore()

const user_info = getUserInfo()
const tab_dom = ref(null)

const loading = ref(false)
const show = ref(false)
const active_tab = ref(undefined)
const active_segmented = ref(undefined)
const page_num = ref(1)
const page_size = ref(12)
const coupon_list = ref([])
const total = ref(0)

const tabs = computed(() => {
    const arr = [
        { label: '活动领券', name: 'active' },
        { label: '个人优惠券', name: 'user' },
    ]
    if(user_info.teamId) arr.push({ label: '团队优惠券', name: 'team' })
    return arr
})
const options = [
    { label: '全部', value: 1 },
    { label: '可使用', value: 2 },
    { label: '已使用', value: 3 },
    { label: '已失效', value: 4 },
]

function open(type) {
    show.value = true
    nextTick(() => {
        if(type == 1) {
            active_tab.value = 'active'
            tab_dom.value.currentName = 'active'
            active_segmented.value = undefined
        } else {
            active_tab.value = 'user'
            tab_dom.value.currentName = 'user'
            active_segmented.value = 1
        }
        page_num.value = 1
        getCouponList()
    })
}

async function getCouponList() {
    loading.value = true
    coupon_list.value = []
    let params
    switch(active_tab.value) {
        case 'active':
            params = {
                pageNum: page_num.value,
                pageSize: page_size.value,
                issueStatus: undefined,
                business: user_info.clientId,
            }
            break
        case 'user':
            params = {
                pageNum: page_num.value,
                pageSize: page_size.value,
                issueStatus: undefined,
                businessType: 3,
                business: user_info.clientId,
            }
            break
        case 'team':
            params = {
                pageNum: page_num.value,
                pageSize: page_size.value,
                issueStatus: undefined,
                businessType: 2,
                business: user_info.teamId,
            }
            break
    }
    switch(active_segmented.value) {
        case 1:
            params.issueStatus = undefined
            break
        case 2:
            params.issueStatus = 2
            break
        case 3:
            params.issueStatus = 3
            break
        case 4:
            params.issueStatus = 4
            break
    }
    try {
        let res
        if(active_tab.value == 'active') {
            res = await useGetActivityCouponList(params)
        } else {
            res = await useGetCoupon(params)
        }
        coupon_list.value = res.rows
        total.value = res.total
    }
    catch(err) {
        console.log(err)
    }
    finally {
        loading.value = false
    }
}

function changeTab() {
    active_segmented.value = active_tab == 'active' ? undefined : 1
    getCouponList()
}

async function claimCoupon(id) {
    try {
        loading.value = true
        const data = {
            issueId: id,
            issueObjectId: user_info.clientId,
        }
        await useClaimCoupon(data)
        ElMessage.success('领取成功！')
        getCouponList()
    }
    catch(err) {
        console.log(err)
    }
}

function useCoupon() {
    tab_store.clickTabbar(2)
}

defineExpose({ open })
</script>

<template>
    <el-dialog v-model="show" title="优惠券中心" top="50px" width="1200" :close-on-click-modal="false" :close-on-press-escape="false">
        <el-tabs ref="tab_dom" type="border-card" v-model="active_tab" @tab-change="changeTab">
            <el-tab-pane v-for="item in tabs" :key="item.name" :label="item.label" :name="item.name" :disabled="loading">
                <el-segmented v-if="active_tab != 'active'" v-model="active_segmented" :options="options" block @change="getCouponList"/>
                <div class="flex-center coupon-list" v-loading="loading">
                    <!-- 优惠券项：v-for 循环渲染 -->
                    <div 
                      class="coupon-item" 
                      :class="[
                        (active_tab == 'active' || coupon.issueStatus == 2) ? 'coupon-available' : '',
                        coupon.issueStatus == 3 ? 'coupon-used' : '',
                        coupon.issueStatus == 4 ? 'coupon-expired' : '' 
                      ]" 
                      v-for="coupon in coupon_list" 
                      :key="coupon.id">
                        <!-- 优惠券左侧：金额/折扣区 -->
                        <div class="flex-center-col coupon-left">
                            <div>
                                <!-- 折扣券/满减券区分 -->
                                <span class="font-middle font-600" v-if="coupon.couponMode === 1">¥{{ coupon.deductionAmount }}</span>
                                <span class="font-middle font-600" v-else-if="coupon.couponMode == 2">{{ coupon.couponRate / 10 }}折</span>
                            </div>
                            <div class="font-mini">满￥{{ coupon.serviceThreshold }}可用</div>
                        </div>
                        <!-- 优惠券右侧：描述/使用区 -->
                        <div class="flex-center-col coupon-right">
                            <div class="coupon-title">
                                <div class="multi-line-ellipsis-1">{{ coupon.couponName }}</div>
                                <div class="font-mini font-5D5D5D" v-if="coupon.validEndDate == '永久有效'">永久有效</div>
                                <div class="font-mini font-5D5D5D" v-else>{{ dayjs(coupon.validStartDate).format('YYYY-MM-DD') }} ~ {{ dayjs(coupon.validEndDate).format('YYYY-MM-DD') }}</div>
                            </div>
                            <div class="font-mini font-5D5D5D coupon-remark">{{ coupon.remark }}</div>
                            <!-- 按钮区分状态 -->
                            <div class="flex-center coupon-btn">
                                <div class="custom-button" v-if="active_tab == 'active'" @click="claimCoupon(coupon.issueId)">立即领取</div>
                                <div class="custom-button" v-if="active_tab != 'active' && coupon.issueStatus === 2" @click="useCoupon">立即使用</div>
                                <div v-if="active_tab != 'active' && coupon.issueStatus === 3">已使用</div>
                                <div v-if="active_tab != 'active' && coupon.issueStatus === 4">已失效</div>
                            </div>
                        </div>
                        <!-- 左侧撕边效果 -->
                        <div class="coupon-notch-left"></div>
                        <!-- 右侧撕边效果 -->
                        <div class="coupon-notch-right"></div>
                    </div>
                    <!-- 空状态（当前假数据有值，不会显示） -->
                    <div class="flex-center coupon-empty" v-if="coupon_list.length === 0">
                        <el-empty description="暂无优惠券" />
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
        <div class="pagination-box flex-center">
            <el-pagination
              v-model:current-page="page_num"
              v-model:page-size="page_size"
              :page-sizes="[10, 20, 30, 50]"
              :background="true"
              layout="total, sizes, prev, pager, next"
              :total="total"
              @change="getCouponList"
            />
        </div>
    </el-dialog>
</template>

<style lang="scss" scoped>
.coupon-list {
    overflow: auto;
    gap: 15px;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
    width: 1135px;
    height: 550px;
    padding: 15px 0 0;
    .coupon-item {
        position: relative;
        display: flex;
        width: calc(1075px / 3);
        height: 160px;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        transition: all 0.3s ease;
        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
        }
        &.coupon-available {
            .coupon-left {
                background: linear-gradient(135deg, #ff7e5f, #feb47b); // 橙红渐变
                color: #fff;
            }
        }
        &.coupon-used {
            opacity: 0.7;
            .coupon-left {
                background: linear-gradient(135deg, #999, #ccc);
                color: #fff;
            }
        }
        &.coupon-expired {
            opacity: 0.7;
            .coupon-left {
                background: linear-gradient(135deg, #ccc, #f5f5f5);
                color: #666;
            }
        }
        .coupon-left {
            flex: 0 0 120px;
            row-gap: 15px;
        }
        .coupon-right {
            flex: 1;
            justify-content: space-between;
            align-items: flex-start;
            padding: 10px 10px 10px 15px;
            .coupon-title {
                width: 100%;
                height: 40px;
            }
            .coupon-remark {
                display: -webkit-box;          /* 旧版 Flex 布局（必要） */
                -webkit-line-clamp: 3;         /* 限制显示行数 */
                -webkit-box-orient: vertical;  /* 垂直排列内容 */
                overflow: hidden;              /* 隐藏溢出内容 */
                text-overflow: ellipsis;       /* 显示省略号 */
                width: 100%;
            }
            .coupon-btn {
                justify-content: flex-end;
                width: 100%;
                height: 30px;
                .custom-button {
                    width: 120px;
                    height: 30px;
                }
            }
        }
    
        // 左侧撕边效果（半圆缺口）
        .coupon-notch-left {
            position: absolute;
            top: 50%;
            left: 120px;
            width: 16px;
            height: 16px;
            background: #fff;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 0 8px #fff, 0 0 0 9px rgba(0, 0, 0, 0.02);
        }
      
        // 右侧撕边效果（伪元素实现）
        .coupon-notch-right {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 16px;
            background: linear-gradient(to right, transparent 0, transparent 50%, #fff 50%, #fff 100%);
            background-size: 8px 16px;
            opacity: 0.2;
        }
    }
    
    // 空状态
    .coupon-empty {
        width: 100%;
        height: 100%;
    }
}

.pagination-box {
    justify-content: flex-end;
    width: 1165px;
    height: 60px;
}
</style>