const dict = {
	// 订单管理-订单状态 待支付/待分配/待确认/待实验/实验中/待结算/已完成
    order_status: [
        { dictValue: 1, dictLabel: "待支付" },
        { dictValue: 2, dictLabel: "待分配" },
        { dictValue: 3, dictLabel: "待确认" },
        { dictValue: 4, dictLabel: "待实验" },
        { dictValue: 5, dictLabel: "实验中" },
        { dictValue: 6, dictLabel: "待结算" },
        { dictValue: 7, dictLabel: "已完成" },
        { dictValue: 8, dictLabel: "已取消" },
        { dictValue: 9, dictLabel: "申请开票" },
        { dictValue: 10, dictLabel: "待审核" },
        { dictValue: 11, dictLabel: "审核拒绝" },
        { dictValue: 12, dictLabel: "待核对" },
        { dictValue: 13, dictLabel: "沟通中" },
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