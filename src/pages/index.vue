<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { getUserInfo } from '@/utils/auth';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const router = useRouter()
const user_store = useUserStore()

const menu_switch = ref('')
const user_info = ref(JSON.parse(getUserInfo()))
const menu_timer = ref(null)

const tab_list_all = ref([
  { label: '首页', index: 0, active: true, page: '/'},
  { label: '云现场', index: 1, active: false,},
  { label: '材料检测', index: 2, active: false},
  { label: '高端测试', index: 3, active: false},
  { label: '材料加工', index: 4, active: false},
  { label: '试剂耗材', index: 5, active: false},
  { label: '环境检测', index: 6, active: false},
  { label: '模拟计算', index: 7, active: false},
  { label: '科研绘图', index: 8, active: false},
  { label: '论文润色', index: 9, active: false},
  { label: '数据分析', index: 10, active: false},
  { label: '专利服务', index: 11, active: false},
  { label: '合作入驻', index: 12, active: false},
  { label: '关于我们', index: 13, active: false},
  { label: '预留页面', index: 14, active: false},
  { label: '预留页面', index: 15, active: false},
  { label: '预留页面', index: 16, active: false},
  { label: '预留页面', index: 17, active: false},
  { label: '预留页面', index: 18, active: false},
  { label: '预留页面', index: 19, active: false},
])

const tab_list = ref(tab_list_all.value.slice(0, 14))

// 用户面板
function changeMenuSwitch(value) {
  if(value == 'show') {
    if(menu_timer.value) {
      clearTimeout(menu_timer.value)
      menu_timer.value = null
    }
    menu_switch.value = value
  } else {
    menu_timer.value = setTimeout(() => {
      menu_switch.value = value
      clearTimeout(menu_timer.value)
      menu_timer.value = null
    }, 500);
  }
}

//tabbar翻页
function changeMenuList(num) {
  const index_start = tab_list_all.value.findIndex(item => item.index == tab_list.value[0].index) + num
  const index_end = tab_list_all.value.findIndex(item => item.index == tab_list.value[tab_list.value.length - 1].index) + 1 + num
  if(index_start < 0 || index_end > tab_list_all.value.length - 1) return
  tab_list.value = tab_list_all.value.slice(index_start, index_end)
}

//选中tabbar
function clickTabbar(data) {
  tab_list_all.value.forEach(item => {
    item.active = item.index == data.index
  })
  router.push(data.page || '/')
}

//退出登录
function logout() {
  ElMessageBox.confirm('是否确认退出登录？', '温馨提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    await user_store.logout()
    router.push('/')
    window.location.reload()
  })
}

</script>

<template>
  <div class="page-main">
    <div class="app-head flex-center">
      <div class="top-box">
        <img class="logo" src="@/assets/logo/logo.png" alt="">
        <img class="brand-logo" src="@/assets/logo/brand_logo.png" alt="">
        <div class="search-box">
          <input class="search-input" type="text">
          <div class="search-slider"></div>
          <div class="search-button flex-center">搜索</div>
        </div>
        <div class="slider"></div>
        <div class="phone-box">
          <img src="@/assets/img/phone.png" alt="">
          <div>
            <span>全国统一服务热线</span>
            <div>400-168-0661</div>
          </div>
        </div>
        <div class="slider"></div>
        <div class="user-box">
          <div class="user-box-main" v-if="user_info" @mouseenter="changeMenuSwitch('show')" @mouseleave="changeMenuSwitch('hide')">
            <img class="avatar" v-if="user_info.avatar" :src="user_info.avatar_path" alt="">
            <img class="avatar" v-else src="@/assets/img/default_avatar.png" alt="">
            <div class="user-name multi-line-ellipsis-1">{{ user_info.clientName }}</div>
          </div>
          <div class="user-box-main" v-else>
            <img class="avatar" src="@/assets/img/default_avatar.png" alt="">
            <div class="user-name multi-line-ellipsis-1" @click="router.push('/login')">登录/注册</div>
          </div>
          <img class="pre_active" src="@/assets/img/pre_active.png" alt="">
          <ul class="user-menu" :class="{'user-menu-show': menu_switch == 'show', 'user-menu-hide': menu_switch == 'hide'}" @mouseenter="changeMenuSwitch('show')" @mouseleave="changeMenuSwitch('hide')">
            <li class="menu-li">个人资料</li>
            <li class="menu-li">我的资产</li>
            <li class="menu-li">我的订单</li>
            <li class="menu-li">我的团队</li>
            <li class="menu-li">邀请好友</li>
            <li class="menu-li">我的发票</li>
            <li class="menu-li" @click="logout">退出登录</li>
          </ul>
        </div>
      </div>
      <div class="bottom-box">
        <div class="tabbar-button flex-center" @click="changeMenuList(-1)"><el-icon><ArrowLeftBold /></el-icon></div>
        <div class="tabbar flex-center" :class="{'tabbar-active': item.active}" v-for="item in tab_list" :key="item.index" @click="clickTabbar(item)">{{ item.label }}</div>
        <div class="tabbar-button flex-center" @click="changeMenuList(1)"><el-icon><ArrowRightBold /></el-icon></div>
      </div>
    </div>

    <router-view />

    <div class="page-footer">
      <div class="info-box">
        <div class="box-left flex-center">
          <div class="left-item">400-168-0661</div>
          <div class="left-item">工作时间: 8:30-23:00</div>
          <div class="left-item">Email: hnnavi@navi-sci.cn</div>
          <div class="left-item">
            <span>云现场</span>
            <div class="slider"></div>
            <span>材料检测</span>
            <div class="slider"></div>
            <span>材料加工</span>
            <div class="slider"></div>
            <span>合作入驻</span>
            <div class="slider"></div>
            <span>关于我们</span>
          </div>
        </div>
        <div class="box-center flex-center">
          <div class="center-item">
            <img src="@/assets/img/gzh.png" alt="">
            <div>企业二维码</div>
          </div>
          <div class="center-item">
            <img src="@/assets/img/xcx.png" alt="">
            <div>小程序二维码</div>
          </div>
        </div>
        <div class="box-right flex-center">总部地址：湖南省长沙市岳麓区岳麓街道科技创意园8栋负一楼</div>
      </div>
      <div class="code-box flex-center">ICP备案号：湘ICP备20210169</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-main {
  overflow: auto;
  flex-direction: column;
  row-gap: 50px;
  min-width: 1440px;
  height: 100vh;
}

.app-head {
  z-index:999;
  position: sticky;
  top: 0;
  flex-direction: column;
  min-width: 1440px;
  height: 150px;
  background-color: #FFFFFF;
  .top-box {
    display: flex;
    column-gap: 20px;
    align-items: center;
    width: 80vw;
    min-width: 1440px;
    height: 100px;
    .logo {
      width: 200px;
    }
    .brand-logo {
      width: 200px;
    }
    .slider {
      height: 80%;
      border-left: 1px solid #94C9FF50;
    }
    .search-box {
      width: 50%;
      display: flex;
      column-gap: 1px;
      height: 50px;
      padding: 5px;
      border-radius: 5px;
      background-image: linear-gradient(to right, #9FFFD7, #BAFF75);
      .search-input {
        width: 90%;
        height: 40px;
        padding: 5px;
        border: none;
        outline: none;
        border-radius: 5px 0 0 5px;
      }
      .search-button {
        cursor: pointer;
        width: 15%;
        min-width: 50px;
        height: 40px;
        color: #5CC300;
        border-radius: 0 5px 5px 0;
        background-color: #FFFFFF;
      }
      .search-button:hover {
        background-color: #5CC30001;
        border: 2px solid #5CC30030;
      }
    }
    .phone-box {
      width: 12%;
      min-width: 200px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      color: #4D6FFF;
      img {
        width: 50px;
      }
    }
    .user-box {
      cursor: pointer;
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: calc(38% - 525px);
      min-width: 200px;
      .user-box-main {
        display: flex;
        column-gap: 5px;
        justify-content: space-between;
        align-items: center;
        width: calc(100% - 105px);
        .avatar {
          width: 50px;
          height: 50px;
          border: 1px solid #cccccc;
          border-radius: 50%;
        }
        .user-name {
          width: calc(100% - 50px);
          color: #94C9FF;
        }
        .user-name:hover {
          color: #4D6FFF;
        }
      }
      .pre_active {
        width: 100px;
      }
      @keyframes show_menu {
        0% {
          opacity: 0;
          height: 0px;
        }
        100% {
          opacity: 1;
          height: 280px;
        }
      }
      @keyframes hide_menu {
        0% {
          opacity: 1;
          height: 280px;
        }
        100% {
          opacity: 0;
          height: 0px;
        }
      }
      .user-menu {
        z-index: 999;
        overflow: hidden;
        list-style: none;
        position: absolute;
        top: 120%;
        width: calc(100% - 100px);
        height: 0;
        color: #5D5D5D;
        box-shadow: 0px 0px 10px 1px #E8E8E8;
        background-color: #FFFFFF;
        .menu-li {
          height: 40px;
          text-align: center;
          line-height: 40px;
        }
        .menu-li:hover {
          background-color: #F4F7FA;
        }
        .menu-li:last-child {
          border-top: 1px solid #E8E8E8;
          background-color: #FF4A2B50;
        }
        .menu-li:last-child:hover {
          color: #FFFFFF;
          background-color: #FF4A2B;
        }
      }
      .user-menu-show {
        animation: show_menu 0.3s linear forwards;
      }
      .user-menu-hide {
        animation: hide_menu 0.3s linear forwards;
      }
    }
  }
  .bottom-box {
    display: flex;
    width: 80vw;
    min-width: 1440px;
    height: 50px;
    .tabbar-button {
      user-select: none; /* 标准语法 */
      -webkit-user-select: none; /* Safari/Chrome */
      -moz-user-select: none; /* Firefox */
      -ms-user-select: none; /* IE/Edge */
      flex: 0.5;
      color: #FFFFFF;
      background-color: #94C9FF;
    }
    .tabbar {
      cursor: default;
      flex: 1;
      height: 50px;
    }
    .tabbar-active {
      color: #94C9FF;
      border-top: 5px solid #94C9FF;
      box-shadow: 0px -2px 10px 1px #94C9FF;
    }
  }
}

.page-footer {
  overflow: hidden;
  min-width: 1440px;
  height: 350px;
  margin: 20px auto 0;
  color: #FFFFFF;
  background-color: #272A29;
  .info-box {
    display: flex;
    justify-content: space-around;
    align-items: center;
    min-width: 1440px;
    height: 280px;
    .box-left {
      width: 20vw;
      min-width: 360px;
      flex-direction: column;
      row-gap: 15px;
      .left-item {
        width: 20vw;
        min-width: 360px;
        .slider {
          transform: scale(0.6);
          border-left: 2px solid #FFFFFF;
        }
      }
      .left-item:last-child {
        display: flex;
        column-gap: 5px;
      } 
    }
    .box-center {
      display: flex;
      justify-content: space-between;
      width: 15vw;
      min-width: 288px;
      .center-item {
        display: flex;
        flex-direction: column;
        row-gap: 15px;
        align-items: center;
        img {
          width: 6vw;
          min-width: 86px;
        }
      }
    }
    .box-right {
      width: 20vw;
      min-width: 288px;
    }
  }
  .code-box {
    width: 100vw;
    min-width: 1440px;
    height: 70px;
    border-top: 1px solid #FFFFFF;
  }
}
</style>
