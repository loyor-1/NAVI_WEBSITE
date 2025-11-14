<script setup>
import axios from 'axios'
import { useBlockUploadSuccess, useGetFileUUID } from '@/api'
import { getToken } from '@/utils/auth'
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { beforeUpload } from './tools'

const emit = defineEmits(['getFile'])

const props = defineProps({
    linkfileList: {
        type: Array,
        default: () => []
    },
    limit: {
        type: Number,
        default: 5
    },
    fileType: {
        type: String,
        default: ''
    },
    btnSize: {
        type: String,
        default: ''
    },
    btnbg: {
        type: String,
        default: '#EDF0FF'
    },
    buttonTxt: {
        type: String,
        default: '点击上传'
    },
    index: {
        type: [String, Number],
        default: ''
    },
    indexs: {
        type: [String, Number],
        default: ''
    },
    isGlobal: {
        type: Boolean,
        default: false
    },
})

const uploading = ref(false)
const internal_disabled = ref(false)
const needress = ref(false)
const type = ref(props.fileType)// fileType: "DOC,DOCX,XLS,XLSX,PPT,PDF,TXT,JPG,JPEG,PNG,BMP,GIF"
const uuid = ref(null)
const percentage = ref(0)
// const uploadUrl = import.meta.env.VITE_BASE_API + '/file/copyMuFile'
const uploadUrl = import.meta.env.VITE_BASE_API + '/file/blockUpload'
const uploadUrl1 = import.meta.env.VITE_BASE_API + '/file/upload'
const headers = { Authorization: 'Bearer ' + getToken() }
const file_list = ref([])

watch(
    () => props.linkfileList,
    () => {
        file_list.value = props.linkfileList
    },
    { immediate: true },
)

watch(
    () => props.fileType,
    (newValue) => {
        type.value = newValue
    },
    { immediate: true },
)

async function getFileId() {
    const res = await useGetFileUUID()
    uuid.value = res.data
}
getFileId()

function upload(options) {
    uploading.value = true
    internal_disabled.value = true
    uploading.value = true
    let file = options.file
    let chunkSize = 10 * 1024 * 1024 // 每个块的大小为 100MB
    let size = file.size
    if (size <= 10 * 1024 * 1024) {
        chunkSize = 1 * 1024 * 1024
    } else if (size <= 50 * 1024 * 1024) {
        chunkSize = 5 * 1024 * 1024
    } else {
        chunkSize = 10 * 1024 * 1024
    }
    const chunks = []
    let startPos = 0
    let percentage = 0
    while (startPos < file.size) {
        chunks.push(file.slice(startPos, startPos + chunkSize))
        startPos += chunkSize
    }
    let uploadStatus = []
    chunks.map(async (chunk, index) => {
        const data = new FormData()
        data.set('dirName', uuid.value)
        data.set('fileName', file.name)
        data.set('size', file.size)
        data.set('chunks', chunks.length)
        data.set('chunk', index + 1)
        data.append('file', chunk)
        try {
            const res = await axios.post(
                uploadUrl, 
                data, 
                { 
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )
            if (res.data.code === 200) {
                percentage++
                uploadStatus.push('true')
            } else {
                uploadStatus.push('false')
            }
            updatePercentage(percentage, chunks.length, file.size, file.name, uploadStatus)
        }
        catch(err) {
            console.log(err)
            uploadStatus.push('false')
            updatePercentage(percentage, chunks.length, file.size, file.name, uploadStatus)
        }
    })
}

async function getUploadUrl(size, name) {
    try {
        const res = await useBlockUploadSuccess({ dirName: uuid.value, size: size })
        // let fileInfo = res.data
        const file_info = {
            name: name,
            url: import.meta.env.VITE_FILE_API + res.data,
        }
        file_list.value.push(file_info)
        await handleUploadSuccess(res, file_info, file_list.value)
    }
    catch(err) {
        console.log(err)
        uploading.value = false
        internal_disabled.value = false
        percentage.value = 0
        filedList.value.pop()
        ElMessage.error('文件上传失败')
    }
}

function updatePercentage(num, total, size, name, list) {
    if (list.length === total) {
        if (list.includes('false')) {
            uploading.value = false
            internal_disabled.value = false
            percentage.value = 0
            filedList.value.pop()
            ElMessage.error('文件上传失败')
        } else {
            getUploadUrl(size, name)
        }
    }
    percentage.value = Math.floor((num / total) * 100)
}

// 上传前校检格式和大小
function handleBeforeUpload(file) {
    // 校检文件类型
    if (type.value) {
        let typeList = type.value.split(',')
        return beforeUpload(file, typeList, type.value)
    }
    if (file.name.length > 50) {
        ElMessage.error('文件名长度不能超过50个字')
        return false
    }
    return true
}

// 文件个数超出
function handleExceed(files, fileList) {
    ElMessage.error(`当前限制只能上传 ${props.limit} 个文件`)
}
function getFile(type, index, refIdx) {
    emit('getFile', file_list.value, type, index, refIdx)
}

// 上传成功回调
async function handleUploadSuccess(res, file, fileList) {
    ElMessage.success('上传成功')
    uploading.value = false
    internal_disabled.value = false
    percentage.value = 0
    file_list.value = fileList.map((i) => {
        return { name: i.name, url: i.response ? i.response.data.url : i.url }
    })
    // file_list.value.push({ name: res.data.name, url: res.data.url })
}

function handleRemove(file, fileList) {
    file_list.value = file_list.value.filter((item) => item.uid !== file.uid)
}

defineExpose({ getFile })
</script>

<template>
    <div class="upload-box">
        <!-- 按钮样式文件上传 -->
        <el-upload
            class="uploader flex-center"
            :action="uploadUrl"
            :file-list="file_list"
            :limit="props.limit"
            :headers="headers"
            list-type="picture-card"
            :http-request="upload"
            :on-exceed="handleExceed"
            :before-upload="handleBeforeUpload"
            :on-remove="handleRemove">
            <!-- <el-button :size="btnSize" type="primary" :style="{ background: btnbg }" plain>{{ buttonTxt }}</el-button> -->
            <el-icon class="icon"><Plus /></el-icon>
        </el-upload>
        <el-progress :stroke-width="2" v-if="uploading && needress" :percentage="percentage"></el-progress>
    </div>
</template>

<style>
.upload-box {
    display: flex;
    width: 100%;
}

.uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}
</style>