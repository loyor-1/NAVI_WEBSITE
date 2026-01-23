<script setup>
import _ from 'lodash'
import inviteFriendTitle from '../components/invite_friend_title.vue'
import inviteFriendGrid from '../components/invite_friend_grid.vue'
import inviteFriendDialog from '../components/invite_friend_dialog.vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { invite_friend_static } from '../static/invite_friend'
import { getUserInfo } from '@/utils/auth'
import { useGetDicts, useInviteFriends, useDownloadPoster } from '@/api'

const user_info = getUserInfo()
const WX_QR_code = invite_friend_static.WX_QR_code

const container_dom = ref(null)
const invite_friend_dialog_dom = ref(null)

const rule_dialog = ref(false)
const QR_code_dialog = ref(false)
const dynamic_height = ref(null)
const QR_code = ref('')
const invite_QR_code = ref('')
const rule_content = ref('')

const invite_friend_img_list = computed(() => {
    let urls = []
    urls.push(invite_friend_static.invite_f_1)
    urls.push(invite_friend_static.invite_f_2)
    urls.push(invite_friend_static.invite_f_3)
    return urls
})
const award_info_img_list = computed(() => {
    let urls = []
    urls.push(invite_friend_static.award_pc_1)
    urls.push(invite_friend_static.award_pc_2)
    urls.push(invite_friend_static.award_pc_3)
    return urls
})
const invite_friend_step_list = computed(() => {
    let steps = []
    steps.push(invite_friend_static.join_1)
    steps.push(invite_friend_static.join_2)
    return steps
})

onMounted(() => {
    getQrCode()
    getRule()
    calculateImageSize()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})

// 防抖的resize处理
const handleResize = _.debounce(function() {
    calculateImageSize()
}, 300)

// 获取活动规则
async function getRule() {
    const res = await useGetDicts('commission_rules')
    if (res.data && res.data.length) {
        const { dictLabel = '', dictValue = '' } = res.data[0]
        rule_content.value = dictValue
    }
}

async function getQrCode() {
    const params = {
        width: 100,
        inviterType: 2,
    }
    const res = await useInviteFriends(params)
    const byte_data = res.qrCodeBytes
    invite_QR_code.value = 'data:image/pngbase64,' + byte_data
}

function handleShowRuleDlg() {
    rule_dialog.value = true
}

// 点击微信公众号
function handleAwardUrl(index) {
    if (index === 2) {
        QR_code.value = WX_QR_code
        QR_code_dialog.value = true
    }  
}

// 点击邀请链接
async function handleInviteUrl(index) {
    if (index === 0) {
        // 复制链接
        try {
            let base_url = `${import.meta.env.VITE_POET}?inviter_type=3&inviter_phone_number=${user_info.phoneNumber}`
            await navigator.clipboard.writeText(base_url)
            ElMessage.success('邀请链接已复制到剪贴板')
        }
        catch(err) {
            console.log(err)
            ElMessage.error('复制失败,请手动复制邀请链接')
        }
    } else if (index === 1) {
        // 查看二维码
        QR_code.value = invite_QR_code.value
        QR_code_dialog.value = true
    } else if (index === 2) {
        // 下载海报
        const params = {
            page: 'pages/index/index',
            width: 300,
            scene: ``
        }
        const res = await useDownloadPoster(params)
        const { url = '' } = res
        if (url) {
            const img_url = `${import.meta.env.VITE_POET}${import.meta.env.VITE_FILE_API}/statics${url}`
            window.open(img_url, '_blank')
            // 执行下载 图片
            try {
                const response = await fetch(img_url)
                const blob = await response.blob()
                const download_url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = download_url
                link.download = `poster_${Date.now()}.png`
                document.body.appendChild(link)
                link.click()
                // 清理对象URL
                window.URL.revokeObjectURL(download_url)
                document.body.removeChild(link)
            } catch (error) {
                console.error('下载失败:', error)
                ElMessage.error('海报下载失败')
            }
        }
    }
}

function handleClickItem(data) {
    if (data.title === '可提现') {
        // 弹出小程序码 -- 路径为提现首页
        // todo 需要等小程序上线
    } else {
        invite_friend_dialog_dom.value.publicOpen(data.title)
    }
}

// 新增图片尺寸计算方法
function calculateImageSize() {
    const container_width = container_dom.value.offsetWidth
    const aspect_ratio = 0.52 // 16:9比例 (可根据实际需求调整)
    
    // 处理邀请好友图片
    document.querySelectorAll('.invite-friends-img').forEach(el => {
        const parent_width = el.parentElement.offsetWidth
        const img_width = el.classList.contains('stepBy2') 
            ? parent_width * 0.49 // 两列布局
            : parent_width * 0.32 // 三列布局
        
        el.style.width = `${img_width}px`
        el.style.height = `${img_width * aspect_ratio}px`
    })
    // 处理右侧图片
    const right_img = document.querySelector('.right-img')
    // 设置左边框的高度
    if (right_img) {
        right_img.style.height = `${container_width * 0.15}px`
        right_img.style.width = `${container_width * 0.3}px`
    }
    const row_in_line = document.querySelector('.row-inline')
    if (row_in_line) {
        row_in_line.style.height = `${container_width * 0.15}px`
    }
    dynamic_height.value = `${container_width * 0.15 - 62}px`
}
</script>

<template>
    <div class="inviteFriendsComp" ref="container_dom">
        <el-card shadow="never">
            <div class="row-inline">
                <div class="flex-center-col first-card">
                    <inviteFriendTitle title="我的收益" >
                        <div>
                            <span v-if="![103, 298].includes(user_info.unitId)">*活动在筹备中，敬请期待...</span>
                            <span class="withdrawal-info-rule" @click="handleShowRuleDlg">
                                <i class="el-icon-document"></i>
                                活动规则
                            </span>
                        </div>
                    </inviteFriendTitle>
                    <div class="withdrawal-info" ref="withdrawalInfoRef" :style="{ height: dynamic_height }">
                        <!-- 提现信息 -->
                        <inviteFriendGrid @clickItem="handleClickItem" />
                    </div>
                </div>
                <img class="right-img" :src="invite_friend_static.withdraw_pc_bg" alt="" />
            </div>
        </el-card>
        
        <div class="divider"></div>
        <el-card shadow="never">
            <inviteFriendTitle title="邀请好友"/>
            <div class="invite-friends-img-container">
                <div class="invite-friends-img" v-for="(url, index) in invite_friend_img_list" :key="index" @click="handleInviteUrl(index)">
                    <img :src="url" alt="" />
                </div>
            </div>
        </el-card>
        <div class="divider"></div>
        <el-card shadow="never">
            <inviteFriendTitle title="奖励说明"/>
            <div class="invite-friends-img-container">
                <div class="invite-friends-img" v-for="(url, index) in award_info_img_list" :key="index" @click="handleAwardUrl(index)">
                    <img :src="url" alt="" />
                </div>
            </div>
        </el-card>
        <div class="divider"></div>
        <el-card shadow="never">
            <inviteFriendTitle title="参与步骤"/>
            <div class="invite-friends-img-container">
                <div class="invite-friends-img stepBy2" v-for="(url, index) in invite_friend_step_list" :key="index">
                    <img :src="url" alt="" />
                </div>
            </div>
        </el-card>

        <inviteFriendDialog ref="invite_friend_dialog_dom" />

        <el-dialog title="活动规则" v-model="rule_dialog" width="60%" append-to-body>
            <div v-html="rule_content" class="rich-content"></div>
        </el-dialog>

        <el-dialog title="" v-model="QR_code_dialog" width="400px" append-to-body>
            <div style="display: flex; justify-content: center; padding: 20px 0">
                <img style="width: 250px" :src="QR_code" />
            </div>
        </el-dialog>
    </div>
</template>

<style scoped lang="scss">
.inviteFriendsComp {
    .row-inline {
        display: flex;
        align-items: center;
        .first-card {
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #fff 33.93%, #fff2e5 102.59%)
        }
        .right-img {
            width: 30%;
            vertical-align: middle;
        }
    }
    .divider {
        height: 15px;
    }
}
.withdrawal-info {
    display: flex;
    align-items: center;
    width: 100%;
}
.invite-friends-img-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .invite-friends-img {
        // width: 32%;
        // height: 140px;
        img {
            width: 100%;
            height: 100%;
            object-fit: contain; // 保持比例填充
            transition: transform 0.3s ease;
        }
    }
    .stepBy2 {
        width: 49%;
        img {
            width: 100%;
            height: 100%;   
            object-fit: contain; // 保持比例填充
            transition: transform 0.3s ease;
        }
    }
}
.withdrawal-info-rule {
    color: #7e8488;
    font-size: 14px;
    font-weight: 400;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}
</style>
