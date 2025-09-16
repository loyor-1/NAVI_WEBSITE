<script setup>
import { defineProps } from 'vue';

const props = defineProps(['base_data'])

function download() {
    const a = document.createElement("a")
    a.href = import.meta.env.VITE_FILE_API + props.base_data.fileList[0].url
    a.download = props.base_data.fileList[0].name
    a.click()
}
</script>

<template>
    <div class="fieId-box">
        <div class="fieId-label">{{ props.base_data.fieIdName }}</div>
        <div class="fieId-content">
            <el-button v-if="props.base_data.fileList.length" type="primary" plain @click="download"><el-icon><MostlyCloudy /></el-icon>下载附件</el-button>
            <el-button v-else type="info" plain disabled><el-icon><MostlyCloudy /></el-icon>无可下载附件</el-button>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>