<script setup>
import { useRouter } from 'vue-router'
import { menu_list } from './menu_list'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import mitt_bus from '@/utils/mitt_bus'

const router = useRouter()

const active_index = ref('1-1')

function initActiveIndex() {
    active_index.value = localStorage.getItem('active_index') || '1-1'
}
initActiveIndex()

function toPage(i) {
    active_index.value = i.index
    localStorage.setItem('active_index', i.index)
    router.push(i.path || '/')
}

function toPageByIndex(data) {
    const menu = menu_list.find(item => item.index == data.index[0])
    const page_data = menu.child.find(item => item.index == data.index)
    if(page_data && page_data.path) {
        active_index.value = page_data.index
        localStorage.setItem('active_index', page_data.index)
        router.push({
            path: page_data.path,
            query: {
                ...data
            }
        })
    } else {
        router.push('/404')
    }
}

onMounted(() => {
    mitt_bus.on('changeUserActiveIndex', toPageByIndex)
})
</script>

<template>
    <div class="space-page">
        <div class="menu-list">
            <img class="menu-head" src="@/assets/logo/logo.png" alt="" @click="router.push('/home_page')">
            <div class="menu-content">
                <el-scrollbar>
                    <el-menu :default-active="active_index" background-color="transparent" active-text-color="#94C9FF">
                        <el-sub-menu :index="item.index" v-for="item in menu_list" :key="item.index">
                            <template #title>
                                <el-icon>
                                    <component :is="item.icon" />
                                </el-icon>
                                <span>{{ item.label }}</span>
                            </template>
                            <el-menu-item :index="i.index" v-for="i in item.child" :key="i.index" @click="toPage(i)">{{ i.label }}</el-menu-item>
                        </el-sub-menu>
                    </el-menu>
                </el-scrollbar>
            </div>
        </div>
        <el-scrollbar>
            <div class="child-page">
                <router-view/>
            </div>
        </el-scrollbar>
    </div>  
</template>

<style lang="scss" scoped>
.space-page {
    display: flex;
    width: 100vw;
    min-width: 1440px;
    height: 100vh;
}
:deep(.el-menu) {
    border-right: none;
}
:deep(.el-menu-item.is-active) {
    background-color: #94C9FF50;
    border-right: none !important;
}
.space-page :deep(.el-sub-menu__title:hover) {
    background-color: #94C9FF50 !important;
}    
:deep(.el-menu-item:hover) {
    background-color: #94C9FF50;
}    

.menu-list {
    position: relative;
    width: 12vw;
    min-width: 172px;
    height: 100vh;
    background-color: #FFFFFF90;
    .menu-head {
        width: 12vw;
        min-width: 172px;
        height: 5vw;
        min-height: 72px;
        padding: 15px;
        vertical-align: middle;
    }
    .menu-content {
        width: 12vw;
        min-width: 172px;
        height: calc(100vh - 5vw);
        max-height: calc(100vh - 72px);
    }
}
.child-page {
    width: 88vw;
    min-width: 1268px;
    height: 100vh;
    padding: 15px;
}
</style>