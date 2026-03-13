import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useTabStore = defineStore('tab', () => {
    const router = useRouter()
    
    //可以随意向后添加页面，不需做其他处理----不得少于14条index必须严格排序
    const tab_list_all = ref([
        { label: '首页', index: 0, hot: false, active: true, path: '/home_page'},
        { label: '云现场', index: 1, hot: false, active: false, path: '/cloud_scene'},
        { label: '材料检测', index: 2, hot: true, active: false, path: '/material_test'},
        { label: '高端测试', index: 3, hot: true, active: false, path: '/high_test'},
        { label: '生物检测', index: 4, hot: true, active: false, path: '/bio_detection'},
        { label: '仪器采购', index: 5, hot: true, active: false, path: '/equipment_mall'},
        { label: '材料加工', index: 6, hot: false, active: false, path: '/material_processing'},
        { label: '试剂耗材', index: 7, hot: false, active: false, path: '/life_sciences'},
        { label: '环境检测', index: 8, hot: false, active: false, path: '/environment_detection'},
        { label: '模拟计算', index: 9, hot: false, active: false, path: '/analog_computation'},
        { label: '科研绘图', index: 10, hot: false, active: false, path: '/scientific_draw'},
        { label: '论文润色', index: 11, hot: false, active: false, path: '/thesis_services'},
        { label: '数据分析', index: 12, hot: false, active: false, path: '/data_analysis'},
        { label: '关于我们', index: 13, hot: false, active: false, path: '/about_us'},
        // { label: '预留页面', index: 14, hot: false, active: false, path: '/home_page'},
    ])

    const tab_list = ref([])

    function initTabList() {
        const list = JSON.parse(localStorage.getItem('tab_list'))
        if(list) {
            const index = list.find(i => i.active).index
            toTabbar(index)
        } else {
            toTabbar(0)
        }
    }
    initTabList()

    function saveTabList() {
        const new_tab_list = tab_list_all.value.filter(item => tab_list.value.some(i => i.index == item.index))
        localStorage.setItem('tab_list', JSON.stringify(new_tab_list))
    }

    //tabbar翻页
    function changeMenuList(num) {
        const active_tab_index = tab_list.value.find(item => item.active).index + num
        if(tab_list.value[0].index == tab_list_all.value[0].index) {
            if(active_tab_index >= tab_list.value[0].index && active_tab_index <= tab_list.value[tab_list.value.length - 1].index) {
                clickTabbar(active_tab_index)
            } else if(active_tab_index > tab_list.value[tab_list.value.length - 1].index) {
                const new_list = tab_list_all.value.slice(tab_list.value[0].index + 1, active_tab_index + 1)
                tab_list.value = JSON.parse(JSON.stringify(new_list))
                clickTabbar(active_tab_index)
            }
        } else if(tab_list.value[tab_list.value.length - 1].index == tab_list_all.value[tab_list_all.value.length - 1].index) {
            if(active_tab_index >= tab_list.value[0].index && active_tab_index <= tab_list.value[tab_list.value.length - 1].index) {
                clickTabbar(active_tab_index)
            } else if(active_tab_index < tab_list.value[0].index) {
                const new_list = tab_list_all.value.slice(active_tab_index, tab_list.value[tab_list.value.length - 1].index)
                tab_list.value = JSON.parse(JSON.stringify(new_list))
                clickTabbar(active_tab_index)
            }
        } else {
            if(active_tab_index >= tab_list.value[0].index && active_tab_index <= tab_list.value[tab_list.value.length - 1].index) {
                clickTabbar(active_tab_index)
            } else if(active_tab_index < tab_list.value[0].index) {
                const new_list = tab_list_all.value.slice(active_tab_index, tab_list.value[tab_list.value.length - 1].index)
                tab_list.value = JSON.parse(JSON.stringify(new_list))
                clickTabbar(active_tab_index)
            } else if(active_tab_index > tab_list.value[tab_list.value.length - 1].index) {
                const new_list = tab_list_all.value.slice(tab_list.value[0].index + 1, active_tab_index + 1)
                tab_list.value = JSON.parse(JSON.stringify(new_list))
                clickTabbar(active_tab_index)
            }
        }
    }
    
    //选中tabbar
    function clickTabbar(index) {
        const data = tab_list_all.value[index]
        if(data) {
            tab_list_all.value.forEach(item => {
                item.active = item.index == index
            })
            tab_list.value.forEach(item => {
                item.active = item.index == index
            })
            saveTabList()
            router.push(data.path || '/')
        } else {
            toTabbar(0)
        }
    }

    // 跳转tabbar
    function toTabbar(index) {
        const slice_index = tab_list_all.value.length - 14
        let new_list
        if(index >= slice_index) {
            new_list = tab_list_all.value.slice(slice_index)
        } else {
            new_list = tab_list_all.value.slice(index, index + 14)
        }
        tab_list.value = JSON.parse(JSON.stringify(new_list))
        clickTabbar(index)
    }

    return { tab_list, changeMenuList, clickTabbar, toTabbar }
})
