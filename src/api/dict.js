const dict = {
	// 订单管理-订单状态 待支付/待分配/待确认/待实验/实验中/待结算/已完成
    order_status: [
        { label: "待支付", value: 1 },
        { label: "待分配", value: 2 },
        { label: "待确认", value: 3 },
        { label: "待实验", value: 4 },
        { label: "实验中", value: 5 },
        { label: "待结算", value: 6 },
        { label: "已完成", value: 7 },
        { label: "已取消", value: 8 },
        { label: "申请开票", value: 9 },
        { label: "待审核", value: 10 },
        { label: "审核拒绝", value: 11 },
        { label: "待核对", value: 12 },
        { label: "沟通中", value: 13 },
    ],
    // 支付方式
    prepaid_payment: [
        { label: '个人预存', value: 1 },
        { label: '团队预存', value: 2 },
        { label: '支付宝', value: 3 },
        { label: '微信', value: 4 },
        { label: '个人信用', value: 5 },
        { label: '团队信用', value: 6 },
    ],
	//发票状态
	bill_status: [
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