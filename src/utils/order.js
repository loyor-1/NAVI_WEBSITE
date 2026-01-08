import { ElMessage } from "element-plus"
import * as math from 'mathjs'

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
        item.validate = true
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
            if(item.show && validTypes.includes(item.fieIdType) && (!calcPriceTypes.includes(item.fieIdType) || item.isCalculatePrice == 1) && item.calculateWay != 4) return item
        })
        // 全局字段的价格明细列表
        const global_fee_detail = [
            {
                sample_name: '全局问题',
                price: '',
                detail_list: [
                    // { label: '', value: '' }
                ],
            }
        ]
        let global_bargain_status = false

        // 计算全局字段的价格
        const golbal_price = global_reduce_list.reduce((sum, item) => {
            let total = 0
            if([1].includes(item.fieIdType)) {
                // 【单选】全局字段的单选只有 固定价格/不计算价格 两种计价方式
                const select_option_data = item.options.find(i => i.optionId == item.valueId)
                // isNegotiatedPrice == 1 时为待议价
                if(select_option_data && select_option_data.isNegotiatedPrice == 1) {
                    global_bargain_status = true
                    total = '待议价'
                } else {
                    total = Number(select_option_data ? select_option_data.unitPrice : 0)
                }
            } else if([2].includes(item.fieIdType)) {
                // 【多选】全局字段的多选只有 固定价格/不计算价格 两种计价方式
                const value_list = item.valueId ? item.valueId.toString().split(',') : []
                const select_option_list = item.options.filter(i => value_list.includes(i.optionId.toString()))
                // 当多选的选项中存在某一个选项 isNegotiatedPrice == 1 时为待议价
                if(select_option_list.some(i => i.isNegotiatedPrice == 1)) {
                    global_bargain_status = true
                    total = '待议价'
                } else {
                    total = select_option_list.reduce((checkbox_sum, i) => {
                        return checkbox_sum + Number(i.unitPrice)
                    }, 0)
                }
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
                if(item.fieldGroupValues && item.formulaDetailList && item.reservePointMethod) {
                    const field_groups_result = reduceFieldGroupsTotalMoney(item.fieldGroupValues, item.formulaDetailList, item.reservePointMethod)
                    total = field_groups_result.field_groups_bargain_status ? '待议价' : Number(field_groups_result.field_groups_price) * Number(item.elementPrice)
                } else {
                    total = 0
                }
            }

            //只有存在大于0的价格才显示费用详情
            if(total > 0 || total == '待议价') {
                let label = ''
                if(item.fieIdType != 12) {
                    label = item.fieIdName
                } else {
                    const text = item.formulaDetailList.filter(formula_i => formula_i.fieIdType && formula_i.fieIdType != 13).map(formula_i => formula_i.fieIdName).join('、')
                    label = `${item.fieIdName}(${text})`
                }
                global_fee_detail[0].detail_list.push({
                    label,
                    value: total == '待议价' ? '待议价' : `￥${total.toFixed(2)}`,
                })
            }

            // 重置total，如果为‘待议价’，就赋值为0
            total = total == '待议价' ? 0 : total
            return sum + total
        }, 0)

        //只有全局字段总金额大于0才显示总金额
        if(golbal_price > 0) {
            global_fee_detail[0].price = `￥${golbal_price.toFixed(2)}`
        }

        return {
            bargain_status: global_bargain_status,
            total_cost: golbal_price.toFixed(2),
            fee_detail: global_fee_detail,
        }
    } else if(type == 'groups') {
        //筛选出参与计算的【样品组】内部参与价格计算的字段
        const groups_reduce_list = new_list.groups.map(item => {
            const reduce_list = item.fieIdList.filter(i => {
                if(i.show && validTypes.includes(i.fieIdType) && (!calcPriceTypes.includes(i.fieIdType) || i.isCalculatePrice == 1) && i.calculateWay != 4) return i
            })
            return {
                sample_name: `${item.sampleName}组样品`,
                specimen_num: item.specimenNum,
                reduce_list,
            }
        })
        // 样品组的价格明细列表
        const groups_fee_detail = [
            // {
            //     sample_name: 'A组样品',
            //     price: '',
            //     detail_list: [
            //         { label: '', value: '' }
            //     ],
            // }
        ]
        let groups_bargain_status = false

        // 计算【样品组】的价格
        const groups_price = groups_reduce_list.reduce((sum, item) => {
            const groups_detail_list = []
            const groups_total = item.reduce_list.reduce((s, i) => {
                let total = 0

                if([1].includes(i.fieIdType)) {
                    // 【单选】一般字段的单选有 1 按样品数量 3 固定价格 4 不计算价格 三种计价方式
                    const select_option_data = i.options.find(options_i => options_i.optionId == i.valueId)
                    // isNegotiatedPrice == 1 时为待议价
                    if(select_option_data && select_option_data.isNegotiatedPrice == 1) {
                        groups_bargain_status = true
                        total = '待议价'
                    } else {
                        if (i.calculateWay == 1) {
                            total = select_option_data ? Number(select_option_data.unitPrice) * Number(item.specimen_num) : 0
                        } else {
                            total = select_option_data ? Number(select_option_data.unitPrice) : 0
                        }
                    }
                } else if([2].includes(i.fieIdType)) {
                    // 【多选】一般字段的多选有 1 按样品数量 3 固定价格 4 不计算价格 三种计价方式
                    const value_list = i.valueId ? i.valueId.toString().split(',') : []
                    const select_option_list = i.options.filter(options_i => value_list.includes(options_i.optionId.toString()))
                    // 当多选的选项中存在某一个选项 isNegotiatedPrice == 1 时为待议价
                    if(select_option_list.some(options_i => options_i.isNegotiatedPrice == 1)) {
                        groups_bargain_status = true
                        total = '待议价'
                    } else {
                        if (i.calculateWay == 1) {
                            total = select_option_list.reduce((checkbox_sum, checkbox_i) => {
                                return checkbox_sum + Number(checkbox_i.unitPrice) * Number(item.specimen_num)
                            }, 0)
                        } else {
                            total = select_option_list.reduce((checkbox_sum, checkbox_i) => {
                                return checkbox_sum + Number(checkbox_i.unitPrice)
                            }, 0)
                        }
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
                    if(i.fieldGroupValues && i.formulaDetailList && i.reservePointMethod) {
                        const field_groups_result = reduceFieldGroupsTotalMoney(i.fieldGroupValues, i.formulaDetailList, i.reservePointMethod)
                        total = field_groups_result.field_groups_bargain_status ? '待议价' : Number(field_groups_result.field_groups_price) * Number(i.elementPrice)
                    } else {
                        total = 0
                    }
                }

                //只有存在大于0的价格才显示费用详情
                if(total > 0 || total == '待议价') {
                    let label = ''
                    if(i.fieIdType != 12) {
                        label = i.fieIdName
                    } else {
                        const text = i.formulaDetailList.filter(formula_i => formula_i.fieIdType && formula_i.fieIdType != 13).map(formula_i => formula_i.fieIdName).join('、')
                        label = `${i.fieIdName}(${text})`
                    }
                    groups_detail_list.push({
                        label,
                        value: total == '待议价' ? '待议价' : `￥${total.toFixed(2)}`,
                    })
                }

                // 重置total，如果为‘待议价’，就赋值为0
                total = total == '待议价' ? 0 : total
                return s + total
            }, 0)

            groups_fee_detail.push({
                sample_name: item.sample_name,
                price: groups_total ? `￥${groups_total.toFixed(2)}` : '',
                detail_list: groups_detail_list,
            })
            return sum + groups_total
        }, 0)

        return {
            bargain_status: groups_bargain_status,
            total_cost: groups_price.toFixed(2),
            fee_detail: groups_fee_detail,
        }
    } else {
        ElMessage.error('计算价格出错，字段类型不为：【全局字段】【一般字段】【字段组】')
        throw new Error('计算价格出错')
    }
}
function reduceFieldGroupsTotalMoney(field_list, formula_list, reserve_point_method) {
    let formula = ''
    let bargain_status = false
    formula_list.forEach(item => {
        if(item.flag) {
            formula += item.fieIdName
        } else {
            const data = field_list.find(i => i.fieIdId == item.fieIdId)

            if(data.fieIdType == 1) {
                //单选类型取值为选项的单价
                const selected_radio = data.options.find( i => i.optionId == data.valueId )
                if(selected_radio && selected_radio.isNegotiatedPrice == 1) {
                    bargain_status = true
                    formula += 0
                } else {
                    const radio_price = selected_radio.unitPrice || 0
                    formula += radio_price
                }
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

    if(!bargain_status) {
        // 使用正则表达式找到所有绝对值部分
		const abs_regex = /\|([^|]+)\|/g 
		const abs_matches = []
		let match
		// 重置 lastIndex 确保从头匹配
		abs_regex.lastIndex = 0
		while ((match = abs_regex.exec(formula)) !== null) {
		    abs_matches.push({
		        fullMatch: match[0],    // 完整的绝对值片段（如 |0|）
		        innerExpr: match[1],    // 绝对值内部表达式（如 0）
		        start: match.index,     // 匹配起始位置
		        end: match.index + match[0].length // 匹配结束位置
		    })
		}
		abs_matches.reverse().forEach(item => {
		    // 计算绝对值内部表达式
		    const inner_result = math.evaluate(item.innerExpr)
		    // 计算绝对值
		    const abs_result = math.abs(inner_result)
		    // 精准替换：按位置截取字符串（避免全局替换）
		    formula = formula.substring(0, item.start) + abs_result + formula.substring(item.end)
		})

		// 若最终是空字符串，设为 "0"（避免 evaluate 解析空值）
		if (!formula) formula = '0'
		// 5. 用 try/catch 包裹 evaluate，避免解析失败崩溃
		let result = 0
		try {
		  result = math.evaluate(formula)
		  // 处理 NaN 或 Infinity
		  if (isNaN(result) || result === Infinity) result = 0
		} catch (err) {
		  console.error('表达式解析失败！', '错误信息：', err, '非法表达式：', formula)
		  result = 0
		}
		//reservePointMethod 1 保留两位 2向上取整
		if(reserve_point_method == 1){
			result = math.format(result, { notation: 'fixed', precision: 2 })
		}else{
			result = math.ceil(result)
		}
        return {
            field_groups_price: (result !== NaN && result !== undefined && result !== 'Infinity') ? result : 0,
            field_groups_bargain_status: false,
        }
    } else {
        return {
            field_groups_price: 0,
            field_groups_bargain_status: true,
        }
    }
}

//校验必填选项
export function validateField(list) {
    const new_list = JSON.parse(JSON.stringify(list))
    const global_list = new_list.globalFieldValues.filter(item => item.show && item.isRequired)
    const groups_list = new_list.groups.map(item => {
        const fieId_list = item.fieIdList.filter(i => i.show && i.isRequired)
        return {
            sample_name: item.sampleName,
            specimen_num: item.specimenNum,
            specimenNum_validate: true,
            specimen_code_list: item.specimen_code_list,
            specimen_code_validate: true,
            specimen_ingredient: item.specimenIngredient,
            specimenIngredient_validate: true,
            fieId_list: fieId_list,
        }
    })
    let message = ''

    let global_valid = true
    global_list.forEach(item => {
        if([11, 13].includes(item.fieIdType)) {
            item.validate = true
        } else if(item.fieIdType == 12 && item.fieldGroupValues){
            item.fieldGroupValues.forEach(i => {
                if(i.isRequired != 1 || [2, 10, 11, 12, 13].includes(i.fieIdType)) {
                    i.validate = true
                } else {
                    const boolean_number = [6].includes(i.fieIdType) && (i.fieIdValue == undefined || i.fieIdValue == null)
                    const boolean_range = [9].includes(i.fieIdType) && (i.fieIdValue == undefined || i.fieIdValue == null || i.fieldValueRange == undefined || i.fieldValueRange == null || (i.fieIdValue == i.fieldValueRange))
                    const boolean_other = ![6, 9].includes(i.fieIdType) && !i.fieIdValue
                    if(boolean_number || boolean_range || boolean_other) {
                        global_valid = false
                        message = message ? message : `【全局字段】 ${i.fieIdName} 填写不规范`
                    }
                    i.validate = !(boolean_number || boolean_range || boolean_other)
                }
            })
        } else if(item.isRequired == 1 && item.fieIdType != 12){
            const boolean_number = [6].includes(item.fieIdType) && (item.fieIdValue == undefined || item.fieIdValue == null)
            const boolean_range = [9].includes(item.fieIdType) && (item.fieIdValue == undefined || item.fieIdValue == null || item.fieldValueRange == undefined || item.fieldValueRange == null || (item.fieIdValue == item.fieldValueRange))
            const boolean_other = ![6, 9].includes(item.fieIdType) && !item.fieIdValue
            if(boolean_number || boolean_range || boolean_other) {
                global_valid = false
                message = message ? message : `【全局字段】 ${item.fieIdName} 填写不规范`
            }
            item.validate = !(boolean_number || boolean_range || boolean_other)
        }
    })

    let groups_valid = true
    groups_list.forEach(item => {
        if(!item.specimen_num) {
            item.specimenNum_validate = false
            groups_valid = false
            message = message ? message : `【${item.sample_name}组样品】未填写 样品数量`

        }
        if(!item.specimen_code_list || !item.specimen_code_list.length || item.specimen_code_list.some(i => Boolean(i.value) == false)) {
            item.specimen_code_validate = false
            groups_valid = false
            message = message ? message : `【${item.sample_name}组样品】未填写 样品编号`
        }
        if(!item.specimen_ingredient) {
            item.specimenIngredient_validate = false
            groups_valid = false
            message = message ? message : `【${item.sample_name}组样品】未填写 样品成分`
        }
        item.fieId_list.forEach(list_i => {
            if([11, 13].includes(list_i.fieIdType)) {
                list_i.validate = true
            } else if(list_i.fieIdType == 12 && list_i.fieldGroupValues){
                list_i.fieldGroupValues.forEach(field_group_i => {
                    if(field_group_i.isRequired != 1 || [2, 10, 11, 12, 13].includes(field_group_i.fieIdType)) {
                        field_group_i.validate = true
                    } else {
                        const boolean_number = [6].includes(field_group_i.fieIdType) && (field_group_i.fieIdValue == undefined || field_group_i.fieIdValue == null)
                        const boolean_range = [9].includes(field_group_i.fieIdType) && (field_group_i.fieIdValue == undefined || field_group_i.fieIdValue == null || field_group_i.fieldValueRange == undefined || field_group_i.fieldValueRange == null || (field_group_i.fieIdValue == field_group_i.fieldValueRange))
                        const boolean_other = ![6, 9].includes(field_group_i.fieIdType) && !field_group_i.fieIdValue
                        if(boolean_number || boolean_range || boolean_other) {
                            groups_valid = false
                            message = message ? message : `【${item.sample_name}组样品】 ${field_group_i.fieIdName} 填写不规范`
                        }
                        field_group_i.validate = !(boolean_number || boolean_range || boolean_other)
                    }
                })
            } else if(list_i.isRequired == 1 && list_i.fieIdType != 12){
                const boolean_number = [6].includes(list_i.fieIdType) && (list_i.fieIdValue == undefined || list_i.fieIdValue == null)
                const boolean_range = [9].includes(list_i.fieIdType) && (list_i.fieIdValue == undefined || list_i.fieIdValue == null || list_i.fieldValueRange == undefined || list_i.fieldValueRange == null || (list_i.fieIdValue == list_i.fieldValueRange))
                const boolean_other = ![6, 9].includes(list_i.fieIdType) && !list_i.fieIdValue
                if(boolean_number || boolean_range || boolean_other) {
                    groups_valid = false
                    message = message ? message : `【${item.sample_name}组样品】 ${list_i.fieIdName} 填写不规范`
                }
                list_i.validate = !(boolean_number || boolean_range || boolean_other)
            }
        })
    })

    return {
        validate: groups_valid && groups_valid,
        message: message,
        global_result: global_list,
        groups_result: groups_list,
    }
}
