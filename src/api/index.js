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
export function useGet(params) {
    return service({
        method: 'get',
        url: '/system/wx/getPPQRcode',
        params: params
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