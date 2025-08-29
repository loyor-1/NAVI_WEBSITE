import { UserFilled, Document } from '@element-plus/icons-vue';

export const menu_list = [
    {
        index: '1',
        label: '账号管理',
        icon: UserFilled,
        child: [
            { index: '1-1', label: '个人中心', path: '/user_space' },
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
    }
]