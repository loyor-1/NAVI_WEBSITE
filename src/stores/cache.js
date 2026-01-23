import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCacheStore = defineStore('cache', () => {
    const order_list_params = ref(null)
    const status_value = ref(null)
    function changeOrderListParams(data) {
        console.log('store', data)
        order_list_params.value = data ? data.params : null
        status_value.value = data ? data.status_value :null
    }

    return {
        order_list_params,
        status_value,
        changeOrderListParams,
    }
})