import user from '@/assets/svg/user.svg'
import order from '@/assets/svg/order.svg'
import team from '@/assets/svg/team.svg'
import invoice from '@/assets/svg/invoice.svg'
import { getUserInfo } from '@/utils/auth'

const user_info = getUserInfo()

export const menu_list = [
    {
        index: '1',
        label: '账号管理',
        icon: user,
        child: [
            { index: '1-1', label: '个人中心', path: '/user/account_manage/user_space', name: 'user_space', show: true },
            { index: '1-2', label: '邀请好友', path: '/user/account_manage/invite_friend', name: 'invite_friend', show: true },
            { index: '1-3', label: '积分商城', path: '/user/account_manage/integral_mall', name: 'integral_mall', show: true },
            { index: '1-4', label: '合作入驻', path: '/user/account_manage/cooperative_settlement', name: 'cooperative_settlement', show: true },
            { index: '1-5', label: '专利服务', path: '/user/account_manage/patent_services', name: 'patent_services', show: true },
        ]
    },
    {
        index: '2',
        label: '订单管理',
        icon: order,
        child: [
            { index: '2-1', label: '我的订单', path: '/user/order_manage/user_order_list', name: 'user_order_list', show: true },
            { index: '2-2', label: '订单操作', path: '/user/order_manage/user_order_operate', name: 'user_order_operate', show: true },
            { index: '2-3', label: '草稿箱', path: '/user/order_manage/order_drafts', name: 'order_drafts', show: true },
        ]
    },
    {
        index: '3',
        label: '团队管理',
        icon: team,
        child: [
            { index: '3-1', label: '我的团队', path: '/user/team_manage/team_space', name: 'team_space', show: true },
            { index: '3-2', label: '财务中心', path: '/user/team_manage/team_financial_center', name: 'team_financial_center', show: user_info.teamId && user_info.characterRole != 3 },
            { index: '3-3', label: '团队订单', path: '/user/team_manage/team_order_list', name: 'team_order_list', show: user_info.teamId && user_info.characterRole != 3 },
            { index: '3-4', label: '订单操作', path: '/user/team_manage/team_order_operate', name: 'team_order_operate', show: user_info.teamId && user_info.characterRole != 3 },
        ]
    },
    {
        index: '4',
        label: '发票管理',
        icon: invoice,
        child: [
            { index: '4-1', label: '抬头管理' , path: '/user/invoice_manage/title_manage', show: true},
            { index: '4-2', label: '我的发票', path: '/user/invoice_manage/invoice_list', show: true },
        ]
    }
]