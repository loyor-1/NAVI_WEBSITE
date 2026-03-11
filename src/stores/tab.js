import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useTabStore = defineStore('tab', () => {
    const router = useRouter()
    
    //可以随意向后添加页面，不需做其他处理
    const tab_list_all = ref([
        { label: '首页', index: 0, active: true, path: '/home_page'},
        { label: '云现场', index: 1, active: false, path: '/cloud_scene'},
        { label: '材料检测', index: 2, active: false},
        { label: '高端测试', index: 3, active: false},
        { label: '生物检测', index: 4, active: false},
        { label: '仪器采购', index: 5, active: false},
        { label: '材料加工', index: 6, active: false},
        { label: '试剂耗材', index: 7, active: false},
        { label: '环境检测', index: 8, active: false},
        { label: '模拟计算', index: 9, active: false},
        { label: '科研绘图', index: 10, active: false},
        { label: '论文润色', index: 11, active: false},
        { label: '数据分析', index: 12, active: false},
        { label: '关于我们', index: 13, active: false},
        { label: '关于我们', index: 14, active: false},
        { label: '关于我们', index: 15, active: false},
        { label: '关于我们ef', index: 16, active: false},
        { label: '关于我们11', index: 17, active: false},
        { label: '关于我们22', index: 18, active: false},
    ])

    const tab_list = ref([])

    function initTabList() {
        const list = localStorage.getItem('tab_list')
        tab_list.value = list ? JSON.parse(list) : JSON.parse(JSON.stringify(tab_list_all.value.slice(0, 14)))
    }
    initTabList()

    function saveTabList() {
        localStorage.setItem('tab_list', JSON.stringify(tab_list.value))
    }

    //tabbar翻页
    function changeMenuList(num) {
        //查找当前选中的tab栏目
        const active_tab_index = tab_list_all.value.find(item => item.active).index
        if(tab_list.value.length == tab_list_all.value.length) {
            // 长度相等时，左右箭头为切换页面
            const result = active_tab_index + num
            if(result >= 0 && result <= tab_list.value.length - 1) clickTabbar(tab_list.value[result])
        } else {
            // 长度不等时，左右箭头为翻页
            const index_start = tab_list_all.value.findIndex(item => item.index == tab_list.value[0].index) + num
            const index_end = tab_list_all.value.findIndex(item => item.index == tab_list.value[tab_list.value.length - 1].index) + 1 + num
            if(index_start < 0 || index_end > tab_list_all.value.length - 1) return
            tab_list.value = JSON.parse(JSON.stringify(tab_list_all.value.slice(index_start, index_end)))
            saveTabList()
            if(active_tab_index < tab_list.value[0].index) clickTabbar(tab_list.value[0])
            if(active_tab_index > tab_list.value[tab_list.value.length - 1].index) clickTabbar(tab_list.value[tab_list.value.length - 1])
        }
    }
    
    //选中tabbar
    function clickTabbar(data) {
        tab_list_all.value.forEach(item => {
            item.active = item.index == data.index
        })
        tab_list.value.forEach(item => {
            item.active = item.index == data.index
        })
        saveTabList()
        router.push(data.path || '/')
    }

    return { tab_list, changeMenuList, clickTabbar }
})
