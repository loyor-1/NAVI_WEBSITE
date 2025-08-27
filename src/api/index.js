import service from '@/utils/request';

//首页轮播图
export function useGetCarouselList(params) {
    return service({
        url: '/system/carousel/list',
        params,
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
        params: params,
    });
}