<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useGetTeamList, useTransferTeamPrepayment} from '@/api'
import { getUserInfo } from '@/utils/auth'
import { ElMessage } from 'element-plus'

const emits = defineEmits(['refreshTeamInfo'])

const user_info = getUserInfo()
const data_dom = ref(null)

const loading = ref(false)
const search_loading = ref(false)
const show = ref(false)
const team_list = ref([])
const total = ref(0)

const rules = {
    transferMoney: [
        { required: true, message: '请输入划拨金额', trigger: 'blur' },
    ],
}
const params = ref({
    pageNum: 1,
    pageSize: 15,
    condition: '',
})
const data = ref({
    applyTeamId: user_info.teamId,
    receiveTeamId: undefined,
    transferMoney: undefined,
})

async function getTeamList() {
    try{
        loading.value = true
        search_loading.value = true
        const res = await useGetTeamList(params.value)
        team_list.value = res.rows
        total.value = res.total
        loading.value = false
        search_loading.value = false
    }
    catch(err) {
        console.log(err)
        loading.value = false
        search_loading.value = false
    }
}

function showDialog(row) {
    data.value.receiveTeamId = row.teamId
    show.value = true
}

function closeDialog() {
    data.value.receiveTeamId = undefined
    data.value.transferMoney = undefined
    data_dom.value.resetFields()
}

async function transferTeamPrepayment() {
    try {
        await useTransferTeamPrepayment(data.value)
        show.value = false
        ElMessage.success('预存划拨成功！')
        emits('refreshTeamInfo')
    }
    catch(err) {
        console.log(err)
    }
}

</script>

<template>
    <div class="container">
        <div class="flex-center search-box">
            <el-input v-model="params.condition" placeholder="请输入划拨人团体名称、划拨人姓名、手机号" @keyup.enter="getTeamList">
                <template #append >
                    <el-button class="search-button" :loading="search_loading" :icon="Search" @click="getTeamList"/>
                </template>
            </el-input>
        </div>
        <el-table class="team-table" v-loading="loading" :data="team_list" :header-cell-style="{ background: '#94C9FF50' }" border :height="`calc(100% - 140px)`">
            <el-table-column label="团队名称" prop="teamName"></el-table-column>
            <el-table-column label="团长" prop="teamHeadName"></el-table-column>
            <el-table-column label="手机号" prop="teamHeadPhone"></el-table-column>
            <el-table-column label="团体成员数" prop="personnelNum"></el-table-column>
            <el-table-column label="所属单位/高校" prop="affiliatedUnit"></el-table-column>
            <el-table-column width="140">
                <template #default="scope">
                    <div class="custom-button transfer-button" @click="showDialog(scope.row)">预存划拨</div>
                </template>
            </el-table-column>
        </el-table>
        <div class="flex-center pagination-box">
            <el-pagination
              v-model:current-page="params.pageNum"
              v-model:page-size="params.pageSize"
              :page-sizes="[15, 30, 50]"
              :background="true"
              layout="total, sizes, prev, pager, next"
              :total="total"
              @change="getTeamList"
            />
        </div>

        <el-dialog v-model="show" title="预存划拨" width="500" :close-on-click-modal="false" :close-on-press-escape="false" @close="closeDialog">
            <el-form style="padding: 15px;" ref="data_dom" :model="data" :rules="rules" label-width="auto">
                <el-form-item label="划拨金额" prop="transferMoney">
                    <el-input-number v-model="data.transferMoney" :min="1" :step="10" :precision="2" />
                </el-form-item>
                <el-form-item label="">
                    <div class="font-5D5D5D font-mini">
                        <span>请仔细核对</span>
                        <span class="font-FF4A2B">划拨团队</span>
                        <span>以及</span>
                        <span class="font-FF4A2B">划拨金额</span>
                        <span>，避免出错！</span>
                    </div>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="show = false">取消</el-button>
                    <el-button type="primary" @click="transferTeamPrepayment">确认</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100%;
}

.search-box {
    width: 100%;
    height: 60px;
    padding: 0 15px;
    .search-button {
        width: 150px;
    }
}

.team-table {
    width: calc(100% - 30px);
    margin: 0 auto;
    .transfer-button {
        width: 120px;
        height: 35px;
    }
}

.pagination-box {
    justify-content: flex-end;
    width: 100%;
    height: 50px;
    margin-top: 15px;
    padding: 0 15px;
    border-top: 1px solid #cccccc;
}
</style>