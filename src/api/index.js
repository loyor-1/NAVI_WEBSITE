import service from '@/utils/request';

//获取七牛云下载链接
export function useGetDownLoadUrl(query) {
    return service({
        url: '/equipment/uploadCenter/getDownLoadUrl',
        method: 'get',
        params: query
    })
}

// 客服二维码
export function useGetCustomerServiceQrcode() {
    return service({
        url: '/system/dict/data/type/customer_service_qrcode',
        method: 'get',
    })
}

//首页轮播图
export function useGetCarouselList(params) {
    return service({
        url: '/system/carousel/list',
        params,
    })
}

//获取主页活动弹窗图片
export function useGetActives(categoryId) {
    return service({
        url: `/coupon/activity/config/category/${categoryId}`
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
        method: 'get'
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
export function useGetInvoiceHeadList(query) {
    return service({
        url: '/equipment/invoiceHeadContrast/list',
        method: 'get',
        params: query
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
export function useGetTestItemList(query) {
    return service({
        url: '/equipment/equipmentDetectionItem/listAll',
        method: 'get',
        params: query
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