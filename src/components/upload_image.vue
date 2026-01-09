<script setup>
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'
import { ref } from 'vue'


const props = defineProps({
    limit: {
        typeof: [Number],
        default: 1,
    },
})
const emits = defineEmits(['updateValue'])

const action = import.meta.env.VITE_BASE_API + '/file/upload'
const headers = {
    Authorization: "Bearer " + getToken()
}

const upload_dom = ref(null)

const file_list = ref([])

// 上传前校检格式和大小
function handleBeforeUpload(file) {
    // 校检文件类型
    if (file.name.length > 50) {
        ElMessage.error("文件名长度不能超过50个字")
        return false
    }
    return true
}

// 文件个数超出
function handleExceed(files, fileList) {
    ElMessage.warning(`当前限制只能上传 ${props.limit} 个文件`)
}

// 上传失败
function handleUploadError(err) {
    ElMessage.error("上传失败, 请重试")
}

// 上传成功回调
function handleUploadSuccess(res, file, fileList) {
    file_list.value = []
    file_list.value.push({ name: res.data.name, url: import.meta.env.VITE_FILE_API + res.data.url })
    const result_list = file_list.value.map(item => {
        const target_prefix = import.meta.env.VITE_FILE_API.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 转义所有正则元字符
        const reg = new RegExp(`^${target_prefix}`)
        item.url = item.url.replace(reg, '')
        return item
    })
    emits('updateValue', result_list)
}

function handleRemove(file, fileList) {
    file_list.value = file_list.value.filter(item => item.uid !== file.uid)
}

function cleanList() {
    file_list.value = []
    upload_dom.value.clearFiles()
}

defineExpose({ cleanList })

</script>

<template>
    <el-upload
      ref="upload_dom"
      v-model="file_list"
      :action="action"
      :limit="props.limit"
      :headers="headers"
      :before-upload="handleBeforeUpload"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :on-remove="handleRemove"
      multiple
      list-type="picture-card"
    >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    </el-upload>
</template>

<style lang="scss" scoped>
.el-icon--upload {
    transform: scale(5);
}
</style>