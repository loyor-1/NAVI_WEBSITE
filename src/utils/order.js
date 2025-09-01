export function moneyKey(data) {
	const total_cost = [1, 2, 3, 4, 5, 8, 10, 11]
	const experiment_total_cost = [7, 9, 12]
	if(total_cost.includes(data.status)) return 'totalCost'
	if(experiment_total_cost.includes(data.status)) return 'experimentTotalCost'
}

export function orderStatus(data) {
	let status_string = ''
	switch(data.status) {
		case 1:
		    status_string = '待支付'
			if(data.bargainStatus == 1) {
				status_string = '待议价'
			}
			break
		case 2:
		case 3:
		    if(data.postMethod == 2) {
				if(data.sendSampleFlag == 1) {
					status_string = '已取样'
				}else {
					status_string = '待取样'
				}
			} else {
				if(data.packageTransportDocument) {
					status_string = '已寄样'
				}else {
					status_string = '待寄样'
				}
			}
		    break
		case 4:
		    status_string = '待实验'
		    break
		case 5:
		    status_string = '实验中'
		    break
		case 7:
		    status_string = '已完成'
		    if(data.afterSalesStatus == 1) {
				status_string = '售后'
			}
			if(data.recycleStatus == 2) {
				status_string = '回运'
			}
		    break  
		case 8:
		    status_string = '已取消'
		    break
		case 9:
		    status_string = '申请开票'
		    break
		case 10:
		    status_string = '待审核'
		    break
		case 11:
		    status_string = '审核拒绝'
		    break
		case 12:
		    status_string = '待核对'
		    break
	}
	return status_string
}