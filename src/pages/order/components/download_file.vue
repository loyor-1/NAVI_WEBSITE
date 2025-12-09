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
    <div class="fieId-style">
        <div :id="props.base_data.fieIdId" class="fieId-box" :class="{'fieId-box-warning': !props.base_data.validate}">
            <div class="fieId-label">
                <span><span class="font-FF4A2B" v-if="props.base_data.isRequired">*</span>{{ props.base_data.fieIdName }}</span>
            </div>
            <div class="fieId-content">
                <el-button v-if="props.base_data.fileList.length" type="primary" plain @click="download"><el-icon><MostlyCloudy /></el-icon>下载附件</el-button>
                <el-button v-else type="info" plain disabled><el-icon><MostlyCloudy /></el-icon>无可下载附件</el-button>
            </div>
        </div>
        <div class="fieId-tips">{{ props.base_data.fieIdRemark }}</div>
    </div>
</template>

<style lang="scss" scoped>

</style>
