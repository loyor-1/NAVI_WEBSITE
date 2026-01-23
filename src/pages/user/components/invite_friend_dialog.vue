<script setup>
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useGetInviteFriendsList, useGetEstimateIncomeList } from '@/api'

const loading = ref(false)
const show = ref(false)
const active_name = ref('first')
const table_data = ref([])

const form = ref({
    total: 0,
    type: 1,
    search: ''
})
const tab_list = ref([
    {
        label: '邀请人数',
        name: 'first',
    },
    {
        label: '预估收益',
        name: 'second',
    },
    {
        label: '已结算',
        name: 'third',
    }
])
const page_form = ref({
    pageSize: 10,
    pageNum: 1,
})
const status_map = {
    1: "待结算",
    2: "已结算",
    3: "已失效",
}
const status_color_map = {
    1: "#FE5900",
    2: "#448807",
    3: "#7E8488",
}
const cert_status_map = {
    0: '未认证',
    1: '已认证',
    2: '审核中',
}
const cert_status_color_map = {
    1: '#FF9D00',
    2: '#7E8488',
    3: '#ff4a2b',
}

function getAmount(amount) {
    if (amount) {
        return Number(amount).toFixed(2)
    } else {
        return "0.00"
    }
}

function publicOpen(title) {
    const data = tab_list.value.find(item => item.label == title)
    active_name.value = data.name
    show.value = true
    page_form.value.pageNum = 1
    getData()
}

function handleClose() {
    form.value.search = ''
}

function handleClickTab(e) {
    active_name.value = e
    page_form.value.pageNum = 1
    getData()
}

async function handleClickNotify() {
    try{
        const url = `${import.meta.env.VITE_POET}/user/account_manage/identity_authentication`
        await navigator.clipboard.writeText(url)
        ElMessage.success('复制成功')
    }
    catch(err) {
        console.log(err)
        ElMessage.error('复制失败')
    }
}

function handleSearch(){
    page_form.value.pageNum = 1
    getData()
}

function handleChangeOrderOrNumbers() {
    page_form.value.pageNum = 1
    form.value.search = ''
    getData()
}

function handleCurrentChange(currentPage) {
    page_form.value.pageNum = currentPage
    getData()
}

function handleSizeChange(pageSize) {
    page_form.value.pageSize = pageSize
    getData()  
}

async function getData() {
    loading.value = true
    table_data.value = []
    try {
        if (active_name.value == 'first') {
            const params = {
                ...page_form.value,
                queryType:1
            }
            const res = await useGetInviteFriendsList(params)
            form.value.total = res.total
            table_data.value = res.rows
        } else {
            let params = {
                ...page_form.value,
            }
            if(active_name.value == 'third'){
                if(form.value.type == 1){
                    params.status = 2
                }else if(form.value.type == 2){
                    params.newStatus = 2
                }
            }
            if (form.value.type == 1) {
                params.orderCode = form.value.search
                const res = await useGetEstimateIncomeList(params)
                form.value.total = res.total
                table_data.value = res.rows
            } else {
                params.clientName = form.value.search
                const res = await useGetInviteFriendsList(params)
                form.value.total = res.total
                table_data.value = res.rows
            }
        }
        loading.value = false
    }
    catch(err) {
        console.log(err)
        loading.value = false
    }
}

defineExpose({ publicOpen })
</script>

<template>
    <el-dialog title="邀请好友" top="10vh" v-model="show" width="1000px" @close="handleClose" append-to-body>
        <template #title>
            <el-tabs v-model="active_name" @tab-change="handleClickTab($event)">
                <el-tab-pane :disabled="loading" v-for="(item, index) in tab_list" :key="index" :label="item.label" :name="item.name"></el-tab-pane>
            </el-tabs>
        </template>
        <div v-loading="loading" class="content" v-if="active_name == 'first'">
            <div class="table-container">
                <el-table :data="table_data" style="width: 100%;" height="400">
                    <el-table-column label="日期" prop="addDate" width="180"></el-table-column>
                    <el-table-column label="被邀请人" prop="clientName"></el-table-column>
                    <el-table-column label="状态" prop="certStatus">
                        <template #default="scope">
                            <span :style="{ color: cert_status_color_map[scope.row.certStatus] }">{{ cert_status_map[scope.row.certStatus] }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" prop="operation">
                        <template #default="scope">
                            <el-link type="primary" v-if="scope.row.certStatus == 0" @click="handleClickNotify(scope.row)" :disabled="scope.row.certStatus == 1">复制链接提醒ta认证</el-link>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <div v-loading="loading" class="content" v-else>
            <div class="search-container">
                <div>
                    <el-radio-group v-model="form.type" @change="handleChangeOrderOrNumbers">
                        <el-radio-button :label="1">邀请订单</el-radio-button>
                        <el-radio-button :label="2">邀请人数</el-radio-button>
                    </el-radio-group>
                </div>
                <!-- // 添加回车监听 -->
                <el-input v-model="form.search" :placeholder="form.type == 1? '请输入订单编号':'请输入被邀请人姓名'" style="width: 220px; margin: 0px 12px" @keyup.enter="handleSearch"></el-input>
                <el-button type="primary" :icon="Search" @click="handleSearch">搜 索</el-button>
            </div>
            <div class="table-container">
                <el-table :data="table_data" style="width: 100%;" height="400">
                    <el-table-column label="日期" prop="addDate" width="180"></el-table-column>
                    <el-table-column label="被邀请人" prop="clientName"></el-table-column>
                    <el-table-column label="类型" prop="type">
                        <template>
                            <span>{{ form.type == 1 ? '邀请订单' : '邀请注册' }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column v-if="form.type == 1" label="订单编号" prop="orderCode"></el-table-column>
                    <el-table-column label="奖励金额（元）" prop="amount">
                        <template #default="scope">
                            <span>{{ getAmount(scope.row.amount) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" prop="status">
                        <template #default="scope">
                            <span :style="{ color: status_color_map[scope.row.status] }">{{ status_map[scope.row.status] }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <div class="pagination">
            <el-pagination layout="total, sizes,prev, pager, next, jumper" :total="form.total" :page-size="page_form.pageSize" @current-change="handleCurrentChange" @size-change="handleSizeChange"></el-pagination>
        </div>
    </el-dialog>
</template>

<style scoped lang="scss">
.content {
    .search-container {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
    }
}
.pagination {
    display: flex;
    justify-content: center;
    margin: 20px;
}
</style>
