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
export function changeRelevance(list, data, isGlobal) {
	console.log(data)
	let new_list = JSON.parse(JSON.stringify(list))
	const index_list = []
	new_list.forEach((item, index) => {
		if(item.isRelevance && item.relevanceField == data.fieIdId) {
			index_list.push(index)
		}
	})
	if(index_list.length) {
		index_list.forEach(i => {
			const relevance_list = new_list[i].relevanceOptionId ? new_list[i].relevanceOptionId.split(',') : []
			new_list[i].show = relevance_list.some(x => data.optionId.includes(Number(x)))
		})
	} else {

	}
	// new_list = getTotalMoney(new_list, isGlobal)
	return new_list
}

//计算总金额
/**
 * @param list {Array} 外部传入的列表
 * @param isGlobal {Boolean} 是否是全局问题
 * @return {object} 返回明细列表和总金额
 */
const getTotalMoney = (list_, isGlobal) => {
    //如果不是计算全局问题，就要将样品数量存到字段里面
    const list = JSON.parse(JSON.stringify(list_))
    if (!isGlobal) {
        list.map(item => {
            // specimenNum
            item.fieIdList.map(items => {
                items.specimenNum = item.specimenNum
            })
        })
    }
    //拿到需要计算价格的数据 字段隐藏状态为false 且 fieIdType为1，2,6,7,9,10,13,14的 其中fieIdType为6，7，9，14的需要isCalculatePrice为1时才需要进行计算
    let fieIdList = list.map(item =>
        item.fieIdList.filter(items =>
            !items.hide && [1, 2, 6, 7, 9, 10, 12, 13, 14].includes(items.fieIdType) &&
            (items.fieIdType !== 6 && items.fieIdType !== 7 && items.fieIdType !== 9 && items.fieIdType !== 14 || items.isCalculatePrice === 1) && items.calculateWay != 4
        )
    );
    // 为每个元素添加原始索引
	fieIdList.map((k, kIndex) => {
	    k.map((i, iIndex) => {
	        i.originalIndex = { kIndex, iIndex };
	    });
	});
    let totalList = []
        //处理金额相关的字段
    fieIdList.map(k => {
        let list = []
        k.map(i => {
            //元素周期表、整数、浮点数、范围、字段组情况、预约时长
            if (i.fieIdType == 10 || i.fieIdType == 6 || i.fieIdType == 7 || i.fieIdType == 9 || i.fieIdType == 12 || i.fieIdType == 14) {
                //如果 fieIdType类型为 整数、浮点、范围则计算总金额
                if (i.fieIdType == 6 || i.fieIdType == 7 || i.fieIdType == 14) {
                    if (i.fieIdValue) {
                        i.totalPrice = Number(i.fieIdValue) * Number(i.elementPrice)
                    } else {
                        i.totalPrice = 0
                    }
                }
                //范围需要先计算他的差值
                if (i.fieIdType == 9) {
                    if (i.fieldValueRange && i.fieldValueRange) {
                        let value = Number(i.fieldValueRange) - Number(i.fieIdValue)
                        if (value <= 0) {
                            i.totalPrice = 0
                        } else {
                            i.totalPrice = value * Number(i.elementPrice)
                        }
                    } else {
                        i.totalPrice = 0
                    }
                }
                list.push(i);
            }
            // 单选、多选情况/根据optionId选择的选项id找到对应选项
            if (i.optionId && Array.isArray(i.options)) {
                i.options.forEach(option => {
                    i.optionId.forEach(openid => {
                        if(option.optionId === openid){
                            if(option.unitPrice != 0 || option.isNegotiatedPrice == 1){
                                list.push({
                                    ...option,
                                    fieIdName: i.fieIdName,
                                    specimenNum: i.specimenNum,
                                    calculateWay: i.calculateWay,
                                    fieIdType: i.fieIdType,
                                    //议价字段在选项里面
                                    bargainReminder: option.bargainReminder,
                                    isNegotiatedPrice: option.isNegotiatedPrice
                                });
                            }
                            
                        }
                    })
                });
            }

        })
        totalList.push(list)
    });
    // 按照原始顺序重新排序 totalList
	totalList = totalList.map(list =>
		list.sort((a, b) => {
			if (a.originalIndex && b.originalIndex) {
				if (a.originalIndex.kIndex === b.originalIndex.kIndex) {
					return a.originalIndex.iIndex - b.originalIndex.iIndex;
				} else {
					return a.originalIndex.kIndex - b.originalIndex.kIndex;
				}
			}
		})
	);
    let bargainReminderList = []
    totalList.map(key => {
        key.maps = {}
        key.dest = []
        key.map(item => {
            //单选、多选金额
            if (item.fieIdType == 1 || item.fieIdType == 2) {
                // 根据价格计算方式处理字段(calculateWay)价格
                // 1 按样品数量 3 固定价格 4 不计算价格
                if (item.calculateWay == 1) {
                    item.totalPrice = Number(item.unitPrice) * Number(item.specimenNum);
                } else {
                    item.totalPrice = item.unitPrice
                }
                //议价
                if (item.isNegotiatedPrice == 1) {
                    bargainReminderList.push(item.bargainReminder)
                }
            }
            // 字段组 字段组都直接拿他的totalPrice 字段组可能存在议价的情况
            if (item.fieIdType == 12) {
                // 根据价格计算方式处理字段(calculateWay)价格
                // 1 按样品数量 3 固定价格 4 不计算价格
                if (item.calculateWay == 1) {
                    if (item.totalPrice) {
                        item.totalPrice = item.totalPrice * item.specimenNum
                    } else {
                        item.totalPrice = 0
                    }
                    if (item.isNegotiatedPrice == 1) {
                        bargainReminderList.push(item.bargainReminder)
                    }
                } else {
                    if (item.totalPrice) {
                        item.totalPrice = item.totalPrice
                    } else {
                        item.totalPrice = 0
                    }
                    if (item.isNegotiatedPrice == 1) {
                        bargainReminderList.push(item.bargainReminder)
                    }
                }
            }
            //整数、浮点、范围、字段组都直接拿他的totalPrice 字段组可能存在议价的情况
            if (item.fieIdType == 6 || item.fieIdType == 7 || item.fieIdType == 9 || item.fieIdType == 14) {
                if (item.totalPrice) {
                    item.totalPrice = item.totalPrice
                } else {
                    item.totalPrice = 0
                }
                // if(item.fieIdType == 12){
                // 	if(item.isNegotiatedPrice == 1){
                // 		bargainReminderList.push(item.bargainReminder)
                // 	}
                // }
            }
            //元素周期表
            //整数、浮点、范围、字段组都直接拿他的fieIdValue
            if (item.fieIdType == 10) {
                if (item.fieIdValue) {
                    let elementList = item.fieIdValue.split(',')
                    if (isGlobal) {
                        item.totalPrice = Number(item.elementPrice) * Number(elementList.length)
                    } else {
                        item.totalPrice = Number(item.elementPrice) * Number(elementList.length) * Number(item.specimenNum)
                    }
                    let startPrice = Number(item.elementPrice) * Number(elementList.length)
                    if (startPrice >= item.startPrice) {
                        item.unitPrice = item.totalPrice
                    } else {
                        item.unitPrice = item.startPrice * Number(item.specimenNum)
                        item.totalPrice = item.unitPrice
                    }
                    // item.unitPrice = item.totalPrice
                }
            }
            //字段多选时合并金额
            if (!key.maps[item.fieIdId]) {
                key.dest.push(item);
                key.maps[item.fieIdId] = item;
            } else {
                key.dest.map(j =>  {
                    if (item.fieIdId == j.fieIdId) {
                        j.unitPrice = Number(j.unitPrice) + Number(item.unitPrice);
                        j.totalPrice = Number(j.totalPrice) + Number(item.totalPrice);
                    }
                });
            }
        })
        //计算单个样品的总金额
        key.totalMomey = getTotalMoneys(key.dest, 'totalPrice')
        return {
            ...key,
            subChargeVOList: key.dest
        };
    })
    //计算所有样品的总金额
    let totalCost = getTotalMoneys(totalList, 'totalMomey')
    totalCost = mathjs.round(totalCost, 2)
    let result = {
        totalCost,
        totalList,
        bargainReminderList: bargainReminderList,
    }
    return result
}

//总金额计算
const getTotalMoneys = (list, value) => {
    return list.reduce((total, item) => {
        if (!isNaN(Number(item[value]))) {
            return total + item[value];
        } else {
            return total;
        }
    }, 0);
}