<script setup>
import { ref, watch } from "vue";
import { getUserInfo } from '@/utils/auth';
import { useGetPrestoreRecord } from "@/api";

const loading = ref(true)
const log_list = ref([])//预存记录列表
const total = ref(0)//记录总条数

//个人预存记录接口查询参数
const params = ref({
    clientId: JSON.parse(getUserInfo()).clientId,
    pageNum: 1,
    pageSize: 25,
})

watch(
    params,
    () => {
        getPrestoreRecord()
    },
    { 
        deep: true,
        immediate: true,
    }
)

async function getPrestoreRecord() {
    loading.value = true
    const res = await useGetPrestoreRecord(params.value)
    log_list.value = res.rows
    total.value = res.total
    loading.value = false
}
</script>

<template>
    <div class="page-main">
        <el-table class="log-table" :data="log_list" v-loading="loading" height="calc(100vh - 390px)" :border="true" :header-cell-style="{ backgroundColor: '#94C9FF30', height: '60px'}">
            <el-table-column label="预存编号" prop="prestoreCode" header-align="center" align="center" />
            <el-table-column label="预存发票号" prop="invoiceCode" header-align="center" align="center" />
            <el-table-column label="预存金额" prop="amountDeposited" header-align="center" align="center">
                <template #default="scope">
                    <span>￥{{ scope.row.amountDeposited }}</span>
                </template>
            </el-table-column>
            <el-table-column label="登记时间" prop="registerDate" header-align="center" align="center" />
        </el-table>
        <div class="pagination-box">
            <el-pagination
              v-model:current-page="params.pageNum"
              v-model:page-size="params.pageSize"
              :page-sizes="[25, 50, 75, 100]"
              :background="true"
              layout="total, sizes, prev, pager, next"
              :total="total"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.page-main {
    position: relative;
    width: calc((88vw - 30px) * 0.78);
    min-width: 965px;
    height: calc(100vh - 290px);
    padding-top: 20px;
}

.log-table {
    overflow: hidden;
    width: calc(100% - 40px);
    height: calc(100vh - 390px);
    margin: 0 auto 20px;
}
.pagination-box {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: calc((88vw - 30px) * 0.78);
    min-width: 965px;
    height: 60px;
    padding: 0 15px;
    border-top: 1px solid #cccccc;
}
</style>