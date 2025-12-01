import { ElMessage } from "element-plus"

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

//初始化预约字段的显示与隐藏
export function initFieIdList(list) {
	const new_list = JSON.parse(JSON.stringify(list))
	//有关联id的初始化需要被隐藏
    new_list.forEach(item => {
		item.show = item.isRelevance ? false : true
		item.fieIdValue = ""
		switch(item.fieIdType) {
			case 5: 
			    item.fieIdValue = item.richTextDefault
				break
			case 9:
		        item.fieIdValue = 0
				item.fieldValueRange = 0
				break
			case 10:
				item.fieIdValue = item.needElement
				break
		}
    })
    return new_list
}

//动态改变字段的显示与隐藏
export function changeRelevance(list, selected) {
    let new_list = JSON.parse(JSON.stringify(list))
    const new_selected = JSON.parse(JSON.stringify(selected))
    // 映射用户选取的值
    const target_index = new_list.findIndex(item => item.fieIdId == new_selected.fieIdId)
    new_list[target_index].options = new_selected.options
    new_list[target_index].fieIdValue = new_selected.fieIdValue
    new_list[target_index].optionId = new_selected.optionId
    new_list[target_index].valueId = new_selected.valueId
    if(new_selected.fieIdType == 9) new_list[target_index].fieldValueRange = new_selected.fieldValueRange
    if(new_selected.fieIdType == 14) new_list[target_index].duration = new_selected.duration

    //处理链式变更的字段
    const queue = showFieId(new_list, new_selected)
    queue.forEach(item => {
        new_list[item.index].show = item.show
    })
    const hide_list = queue.filter(item => !item.show)
    hide_list.forEach(i => {
        new_list[i.index].fieIdValue = undefined
        new_list[i.index].optionId = undefined
        new_list[i.index].valueId = undefined
        if(new_selected.fieIdType == 9) new_list[target_index].fieldValueRange = undefined
        if(new_selected.fieIdType == 14) new_list[target_index].duration = undefined
    })
    hide_list.forEach(i => {
        new_list = changeRelevance(new_list, new_list[i.index])
    })
    return new_list
}
function showFieId(list, selected) {
    const new_list = JSON.parse(JSON.stringify(list))
    const result = []
    new_list.forEach((item, index) => {
        if(item.relevanceField == selected.fieIdId && item.isRelevance) {
            const option_list = item.relevanceOptionId ? item.relevanceOptionId.split(',') : []
            const value_list = selected.valueId ? selected.valueId.toString().split(',') : []
            result.push({
                index: index,
                show: option_list.some(i => value_list.includes(i)),
            })
        }
    })
    return result
}


//计算总金额
export function reduceTotalMoney(list, type) {
    //拿到需要计算价格的数据 =》 （字段隐显示状态为show == true） && （fieIdType 为 1，2,6,7,9,10,12,14）&& （fieIdType为6，7，9，14时，isCalculatePrice为1）&& (calculateWay 不为 4)
    const new_list = JSON.parse(JSON.stringify(list))
    const validTypes = [1, 2, 6, 7, 9, 10, 12, 14]// 允许的字段类型
    const calcPriceTypes = [6, 7, 9, 14]// 需要校验isCalculatePrice的类型

    if(type == 'global') {
        //筛选出参与计算的全局字段
        const global_reduce_list = new_list.globalFieldValues.filter(item => {
            if(item.show && validTypes.includes(item.fieIdType) && (!calcPriceTypes.includes(item.fieIdType) || item.isCalculatePrice === 1) && item.calculateWay != 4) return item
        })

        // 计算全局字段的价格
        const golbal_price = global_reduce_list.reduce((sum, item) => {
            let total = 0
            if([1].includes(item.fieIdType)) {
                // 【单选】全局字段的单选只有 固定价格/不计算价格 两种计价方式
                const select_option_data = item.options.find(i => i.optionId == item.valueId)
                total = Number(select_option_data.unitPrice)
            } else if([2].includes(item.fieIdType)) {
                // 【多选】全局字段的多选只有 固定价格/不计算价格 两种计价方式
                const value_list = item.valueId ? item.valueId.toString().split(',') : []
                const select_option_list = item.options.filter(i => value_list.includes(i.optionId.toString()))
                total = select_option_list.reduce((checkbox_sum, i) => {
                    return checkbox_sum + Number(i.unitPrice)
                }, 0)
            } else if([6, 7, 14].includes(item.fieIdType)) {
                //【整数】【浮点】【时间（机时）】直接计算 --- 值 X 单价
                if (item.fieIdValue) {
                    total = Number(item.fieIdValue) * Number(item.elementPrice)
                } else {
                    total = 0
                }
            } else if([9].includes(item.fieIdType)) {
                //【范围】需要先计算他的差值
                if (item.fieIdValue && item.fieldValueRange) {
                    const range_value = Number(item.fieldValueRange) - Number(item.fieIdValue)
                    if (range_value <= 0) {
                        total = 0
                    } else {
                        total = range_value * Number(item.elementPrice)
                    }
                } else {
                    total = 0
                }
            } else if([10].includes(item.fieIdType)) {
                //【元素周期表】
                if (item.fieIdValue) {
                    const element_list = item.fieIdValue.split(',')
                    total = (Number(item.elementPrice) * element_list.length >= Number(item.startPrice)) ? (Number(item.elementPrice) * element_list.length) : Number(item.startPrice)
                } else {
                    total = 0
                }
            } else if([12].includes(item.fieIdType)) {
                // 【字段组】
                total = Number(reduceFieldGroupsTotalMoney(item.fieldGroupValues, item.formulaDetailList, item.reservePointMethod))
            }

            return sum + total
        }, 0)

        return golbal_price
    } else if(type == 'groups') {
        //筛选出参与计算的【样品组】内部参与价格计算的字段
        const groups_reduce_list = new_list.groups.map(item => {
            const reduce_list = item.fieIdList.filter(i => {
                if(i.show && validTypes.includes(i.fieIdType) && (!calcPriceTypes.includes(i.fieIdType) || i.isCalculatePrice === 1) && i.calculateWay != 4) return i
            })
            return {
                specimenNum: item.specimenNum,
                reduce_list,
            }
        })

        // 计算【样品组】的价格
        const groups_price = groups_reduce_list.reduce((sum, item) => {
            const groups_total = item.reduce_list.reduce((s, i) => {
                let total = 0

                if([1].includes(i.fieIdType)) {
                    // 【单选】一般字段的单选有 1 按样品数量 3 固定价格 4 不计算价格 三种计价方式
                    const select_option_data = i.options.find(options_i => options_i.optionId == i.valueId)
                    if (i.calculateWay == 1) {
                        total = Number(select_option_data.unitPrice) * Number(item.specimenNum)
                    } else {
                        total = Number(select_option_data.unitPrice)
                    }
                } else if([2].includes(i.fieIdType)) {
                    // 【多选】一般字段的多选有 1 按样品数量 3 固定价格 4 不计算价格 三种计价方式
                    const value_list = i.valueId ? i.valueId.toString().split(',') : []
                    const select_option_list = i.options.filter(options_i => value_list.includes(options_i.optionId.toString()))
                    if (i.calculateWay == 1) {
                        total = select_option_list.reduce((checkbox_sum, checkbox_i) => {
                            return checkbox_sum + Number(checkbox_i.unitPrice) * Number(item.specimenNum)
                        }, 0)
                    } else {
                        total = select_option_list.reduce((checkbox_sum, checkbox_i) => {
                            return checkbox_sum + Number(checkbox_i.unitPrice)
                        }, 0)
                    }
                } else if([6, 7, 14].includes(i.fieIdType)) {
                    //【整数】【浮点】【时间（机时）】直接计算 --- 值 X 单价
                    if (i.fieIdValue) {
                        total = Number(i.fieIdValue) * Number(i.elementPrice)
                    } else {
                        total = 0
                    }
                } else if([9].includes(i.fieIdType)) {
                    //【范围】需要先计算他的差值
                    if (i.fieIdValue && i.fieldValueRange) {
                        const range_value = Number(i.fieldValueRange) - Number(i.fieIdValue)
                        if (range_value <= 0) {
                            total = 0
                        } else {
                            total = range_value * Number(i.elementPrice)
                        }
                    } else {
                        total = 0
                    }
                } else if([10].includes(i.fieIdType)) {
                    //【元素周期表】
                    if (i.fieIdValue) {
                        const element_list = i.fieIdValue.split(',')
                        total = (Number(i.elementPrice) * element_list.length >= Number(i.startPrice)) ? (Number(i.elementPrice) * element_list.length) : Number(i.startPrice)
                    } else {
                        total = 0
                    }
                } else if([12].includes(i.fieIdType)) {
                    // 【字段组】
                    total = Number(reduceFieldGroupsTotalMoney(i.fieldGroupValues, i.formulaDetailList, i.reservePointMethod))
                }

                return s + total
            }, 0)
            
            return sum + groups_total
        }, 0)

        return groups_price
    } else {
        ElMessage.error('计算价格出错，字段类型不为：【全局字段】【一般字段】【字段组】')
        throw new Error('计算价格出错')
    }
}
function reduceFieldGroupsTotalMoney(field_list, formula_list, reserve_point_method) {
    let formula = ''
    formula_list.forEach(item => {
        if(item.flag) {
            formula += item.fieIdName
        } else {
            const data = field_list.find(i => i.fieIdId == item.fieIdId)
            
            if(data.fieIdType == 1) {
                //单选类型取值为选项的单价
                const selected_radio = data.options.find( i => i.optionId == data.valueId )
                const radio_price = selected_radio.unitPrice || 0
                formula += radio_price
            } else if(data.fieIdType == 9) {
                //【范围】需要先计算他的差值
                if (data.fieIdValue && data.fieldValueRange) {
                    const range_value = Number(item.fieldValueRange) - Number(item.fieIdValue)
                    if (range_value <= 0) {
                        formula += 0
                    } else {
                        formula += range_value
                    }
                } else {
                    formula += 0
                }
            } else if(data.fieIdType == 14){
                //如果是日期则需要查询他是否参与计价
				if(data.isCalculatePrice == 0){
					if(data.fieIdValue && data.fieIdValue != undefined && data.fieIdValue != null){
						formula += data.fieIdValue
					}else{
						formula += 0
					}
				}else{
					if(data.fieIdValue && data.fieIdValue != undefined && data.fieIdValue != null && data.elementPrice){
						formula = `${data.value}*${data.elementPrice}+${formula}${data.value}`
					}else{
						formula += 0
					}
				}
			}else{
				if(data.fieIdValue && data.fieIdValue != undefined && data.fieIdValue != null){
					formula += data.fieIdValue
				}else{
					formula += 0
				}
			}
        }
    })

    const math = require('mathjs')
    const abs_regex = /\|([^|]+)\|/g // 使用正则表达式找到所有绝对值部分
    let match;
    let processed_expression = JSON.parse(JSON.stringify(formula))
	// 遍历所有匹配的绝对值表达式
	while ((match = abs_regex.exec(formula)) !== null) {
        const abs_expression = match[1]; // 绝对值内部的表达式
        // 计算绝对值内部表达式
        const inner_result = math.evaluate(abs_expression)
        // 计算绝对值
        const abs_result = Math.abs(inner_result)
        // 替换原表达式中的绝对值部分
        processed_expression = processed_expression.replace(`|${abs_expression}|`, abs_result.toString())
    }
	// 计算最终结果
    let result = math.evaluate(processed_expression)
    //reservePointMethod 1 保留两位 2向上取整
	if(reserve_point_method == 1){
		result = math.format(result, { notation: 'fixed', precision: 2 });
	} else {
		result = math.ceil(result);
	}
    return result
}

// if([1].includes(item.fieIdType)) {
//     // 【单选】根据价格计算方式处理字段(calculateWay)价格  1 按样品数量 3 固定价格 4 不计算价格
//     if (item.calculateWay == 1) {
//         total = Number(item.unitPrice) * Number(item.specimenNum);
//     } else {
//         total = Number(item.unitPrice)
//     }
// } else if([2].includes(item.fieIdType)) {
//     // 【多选】根据价格计算方式处理字段(calculateWay)价格  1 按样品数量 3 固定价格 4 不计算价格
//     const value_list = item.valueId ? item.valueId.toString().split(',') : []
//     const select_option_list = item.options.filter(i => value_list.includes(i.optionId.toString()))
//     if (item.calculateWay == 1) {
//         total = select_option_list.reduce((checkbox_sum, i) => {
//             return checkbox_sum + Number(i.unitPrice) * Number(i.specimenNum)
//         }, 0)
//     } else {
//         total = select_option_list.reduce((checkbox_sum, i) => {
//             return checkbox_sum + Number(i.unitPrice)
//         }, 0)
//     }
// }