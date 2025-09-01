const dict = {
    // 支付方式
    prepaidPayment: [
        { label: '个人预存', value: 1 },
        { label: '团队预存', value: 2 },
        { label: '支付宝', value: 3 },
        { label: '微信', value: 4 },
        { label: '个人信用', value: 5 },
        { label: '团队信用', value: 6 },
    ],
	//发票状态
	billStatus: [
		{ label: '未开票', value: 1 },
		{ label: '已开票', value: 2 },
		{ label: '无需开票', value: 3 },
	]
}

export function getDictLabel(dict_key, dict_value) {
	if(!dict_value && dict_value != 0) {
		return '--'
	} else {
		const dict_data = dict[dict_key]
		const value = dict_data.find(item => item.value == dict_value)
		if(value) {
			return value.label
		} else {
			return '--'
		}
	}
}