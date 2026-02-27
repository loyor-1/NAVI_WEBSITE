import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useCacheStore = defineStore('cache', () => {
    //用于：用户个人中心---个人信息页面订单列表（简易版）的按钮效果展示等问题
    const order_list_params = ref(null)
    const status_value = ref(null)
    function changeOrderListParams(data) {
        order_list_params.value = data ? data.params : null
        status_value.value = data ? data.status_value :null
    }

    return {
        order_list_params,
        status_value,
        changeOrderListParams,
    }
})