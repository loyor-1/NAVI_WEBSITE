import service from '@/utils/request';

//获取七牛云下载链接
export function useGetDownLoadUrl(params) {
    return service({
        url: '/equipment/uploadCenter/getDownLoadUrl',
        method: 'get',
        params,
    })
}

// 根据字典类型查询字典数据信息
export function useGetDicts(dictType) {
    return service({
        url: '/system/dict/data/type/' + dictType,
        method: 'get'
    })
}

// 客服二维码
export function useGetCustomerServiceQrcode() {
    return service({
        method: 'get',
        url: '/system/dict/data/type/customer_service_qrcode',
    })
}

//首页轮播图
export function useGetCarouselList(params) {
    return service({
        method: 'get',
        url: '/system/carousel/list',
        params,
    })
}

//获取主页活动弹窗图片
export function useGetActives(categoryId) {
    return service({
        method: 'get',
        url: `/coupon/activity/config/category/${categoryId}`,
    })
}

//客户登录
export function useLogin(data) {
    return service({
        method: 'post',
        url: '/auth/newloginorgister',
        data
    });
}

//获取登录二维码
export function useGetLoginQRCode(params) {
    return service({
        method: 'get',
        url: '/system/wx/getPPQRcode',
        params,
    });
}

//获取二维码扫码状态
export function useGetLoginStatus(params) {
    return service({
        method: 'get',
        url: '/system/wx/getLoginStatus',
        params,
        no_debounce: true,
    });
}

//扫码登录后获取token
export function useQRCodeLogin(params) {
    return service({
        method: 'get',
        url: '/auth/getWebLoginInfo',
        params,
    });
}

//用户信息---id查询
export function useGetUserInfoById(id) {
    return service({
        method: 'get',
        url: '/system/client/' + id,
    });
}

// 用户信息---token获取
export function useGetUserInfoByToken() {
    return service({
        method: 'get',
        url: '/system/client/getInfo',
    });
}

// 团队信息
export function useGetTeamInfo(team_id) {
    return service({
        method: 'get',
        url: '/system/team/' + team_id,
        no_debounce: true,
    });
}

//客户退出登录
export function useLogout() {
    return service({
        method: 'Delete',
        url: '/auth/phoneLogout',
    });
}

//热门设备列表
export function useGetHotList(params) {
    return service({
        method: 'get',
        url: '/equipment/equipmentInfo/hotItemList',
        params,
    });
}

//个人/团队优惠券列表
export function useGetCoupon(params) {
    return service({
        method: 'get',
        url: '/coupon/couponClient/list',
        params,
    });
}

//我的资产相关金额
export function useGetMyAssets(id) {
    return service({
        method: 'get',
        url: '/system/client/myAssets/' + id,
    });
}

//订单列表
export function useGetOrderList(params) {
    return service({
        url: '/equipment/order/memberOrderList',
        method: 'get',
        params,
        no_debounce: true,
    })
}

//订单详情
export function useGetOrderInfo(id) {
    return service({
        url: '/equipment/order/' + id,
        method: 'get'
    })
}

// 设备详情
export function useGetEquipmentInfo(id) {
    return service({
        method: 'get',
        url: '/equipment/equipmentInfo/' + id,
    });
}

//设备字段查询
export function useGetFieIdList(params) {
    return service({
        method: 'get',
        url: '/equipment/equipmentSubscribeFieId/listAll',
        params,
        no_debounce: true,
    });
}

//查询字段组详情
export function useGetFieldGroupList(id) {
    return service({
        url: '/equipment/fieldGroup/' + id,
        method: 'get',
        no_debounce: true,
    })
}

//获取文件夹UUID
export function useGetFileUUID() {
    return service({
        url: '/file/uuid',
        method: 'get',
        no_debounce: true,
    })
}

//文件合并
export function useBlockUploadSuccess(params) {
    return service({
        url: '/file/blockUploadSuccess',
        method: 'get',
        params,
    })
}

//发票抬头列表---全部
export function useGetInvoiceHeadList(params) {
    return service({
        url: '/equipment/invoiceHeadContrast/list',
        method: 'get',
        params,
    })
}

//查询抬头列表---个人
export function useGetUserInvoiceHeadList(params) {
    return service({
        url: '/equipment/invoiceHead/list',
        method: 'get',
        params
    })
}

//检测项目下拉
export function useGetTestItemList(params) {
    return service({
        url: '/equipment/equipmentDetectionItem/listAll',
        method: 'get',
        params,
    })
}

//申请开票
export function useApplyInvoice(data) {
    return service({
        url: '/equipment/invoiceInformation/applyInvoice',
        method: 'post',
        data
    })
}

//个人预存记录
export function useGetPrestoreRecord(params) {
    return service({
        url: '/equipment/prestoreRecord/personalList',
        method: 'get',
        params,
    })
}

//查询用户个人抬头列表
export function useGetInvoiceTitleList(params) {
    return service({
        url: '/equipment/invoiceHead/list',
        method: 'get',
        params
    })
}

//设置默认抬头
export function useSetDefault(data) {
    return service({
        url: '/equipment/invoiceHead/setDefault',
        method: 'post',
        data,
    })
}

//删除抬头
export function useDeleteInvoiceHead(id) {
    return service({
        url: '/equipment/invoiceHead/' + id,
        method: 'delete'
    })
}

//开票信息编辑---保存
export function useSaveInvoiceHead(data) {
    return service({
        url: '/equipment/invoiceHead/saveInvoiceHead',
        method: 'post',
        data,
    })
}

//发票抬头列表---后台全部发票抬头
export function useGetInvoiceHeadContrastList(params) {
    return service({
        url: '/equipment/invoiceHeadContrast/list',
        method: 'get',
        params,
    })
}

//我的发票
export function useGetInvoiceList(params) {
    return service({
        url: '/equipment/invoiceInformation/list',
        method: 'get',
        params,
    })
}

//查询发票的文件列表
export function useGetInvoiceFile(id) {
    return service({
        url: '/equipment/invoiceInformation/getInvoiceFile/' + id,
        method: 'get'
    })
}

//删除发票
export function useDeleteInvoice(id) {
    return service({
        url: '/equipment/invoiceInformation/' + id,
        method: 'delete',
    })
}

//上传打款凭证
export function useUploadPaymentVoucher(data) {
    return service({
        url: '/equipment/invoiceInformation/uploadPaymentVoucher',
        method: 'put',
        data,
    })
}

//发票详情
export function useGetInvoiceInfo(id) {
    return service({
        url: '/equipment/invoiceInformation/' + id,
        method: 'get'
    })
}

//查询开票日志
export function getInvoiceApplyLogList(id) {
    return service({
        url: '/equipment/invoiceApplyLog/list/' + id,
        method: 'get'
    })
}

//查询开票日志
export function useGetInvoiceApplyLogList(id) {
    return service({
        url: '/equipment/invoiceApplyLog/list/' + id,
        method: 'get'
    })
}

// 个人/团队还款
export function useOrderRepayment(data) {
    return service({
        method: 'post',
        url: '/system/team/financialCenter/repayment',
        data,
    });
}

// 获取设备列表
export function useGetEquipmentList(params) {
    return service({
        method: 'get',
        url: '/equipment/equipmentInfo/list',
        params,
    });
}

//实验结果发送邮箱
export function useEmailSend(params) {
    return service({
        url: '/equipment/uploadCenter/qqMailSend',
        method: 'post',
        params,
    })
}

//下载对账单
export function useExportInvoiceResult(params) {
    return service({
        url: '/equipment/order/exportStandingBook',
        method: 'get',
        params,
    })
}

//根据客户id查询订单
export function useGetUserOrderList(params) {
    return service({
        url: '/equipment/order/clientOrderList',
        method: 'get',
        params,
    })
}

//区域列表
export function useGetUnitList(params) {
    return service({
        url: '/system/unit/list',
        method: 'get',
        params,
    })
}

//查询用户其他信息
export function useGetUserOtherInfo(id) {
    return service({
        url: '/system/clientInfo/' + id,
        method: 'get'
    })
}

//预约下单
export function useAddOrder(data) {
    return service({
        method: 'post',
        url: '/equipment/equipmentSubscribe/add',
        data,
    });
}

//支付宝支付下单
export function ZFBPreorderAction(data) {
    return service({
        url: '/equipment/alipay/prePay',
        method: 'post',
        data,
    })
}

//支付宝支付订单查询
export function queryAliOrderByOutTradeNo(params) {
    return service({
        url: '/equipment/alipay/queryOrderByOutTradeNo',
        method: 'get',
        params,
    })
}

//pc端生成微信支付二维码
export function createWXOrder(data) {
    return service({
        url: '/equipment/weChatNativePay/createOrder',
        method: 'post',
        data,
    })
}

//微信根据订单号查询订单支付状态
export function queryOrderByOutTradeNo(params) {
    return service({
        url: '/equipment/weChatNativePay/queryOrderByCode',
        method: 'get',
        params,
    })
}

//确认结果
export function useFinishOrder(data) {
    return service({
        url: '/equipment/order/finishOrder',
        method: 'put',
        data,
    })
}

// 微信支付（补差价）
export function useMakeUpMoneyWx(data) {
    return service({
        url: '/equipment/weChatNativePay/makeUpMoneyPC',
        method: 'post',
        data,
    })
}

// 支付宝支付（补差价）
export function useMakeUpMoneyAli(data) {
    return service({
        url: '/equipment/alipay/makeUpMoney',
        method: 'post',
        data: data
    })
}

// 确认结果补钱之后更新订单状态（补差价支付后调用）
export function useEditOrderMoney(data) {
    return service({
        url: '/equipment/order/editOrderMoney',
        method: 'put',
        data,
    })
}

//订单评价

export function useEvaluation(data) {
    return service({
        url: '/equipment/order/orderEvaluation',
        method: 'put',
        data,
    })
}

//微信根据预约id关闭订单
export function closeByWxOutTradeNo(params) {
    return service({
        url: '/equipment/weChatNativePay/closeByOutTradeNo',
        method: 'get',
        params,
    })
}

//省市-学院接口
export function useGetSchoolList(params) {
    return service({
        url: 'system/school/list',
        method: 'get',
        params,
    })
}

//客户编辑个人信息
export function useUpdateUserInfo(data) {
    return service({
        method: 'put',
        url: '/system/client',
        data,
    });
}

//客户身份认证
export function useApplyCert(data) {
    return service({
        url: '/system/clientCertApply',
        method: 'post',
        data,
    })
}

//获取客户认证记录
export function useGetApplyCertLog(id) {
    return service({
        url: '/system/clientCertApply/' + id,
        method: 'get'
    })
}

//修改手机号---验证码
export function useGetPhoneSMSCode(params) {
    return service({
        method: 'get',
        url: '/system/client/send',
        params,
    });
}

//修改登录密码---验证码
export function useGetPasswordSMSCode(params) {
    return service({
        url: '/system/client/sendPwdCode',
        method: 'get',
        params,
    })
}

//更改手机号
export function useUpdatePhone(params) {
    return service({
        method: 'get',
        url: '/system/client/updatePhone',
        params,
    });
}

//设置/修改密码
export function useSetPassword(data) {
    return service({
        url: '/system/client/setPwdOrEdit',
        method: 'post',
        data,
    })
}

//上传包裹
export function useUploadPackage(data) {
    return service({
        url: '/equipment/order/uploadPackage',
        method: 'put',
        data,
    })
}

//取消订单
export function useCancelOrder(data) {
    return service({
        url: '/equipment/order/cancelOrder',
        method: 'put',
        data
    })
}

//申请售后
export function useAfterSale(data) {
    return service({
        url: '/equipment/order/clientSubmitAfterSafes',
        method: 'post',
        data
    })
}

//再来一单
export function useAgainOrder(id) {
    return service({
        method: 'get',
        url: `/equipment/order/againOrder/${id}`,
    });
}

//查看订单发票
export function useGetOrderInvoice(params) {
    return service({
        url: '/equipment/invoiceInformation/getOrderInvoiceInfo',
        method: 'get',
        params
    })
}

//获取邀请好友小程序码
export function useInviteFriends(params) {
    return service({
        method: 'get',
        url: '/system/wx/inviteFriends',
        params,
    });
}

//下载海报
export function useDownloadPoster(params) {
    return service({
        url: '/system/wx/inviteFriendsPoster',
        method: 'get',
        params,
    })
}

// 邀请好友首页接口
export function useGetInviteFriendsInfo() {
    return service({
        url: '/coupon/activity/commission/board'
    })
}

// 邀请人数列表页
export function useGetInviteFriendsList(params) {
    return service({
        url: '/system/invite/clientList',
        params,
        no_debounce: true,
    })
}

// 预估收益列表页
export function useGetEstimateIncomeList(params) {
    return service({
        url: '/coupon/activity/commission/orderRelateList',
        params,
        no_debounce: true,
    })
}

// 查询积分商城发放记录列表
export function useGetIntegralRecord(params) {
    return service({
        url: '/coupon/pointsRecord/client/list',
        method: 'get',
        params,
    })
}

// 查询积分商城我的礼品列表
export function useGetIntegralPrizeList(params) {
    return service({
        url: '/coupon/pointExchange/client/list',
        method: 'get',
        params,
    })
}

//积分商城列表
export function useGetIntegralMall(params) {
    return service({
        url: '/coupon/pointsMall/list',
        method: 'get',
        params,
    })
}

// 积分商城兑换商品
export function useExchangePrize(data) {
    return service({
        url: '/coupon/pointExchange/exchange',
        method: 'post',
        data,
    })
}

//新增合作商
export function useSaveProducer(data) {
    return service({
        url: '/equipment/producer/save',
        method: 'post',
        data,
    })
}

//草稿箱列表
export function useGetDraftsList(params) {
    return service({
        url: '/equipment/subscribeDrafts/list',
        method: 'get',
        params
    })
}

//删除草稿
export function useDeleteDrafts(id) {
    return service({
        url: `/equipment/subscribeDrafts/${id}`,
        method: 'delete',
    })
}

//获取草稿箱详情---用于继续编辑草稿
export function useGetDraftInfo(draftId) {
    return service({
        method: 'get',
        url: `equipment/subscribeDrafts/${draftId}`,
    });
}

//团队订单列表--- 待审核 / 已审核
export function useGetCheckTeamList(params) {
    return service({
        method: 'get',
        url: '/equipment/order/checkTeamList',
        params,
        no_debounce: true,
    });
}

//订单审核
export function useOrderCheck(data) {
    return service({
        url: '/equipment/order/orderCheck',
        method: 'put',
        data
    })
}

//团队成员列表
export function useGetTeamMemberList(params) {
    return service({
        method: 'get',
        url: '/system/team/joinTeamList',
        params,
    });
}

//团员支付审核 设置
export function useControlTeamAuditFlag(data) {
    return service({
        url: '/system/client/controlTeamAuditFlag',
        method: 'post',
        data,
    })
}

//转让团长
export function useTransferTeam(data) {
    return service({
        method: 'put',
        url: '/system/team/transferTeam',
        data,
    });
}

//设置管理员
export function useSetAdministrator(data) {
    return service({
        method: 'put',
        url: '/system/team/setAdministrator',
        data,
    });
}

//移出团队
export function useRemoveTeam(data) {
    return service({
        method: 'put',
        url: '/system/team/removeJoinTeam',
        data,
    });
}

//入团申请列表
export function useGetApplyJoinTeamList(params) {
    return service({
        method: 'get',
        url: '/system/team/joinTeamCheckList',
        params,
    });
}

//入团申请审核
export function useCheckJoinTeam(data) {
    return service({
        method: 'put',
        url: '/system/team/checkJoinTeam',
        data,
    });
}

//解散团队
export function useDissolveTeam() {
    return service({
        method: 'post',
        url: '/system/team/dissolveTeam'
    });
}

//创建团队
export function useCreatTeam(data) {
    return service({
        method: 'post',
        url: '/system/team',
        data,
    });
}

//编辑团队
export function useEditTeam(data) {
    return service({
        method: 'put',
        url: '/system/team',
        data,
    });
}

//团队订单
export function useGetTeamOrderList(params) {
    return service({
        url: '/equipment/order/teamOrderList',
        method: 'get',
        params
    })
}

//【帮ta还款】团队订单列表
export function useGetHelpRepaymentList(params) {
    return service({
        url: '/equipment/order/helpTeamMemberRepayment',
        method: 'get',
        params
    })
}

//团队订单操作---【帮ta还款】
export function useHelpRepayment(data) {
    return service({
        url: '/system/team/financialCenter/helpTeamMemberRepayment',
        method: 'post',
        data
    })
}