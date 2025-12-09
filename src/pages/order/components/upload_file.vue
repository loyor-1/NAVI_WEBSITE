<script setup>
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { defineProps, defineEmits, ref } from 'vue'
import { getToken } from '@/utils/auth'
import { useGetFileUUID, useBlockUploadSuccess } from '@/api'

const props = defineProps(['base_data'])
const emit = defineEmits(['updateValue'])

const value_data = ref({
    fieIdValue: '',
    fileList: [],
})

const action = import.meta.env.VITE_BASE_API + '/file/blockUpload'
const headers = { Authorization: 'Bearer ' + getToken() }
const uploading = ref(false)
const uuid = ref('')
const percentage = ref(0)

// 获取uuid
async function getFileUUID() {
    try {
        const res = await useGetFileUUID()
        uuid.value = res.data
    }
    catch(err) {
        console.log(err)
    }
}
getFileUUID()

// 上传前校检格式和大小
function handleBeforeUpload(file) {
    if (file.name.length > 50) {
        ElMessage.error('文件名长度不能超过50个字')
        return false
    }
    return true
}
// 文件个数超出
function handleExceed() {
    ElMessage.warning(`当前限制只能上传 5 个文件`)
}
//TODO  可以将分块大小放到组件中设置
async function upload(options) {
    uploading.value = true
    let file = options.file
    const chunkSize = 0.8 * 1024 * 1024 // 每个块的大小为 100MB
    const chunks = []
    let startPos = 0
    let percentage = 0
    while (startPos < file.size) {
        chunks.push(file.slice(startPos, startPos + chunkSize))
        startPos += chunkSize
    }
    let uploadStatus = []
    chunks.map((chunk, index) => {
        const data = new FormData()
        data.set('dirName', uuid.value)
        data.set('fileName', file.name)
        data.set('size', file.size)
        data.set('chunks', chunks.length)
        data.set('chunk', index + 1)
        data.append('file', chunk)
        axios.post(
            action,
            data, 
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        ).then((res) => {
            if (res.data.code === 200) {
                percentage++
                uploadStatus.push('true')
            } else {
                uploadStatus.push('false')
            }
            updatePercentage(percentage, chunks.length, file.size, file.name, uploadStatus)
        })
        .catch((err) => {
            console.log(err, 'err')
            uploadStatus.push(false)
            updatePercentage(percentage, chunks.length, file.size, file.name, uploadStatus)
        })
    })
}

function updatePercentage(num, total, size, name, list) {
    if (list.length === total) {
        if (list.includes('false')) {
            uploading.value = false
            percentage.value = 0
            value_data.value.filedList.pop()
            ElMessage.error('文件上传失败')
        } else {
            getUploadUrl(size, name)
        }
    }
    percentage.value = Math.floor((num / total) * 100)
}

async function getUploadUrl(size, name) {
    try {
        const res = await useBlockUploadSuccess({ dirName: uuid.value, size: size })
        let fileInfo = {
            url: res.data,
            name: name
        }
        value_data.value.fileList.push(fileInfo)
        handleUploadSuccess(res, fileInfo, value_data.value.fileList)
    }
    catch(err) {
        uploading.value = false
        percentage.value = 0
    }
}
// 上传成功回调
function handleUploadSuccess(res, file, fileList) {
    ElMessage.success('上传成功')
    uploading.value = false
    percentage.value = 0
    value_data.value.fileList = fileList.map((i) => {
        return { name: i.name, url: i.response ? i.response.data.url : i.url }
    })
    value_data.value.fieIdValue = JSON.stringify(value_data.value.fileList)
    updateValue()
}

function handleRemove(file, fileList) {
    value_data.value.fileList = value_data.value.fileList.filter((item) => item.uid !== file.uid)
}

function updateValue() {
    emit('updateValue', value_data.value)
}
</script>

<template>
    <div class="fieId-style">
        <div :id="props.base_data.fieIdId" class="fieId-box" :class="{'fieId-box-warning': !props.base_data.validate}">
            <div class="fieId-label">
                <span><span class="font-FF4A2B" v-if="props.base_data.isRequired">*</span>{{ props.base_data.fieIdName }}</span>
            </div>
            <div class="fieId-content">
                <el-upload
                    class="upload-box"
                    style="display: flex;"
                    :action="action"
                    :before-upload="handleBeforeUpload"
                    :file-list="value_data.fileList"
                    :limit="5"
                    :on-exceed="handleExceed"
                    :headers="headers"
                    :http-request="upload"
                    with-credentials
                    :on-remove="handleRemove">
                    <el-button type="primary" plain><el-icon><MostlyCloudy /></el-icon>上传附件</el-button>
                </el-upload>
                <el-progress :stroke-width="2" v-if="uploading" :percentage="percentage"></el-progress>
            </div>
        </div>
        <div class="fieId-tips">{{ props.base_data.fieIdRemark }}</div>
    </div>
</template>

<style lang="scss" scoped>
:deep(.fieId-content .el-upload-list) {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    align-items: center;
    margin: 0;
    width: 60vw;
    min-width: 864px;
}
:deep(.el-upload-list__item.is-success) {
    width: 18vw;
    min-width: 258px;
    white-space: nowrap;
    display: -webkit-box;          /* 旧版 Flex 布局（必要） */
    -webkit-line-clamp: 1;         /* 限制显示行数 */
    -webkit-box-orient: vertical;  /* 垂直排列内容 */
    overflow: hidden;              /* 隐藏溢出内容 */
    text-overflow: ellipsis;       /* 显示省略号 */
}

.upload-box {
    display: flex;
    column-gap: 15px;
}
</style>