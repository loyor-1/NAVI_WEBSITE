import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useTabStore = defineStore('tab', () => {
    const router = useRouter()
    
    //可以随意向后添加页面，不需做其他处理
    const tab_list_all = ref([
        { label: '首页', index: 0, active: true, page: '/home_page'},
        { label: '云现场', index: 1, active: false},
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
    ])

    const tab_list = ref(tab_list_all.value.slice(0, 14))

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
            tab_list.value = tab_list_all.value.slice(index_start, index_end)
            if(active_tab_index < tab_list.value[0].index) clickTabbar(tab_list.value[0])
            if(active_tab_index > tab_list.value[tab_list.value.length - 1].index) clickTabbar(tab_list.value[tab_list.value.length - 1])
        }
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
