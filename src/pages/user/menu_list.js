import { UserFilled, Document, Tickets } from '@element-plus/icons-vue';

export const menu_list = [
    {
        index: '1',
        label: '账号管理',
        icon: UserFilled,
        child: [
            { index: '1-1', label: '个人中心', path: '/user/account_manage/user_space' },
            { index: '1-2', label: '邀请好友' },
            { index: '1-3', label: '积分商城' },
            { index: '1-4', label: '合作入驻' },
        ]
    },
    {
        index: '2',
        label: '订单管理',
        icon: Document,
        child: [
            { index: '2-1', label: '我的订单' },
            { index: '2-2', label: '订单操作' },
            { index: '2-3', label: '草稿箱' },
        ]
    },
    {
        index: '3',
        label: '订单管理',
        icon: Tickets,
        child: [
            { index: '3-1', label: '抬头管理' , path: '/user/invoice_manage/title_manage'},
            { index: '3-2', label: '我的发票', path: '/user/invoice_manage/invoice_list' },
        ]
    }
]