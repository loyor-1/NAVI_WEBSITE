<script setup>
import { useRouter } from 'vue-router';
import { reactive, ref } from 'vue';
import { menu_list } from './menu_list';

const router = useRouter()

</script>

<template>
    <div class="space-page">
        <el-scrollbar>
            <div class="menu-list">
                <img class="menu-head" src="@/assets/logo/logo.png" alt="" @click="router.push('/home_page')">
                <el-menu default-active="1-1" background-color="transparent" active-text-color="#94C9FF">
                    <el-sub-menu :index="item.index" v-for="item in menu_list" :key="item.index">
                        <template #title>
                            <el-icon>
                                <component :is="item.icon" />
                            </el-icon>
                            <span>账号管理</span>
                        </template>
                        <el-menu-item :index="i.index" v-for="i in item.child" :key="i.index">{{ i.label }}</el-menu-item>
                    </el-sub-menu>
                </el-menu>
            </div>
        </el-scrollbar>
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
    min-height: 100vh;
}
:deep(.el-menu-item.is-active) {
    background-color: #94C9FF50;
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
        position: sticky;
        top: 0;
        width: 12vw;
        min-width: 172px;
        padding: 15px;
    }
}
.child-page {
    width: 88vw;
    min-width: 1268px;
    height: 100vh;
    padding: 15px;
}
</style>