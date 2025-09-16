import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useTabStore = defineStore('tab', () => {
    const router = useRouter()
    
    const tab_list_all = ref([
        { label: '首页', index: 0, active: true, page: '/home_page'},
        { label: '云现场', index: 1, active: false,},
        { label: '材料检测', index: 2, active: false},
        { label: '高端测试', index: 3, active: false},
        { label: '材料加工', index: 4, active: false},
        { label: '试剂耗材', index: 5, active: false},
        { label: '环境检测', index: 6, active: false},
        { label: '模拟计算', index: 7, active: false},
        { label: '科研绘图', index: 8, active: false},
        { label: '论文润色', index: 9, active: false},
        { label: '数据分析', index: 10, active: false},
        { label: '专利服务', index: 11, active: false},
        { label: '合作入驻', index: 12, active: false},
        { label: '关于我们', index: 13, active: false},
        { label: '预留页面', index: 14, active: false},
        { label: '预留页面', index: 15, active: false},
        { label: '预留页面', index: 16, active: false},
        { label: '预留页面', index: 17, active: false},
        { label: '预留页面', index: 18, active: false},
        { label: '预留页面', index: 19, active: false},
    ])

    const tab_list = ref(tab_list_all.value.slice(0, 14))

    //tabbar翻页
    function changeMenuList(num) {
        const index_start = tab_list_all.value.findIndex(item => item.index == tab_list.value[0].index) + num
        const index_end = tab_list_all.value.findIndex(item => item.index == tab_list.value[tab_list.value.length - 1].index) + 1 + num
        if(index_start < 0 || index_end > tab_list_all.value.length - 1) return
        tab_list.value = tab_list_all.value.slice(index_start, index_end)
    }
    
    //选中tabbar
    function clickTabbar(data) {
        tab_list_all.value.forEach(item => {
            item.active = item.index == data.index
        })
        router.push(data.page || '/')
    }

    return { tab_list, changeMenuList, clickTabbar }
})
