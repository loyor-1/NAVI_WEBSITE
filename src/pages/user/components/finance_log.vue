<script setup>
import { ref } from 'vue'
import { useGetFinanceLog } from '@/api'

const loading = ref(false)
const options = ref([])
const options_index = ref(0)
const date_list = ref([])
const log_list = ref([])
const total = ref(0)

const params = ref({
    pageNum: 1,
    pageSize: 15,
    orderByColumn: 'addDate',
    isAsc: 'desc',
    teamId: 41,
    typeList: [],
    orderCode: '',
    addName: '',
    checkName: '',
    startDate: '',
    endDate: '',
})

function initPage(team_id, type_value) {
    params.value.teamId = team_id
    switch(type_value) {
        case 1:
            params.value.typeList = [1, 2, 3, 4, 5]
            options.value = [
                { label: '全部', index: 0, value: [1, 2, 3, 4, 5] },
                { label: '预存', index: 1, value: [1] },
                { label: '消费', index: 2, value: [2, 3, 4] },
                { label: '退款', index: 3, value: [5] },
            ]
            break
        case 2:
            params.value.typeList = [6, 7, 8, 9]
            options.value = [
                { label: '全部', index: 0, value: [6, 7, 8, 9] },
                { label: '调额', index: 1, value: [9] },
                { label: '消费', index: 2, value: [6, 7] },
                { label: '退款', index: 3, value: [8] },
            ]
            break
    }
    getFinanceLog()
}

async function getFinanceLog() {
    try {
        loading.value = true
        const res = await useGetFinanceLog(params.value)
        log_list.value = res.rows
        total.value = res.total
        loading.value = false
    }
    catch(err) {
        console.log(err)
        loading.value = false
    } 
}

//时间筛选
function changeDate(e) {
    params.value.startDate = e ? e[0] : undefined
    params.value.endDate = e ? e[1] : undefined
    getFinanceLog()
}

function changeOptions(data) {
    if(options_index.value == data.index) return
    options_index.value = data.index
    params.value.typeList = data.value
    getFinanceLog()
}

defineExpose({ initPage })
</script>

<template>
    <div>
        <div class="page-main">
                <div class="page-main flex-center">
                <div class="utils-box">
                    <div class="search-box flex-center">
                        <!-- 订单号筛选 -->
                        <el-input v-model="params.orderCode" placeholder="订单号">
                            <template #append>
                                <el-button @click="getFinanceLog">
                                    <el-icon><Search /></el-icon>
                                </el-button>
                            </template>
                        </el-input>
                        <!-- 操作人筛选 -->
                        <el-input v-model="params.addName" placeholder="操作人">
                            <template #append>
                                <el-button @click="getFinanceLog">
                                    <el-icon><Search /></el-icon>
                                </el-button>
                            </template>
                        </el-input>
                        <!-- 检测名称筛选 -->
                        <el-input v-model="params.checkName" placeholder="检测名称">
                            <template #append>
                                <el-button @click="getFinanceLog">
                                    <el-icon><Search /></el-icon>
                                </el-button>
                            </template>
                        </el-input>
                        <!-- 时间筛选 -->
                        <div class="time-box">
                            <el-date-picker v-model="date_list" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" @change="changeDate"/>
                        </div>
                    </div>
                    <div class="menu-box">
                        <el-scrollbar>
                            <div class="default-button" :class="{'default-button-active': options_index == item.index}" v-for="item in options" :key="item.index" @click="changeOptions(item)"> {{ item.label }} </div>
                        </el-scrollbar>
                    </div>
                </div>
                <div class="table-box">
                    <el-table v-loading="loading" :data="log_list" :header-cell-style="{ background: '#94C9FF50' }" :height="`calc(100vh - 380px)`">
                        <el-table-column label="发生事件" prop="title" align="center" width="120"></el-table-column>
                        <el-table-column label="金额" align="center" width="120">
                            <template #default="scope">
                                <span class="font-FF4A2B">￥{{ scope.row.money || 0 }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="发生时间" prop="addDate" align="center" width="150"></el-table-column>
                        <el-table-column label="备注" prop="remark" align="center"></el-table-column>
                    </el-table>
                </div>
            </div>
            <div class="pagination-box flex-center">
                <el-pagination
                  v-model:current-page="params.pageNum"
                  v-model:page-size="params.pageSize"
                  :page-sizes="[15, 30, 50]"
                  :background="true"
                  layout="total, sizes, prev, pager, next"
                  :total="total"
                  @change="getFinanceLog"
                />
            </div>
        </div>

    </div>
</template>

<style lang="scss" scoped>
.page-main {
    width: calc((88vw - 30px) * 0.78);
    min-width: 965px;
    height: calc(100vh - 350px);
}

.utils-box {
    width: calc((88vw - 30px) * 0.78 * 0.2);
    min-width: 174px;
    height: calc(100vh - 350px);
    border-right: 1px solid #cccccc;
    .search-box {
        flex-direction: column;
        justify-content: space-around;
        height: 160px;
        padding: 0 15px;
        border-bottom: 1px solid #cccccc;
        .time-box :deep(.el-date-editor){
            width: 100%;
            height: 32px;
        }
    }
    .menu-box {
        height: calc(100vh - 510px);
        padding: 15px 0;
        .default-button {
            width: calc(100% - 30px);
            height: 40px;
            margin: 0 auto 15px;
        }
    }
}

.table-box {
    width: calc((88vw - 30px) * 0.78 * 0.8);
    min-width: 791px;
    height: calc(100vh - 350px);
    padding: 15px;
}

.pagination-box {
    justify-content: flex-end;
    width: calc((88vw - 30px) * 0.78);
    min-width: 965px;
    height: 60px;
    padding: 0 15px;
    border-top: 1px solid #cccccc;
}
</style>