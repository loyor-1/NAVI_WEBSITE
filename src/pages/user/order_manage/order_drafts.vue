<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { getUserInfo } from '@/utils/auth'
import { useGetDraftsList, useDeleteDrafts } from '@/api'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const drafts_list = ref([])
const total = ref(0)
const params = ref( {
    clientId: getUserInfo().clientId,
    pageNum: 1,
    pageSize: 9,
	equipmentName: '',
})

async function getDraftsList() {
    try {
        loading.value = true
        const res = await useGetDraftsList(params.value)
        res.rows.forEach(item => {
            item.equipment_pic = (item.fileList && item.fileList.length) ? import.meta.env.VITE_FILE_API + item.fileList[0].url : ''
        })
        drafts_list.value = res.rows
        total.value = res.total
        loading.value = false
    }
    catch(err) {
        console.log(err)
        loading.value = false
    }
}
getDraftsList()

function search() {
    params.value.pageNum = 1
    params.value.pageSize = 9
    getDraftsList()
}

function deleteSubscribeDrafts(id) {
    ElMessageBox.confirm('是否确认删除该草稿？', '提示', {type: 'warning'}).then(async () => {
        try {
            await useDeleteDrafts(id)
            await getDraftsList()
            ElMessage.success('删除成功！')
        }
        catch(err) {
            console.log(err)
        }
    })
}

function toDetectionOrder(data) {
    router.push({
        path: '/appoint_order',
        query: {
            type: 'drafts',
            equipment_id: data.equipmentId,
            draft_id: data.id,
        }
    })
}
</script>

<template>
    <div class="page-main">
        <div class="flex-center font-middle page-head">草稿箱</div>
        <div class="flex-center search-box">
            <el-input v-model="params.equipmentName" placeholder="请输入设备名称" @keyup.enter="search">
                <template #append>
                    <el-button :icon="Search" @click="search"/>
                </template>
            </el-input>
        </div>
        <div class="flex-center page-content" v-loading="loading" v-if="drafts_list.length">
            <div class="drafts" v-for="(item, index) in drafts_list" :key="item.id">
                <div class="drafts-title"> {{ item.equipmentName }} </div>
                <div class="drafts-content">
                    <img class="drafts-equipment" :src="item.equipment_pic" alt="">
                    <div class="drafts-info">
                        <div>
                            <div>添加时间：</div>
                            <div> {{ item.addDate }} </div>
                        </div>
                        <div class="button-box">
                            <el-button class="el-icon-delete" type="danger" plain :loading="item.loading" @click="deleteSubscribeDrafts(item.id, index)">删除</el-button>
                            <el-button class="el-icon-edit" type="success" plain :loading="item.loading" @click="toDetectionOrder(item)">继续编辑</el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex-center page-content-null" v-loading="loading" v-else>
            <el-empty description="暂未存储草稿" />
        </div>
        <div class="flex-center pagination-box">
            <el-pagination
              v-model:current-page="params.pageNum"
              v-model:page-size="params.pageSize"
              :page-sizes="[9, 18, 27, 36]"
              :background="true"
              layout="total, sizes, prev, pager, next"
              :total="total"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.page-main {
    width: calc(88vw - 30px);
    min-width: 1238px;
    height: calc(100vh - 30px);
    background-color: #FFFFFF90;
    border-radius: 10px;
}

.page-head {
    width: 100%;
    height: 50px;
    border-radius: 10px 10px 0 0;
    background-color: #94C9FF80;
}
.search-box {
    height: 60px;
    padding: 0 15px;
    border-bottom: 1px solid #E8E8E8;
    background-color: #FFFFFF;
}
.page-content {
    flex-wrap: wrap;
    gap: 20px;
    justify-content: flex-start;
    align-content: flex-start;
    width: calc(88vw - 30px);
    min-width: 1238px;
    height: calc(100vh - 190px);
    padding: 15px;
    .drafts {
        width: calc((88vw - 100px) / 3);
        min-width: 389px;
        border-radius: 5px;
        border: 1px solid #5CC300;
        background-color: #FFFFFF;
        .drafts-title {
            height: 50px;
            padding-left: 15px;
            font-size: 18px;
            line-height: 50px;
            background-color: #5CC30030;
        }      
        .drafts-content {
            display: flex;
            column-gap: 15px;
            padding: 15px;
            .drafts-equipment {
                width: 120px;
                height: 120px;
                border-radius: 5px;
                border: 1px solid #ccc;
            }
            .drafts-info {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                width: 100%;
                height: 120px;
                font-size: 16px;
                .button-box {
                    display: flex;
                    justify-content: flex-end;
                    width: 100%;
                }
            }
        } 
    }
}
.page-content-null {
    width: calc(88vw - 30px);
    min-width: 1238px;
    height: calc(100vh - 190px);
    padding: 15px;
}
.pagination-box {
    justify-content: flex-end;
    width: 100%;
    height: 50px;
    padding-right: 15px;
    background-color: #FFFFFF;
}
</style>