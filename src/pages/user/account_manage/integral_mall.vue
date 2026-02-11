<script setup>
import { reactive, ref } from 'vue'
import { getUserInfo } from '@/utils/auth'
import { useGetDicts, useGetMyAssets, useGetIntegralMall, useGetIntegralRecord, useGetIntegralPrizeList, useExchangePrize } from '@/api'
import { ElMessage } from 'element-plus'
import { regionData, codeToText } from 'element-china-area-data'
import { validPhone } from '@/utils/validate'

function validPhoneRule(rule, value, callback) {
    const {valid, message} = validPhone(value)
    if(valid) {
        callback()
    } else {
        callback(new Error(message))
    }
}

const user_info = reactive(getUserInfo())//用户信息

const exchange_form_dom = ref(null)

const prize_loading = ref(false)
const integral_mall_loading = ref(false)
const exchange_loading = ref(false)
const show_mall = ref(true)
const my_prize_dialog = ref(false)
const rules_dialog = ref(false)
const prize_detail_dialog = ref(false)
const exchange_dialog = ref(false)
const prize_active_name = ref('')
const my_assets = ref({})//我的资产
const rules = ref({})//活动规则
const table_list = ref([])//【我的礼品】弹框数据
const prize_detail = ref({})//礼品详情信息
const integral_mall = ref([])//积分商城列表
const exchange_prize_info = ref({})//被选中待兑换的礼品信息

//【我的礼品】发放记录、礼品列表 查询参数
const prize_params = ref({
    pageNum: 1,
    pageSize: 10,
    orderByColumn: '',
    isAsc: 'desc',
    total: 0,
})
//积分商城筛选等级options
const integral_level = [
    { label: '全部', value: 1, start: 0, end: 99999 },
    { label: '0 ~ 4999 积分', value: 2, start: 0, end: 4999 },
    { label: '5000 ~ 9999 积分', value: 3, start: 5000, end: 9999 },
    { label: '10000 积分以上', value: 4, start: 10000, end: 99999 },
]
//积分商城列表查询参数
const integral_mall_params = ref({
    pageNum: 1,
    pageSize: 10,
    orderByColumn: 'sort',
    isAsc: 'desc',
    params_level: null,
    total: 0,
})
//兑换礼品表单校验规则
const exchange_form_rules = {
    contacts: [
        { required: true, trigger: 'blur', message: '请输入联系人' },
        { max: 20, message: '联系人不能超过20个字', trigger: 'blur' }
    ],
    phoneNumber: [
        { required: true, trigger: 'blur', message: '请输入联系电话' },
        { validator: validPhoneRule, trigger: 'blur' }
    ],
    provinceValue: [{ required: true, trigger: 'change', message: '请选择所在省市' }],
    address: [
        { required: true, trigger: 'blur', message: '请输入寄送地址' },
        { max: 200, message: '寄送地址不能超过200个字', trigger: 'blur' }
    ]
}
//兑换礼品接口参数
const exchange_data = ref({
    mallId: '',//礼品id
    contacts: '',//联系人姓名
    phoneNumber: '',//联系人电话
    area: '',//所在地区  文字
    provinceCode: '',//所在地区 id字符串
    provinceValue: [],//所在地区  id数组
    address: '',//寄送地址
    favRemark: '',//兑换备注
})

async function initPage() {
    const res_rules = await useGetDicts('point_rule')
    const res_assets = await useGetMyAssets(user_info.clientId)
    rules.value = res_rules.data[0]
    my_assets.value = res_assets.data

}
initPage()

//打开【我的礼品】弹框
function openMyPrizeDialog() {
    my_prize_dialog.value = true
    changePrizeActiveName('first', true)
}

//切换弹框tab
async function changePrizeActiveName(e, flag) {
    prize_loading.value = true
    prize_active_name.value = e
    if(flag) prize_params.value.pageNum = 1
    try {
        switch(e) {
            case 'first':
                prize_params.value.orderByColumn = 'pointsId'
                const res_first = await useGetIntegralRecord(prize_params.value)
                table_list.value = res_first.rows
                prize_params.value.total = res_first.total
                break
            case 'second':
                prize_params.value.orderByColumn = 'id'
                const res_second = await useGetIntegralPrizeList(prize_params.value)
                table_list.value = res_second.rows
                prize_params.value.total = res_second.total
                break
        }
        prize_loading.value = false
    }
    catch(err) {
        console.log(err)
        prize_loading.value = false
    }
}

function changePrizePage(e) {
    prize_params.value.pageNum = e
    changePrizeActiveName(prize_active_name.value, false)
}

// 打开礼品详情弹框
function openPrizeDetailDialog(data) {
    prize_detail.value = data
    prize_detail_dialog.value = true
}

//改变积分筛选等级
async function changeLevel(value) {
    try {
        integral_mall_loading.value = true
        integral_mall_params.value.params_level = value

        const data = integral_level.find(item => item.value == value)
        const params = {
            pageNum: integral_mall_params.value.pageNum,
            pageSize: 10,
            orderByColumn: 'sort',
            isAsc: 'desc',
            redeemPointsBegin: data.start,
            redeemPointsEnd: data.end,
        }
        const res = await useGetIntegralMall(params)
        integral_mall.value = res.rows
        integral_mall_params.value.total = res.total
        integral_mall_loading.value = false
    }
    catch(err) {
        console.log(err)
        integral_mall_loading.value = false
    }
}
changeLevel(1)

function changeMallPage(e) {
    integral_mall_params.value.pageNum = e
    changeLevel(integral_mall_params.value.params_level)
}

//兑换礼品
function exchangePrize(data) {
    console.log('data', data)
    if(user_info.isFrozen === 1){
        ElMessage.warning('您的积分已冻结，无法兑换，请联系客服')
        return
    }
    if (data.redeemPoints > my_assets.value.pointBalance) {
        ElMessage.warning(`当前剩余积分${my_assets.value.pointBalance}，无法兑换`)
        return 
    }
    exchange_prize_info.value = data
    exchange_data.value.mallId = data.mallId
    show_mall.value = false
}

//返回积分商城
function backMall() {
    exchange_form_dom.value.resetFields()
    exchange_data.value.area = ''
    exchange_data.value.provinceCode = ''
    show_mall.value = true
}

//兑换礼品---所在地区
function selectProvince(value) {
    exchange_data.value.provinceValue = value
    exchange_data.value.provinceCode = value.toString()
    exchange_data.value.area = getCodeToText(value)
}
//把区域码转成汉字
function getCodeToText(value) {
    var name = ''
    value.map((item) => (name += codeToText[item] + '/'))
    return name
}

// 打开确认兑换弹框
function openConfirmExchangeDialog() {
    exchange_form_dom.value.validate(valid => {
        if(valid) exchange_dialog.value = true
    })
}

// 确认兑换礼品
async function confirmExchange() {
    try {
        exchange_dialog.value = false
        exchange_loading.value = true
        await useExchangePrize(exchange_data.value)
        exchange_loading.value = false
        show_mall.value = true
        ElMessage.success('兑换成功！')
    }
    catch(err) {
        console.log(err)
        exchange_loading.value = false
    }
}
</script>

<template>
    <div class="flex-center head-box">
        <div class="flex-center user-integral">
            <div class="flex-center" style="border: 1px solid #5D5D5D; border-radius: 50%;">
                <el-image class="user-avatar" :src="user_info.avatar_path">
                    <template #error>
                        <img class="user-avatar" src="@/assets/img/avatar.png" alt="">
                    </template>
                </el-image>
            </div>
            <div>
                <span class="font-middle">可用积分：</span>
                <span class="font-middle font-FF5000 font-600">{{ my_assets.pointBalance || 0 }}</span>
            </div>
        </div>
        <div class="flex-center button-box">
            <div class="custom-button button-style" @click="openMyPrizeDialog">我的礼品</div>
            <div class="default-button button-style" @click="rules_dialog = true">积分规则</div>
        </div>
    </div>

    <!-- 积分商城列表 -->
    <div class="integral-mall" v-show="show_mall">
        <div class="flex-center search-box">
            <div class="flex-center integral-level">
                <div class="flex-center level" :class="{'level-active': integral_mall_params.params_level == item.value}" v-for="item in integral_level" :key="item.value" @click="changeLevel(item.value)">{{ item.label }}</div>
            </div>
            <div>
                <el-pagination background layout="total, prev, pager, next" :total="integral_mall_params.total" @change="changeMallPage"/>
            </div>
        </div>
        <div class="flex-center mall-list" v-if="integral_mall.length" v-loading="integral_mall_loading">
            <div class="flex-center-col prize-card" v-for="item in integral_mall" :key="item.mallId" @click="exchangePrize(item)">
                <el-image class="prize-img" :src="item.pcPic">
                    <template #error>
                        <img class="fail-pic" src="@/assets/img/fail_pic.png" />
                    </template>
                </el-image>
                <div class="flex-center info-box">
                    <span class="font-FF5000 font-600 text-ellipsis-1">{{ item.mallName }}</span>
                    <span class="font-mini font-5D5D5D">{{ item.frequency || 0 }}人兑换</span>
                </div>
                <div class="flex-center info-box">
                    <span class="font-mini text-ellipsis-2">{{ item.mallDesc }}</span>
                    <span class="font-normal font-FF5000 font-600">{{ item.redeemPoints || 0 }}积分</span>
                </div>
                <div class="exchange-button">立即兑换</div>
            </div>
        </div>
        <div class="flex-center mall-list-null" v-else v-loading="integral_mall_loading">
            <el-empty description="暂无数据" />
        </div>
    </div>
    <!-- 填写兑换信息 -->
    <div class="integral-mall" v-show="!show_mall">
        <div class="flex-center search-box" style="justify-content: center;">
            <div class="custom-button back-button" @click="backMall">返回</div>
            <div class="font-middle font-600">{{ exchange_prize_info.mallName }}</div>
        </div>
        <div class="mall-list" v-loading="exchange_loading">
            <div class="exchange-prize-info">
                <div class="flex-center info-head">
                    <div class="flex-center font-600 head-th">礼品名称</div>
                    <div class="flex-center font-600 head-th">兑换数量</div>
                    <div class="flex-center font-600 head-th">所需积分</div>
                    <div class="flex-center font-600 head-th">礼品描述</div>
                </div>
                <div class="flex-center info-content">
                    <div class="flex-center content-td">
                        <img :src="exchange_prize_info.pcPic" alt="">
                        <div class="multi-line-ellipsis-2 prize-name">{{ exchange_prize_info.mallName }}</div>
                    </div>
                    <div class="flex-center content-td">1</div>
                    <div class="flex-center content-td">{{ exchange_prize_info.redeemPoints }}</div>
                    <div class="flex-center content-td">{{ exchange_prize_info.remark || '--暂无描述--' }}</div>
                </div>
            </div>
            <el-form ref="exchange_form_dom" :model="exchange_data" :rules="exchange_form_rules" label-width="80" label-position="left">
                <el-form-item style="width: 800px" label="联系人" prop="contacts">
                    <el-input v-model="exchange_data.contacts" placeholder="请输入联系人"></el-input>
                </el-form-item>
                <el-form-item style="width: 800px" label="联系电话" prop="phoneNumber">
                    <el-input v-model="exchange_data.phoneNumber" placeholder="请输入联系电话"></el-input>
                </el-form-item>
                <el-form-item style="width: 800px" label="所在地区" prop="provinceValue">
                    <el-cascader v-model="exchange_data.provinceValue" placeholder="请选择所在地区" :options="regionData" @change="selectProvince"></el-cascader>
                </el-form-item>
                <el-form-item style="width: 800px" label="寄送地址" prop="address">
                    <el-input v-model="exchange_data.address" type="textarea" maxlength="200" show-word-limit placeholder="请输入寄送地址"></el-input>
                </el-form-item>
                <el-form-item style="width: 800px" label="兑换备注" prop="favRemark">
                    <el-input v-model="exchange_data.favRemark" type="textarea" maxlength="200" :rows="4" show-word-limit placeholder="请输入兑换备注"></el-input>
                </el-form-item>
            </el-form>
            <div class="flex-center exchange-operate">
                <div class="font-600">
                    <span>当前可用积分：</span>
                    <span class="font-FF4A2B">{{ my_assets.pointBalance || 0 }}</span>
                </div>
                <div class="custom-button operate-button" @click="openConfirmExchangeDialog">提交</div>
            </div>
        </div>
    </div>

    <!-- 【我的礼品】弹框 -->
    <el-dialog v-model="my_prize_dialog" width="1000px" :close-on-click-modal="false">
        <el-tabs v-model="prize_active_name" v-loading="prize_loading" size="small" @tab-change="changePrizeActiveName($event, true)">
            <el-tab-pane name="first" label="发放记录">
                <el-table key="first-table" :data="table_list" height="440" :header-cell-style="{ background:'#FFF3E3',color:'#FF8102' }">
                    <el-table-column prop="addDate" align="center" label="发放时间"/>
                    <el-table-column prop="obtainMethod" align="center" label="发放方式"/>
                    <el-table-column prop="issuePoints" align="center" label="发放积分"/>
                    <el-table-column prop="issueRemark" align="center" label="发放备注" show-overflow-tooltip/>
                </el-table>
            </el-tab-pane>
            <el-tab-pane name="second" label="我的礼品">
                <el-table key="second-table" :data="table_list" height="440" :header-cell-style="{ background:'#FFF3E3',color:'#FF8102' }">
                    <el-table-column prop="addDate" align="center" label="兑换时间"/>
                    <el-table-column prop="mallId" align="center" label="兑换编号"/>
                    <el-table-column prop="mallName" align="center" label="礼品名称"/>
                    <el-table-column prop="number" align="center" label="消费积分"/>
                    <el-table-column label="兑换状态" prop="status" align="center">
                        <template #default="scope">
                            <el-button  v-if="scope.row.status == 1" disabled type="info" size="small" >待发放</el-button>
                            <el-button v-else-if="scope.row.status == 2" type="primary" size="small" @click="openPrizeDetailDialog(scope.row)">查看礼品</el-button>
                            <el-button v-else-if="scope.row.status == 3" disabled type="danger" size="small">兑换失败</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
        <template #footer>
            <div class="flex-center" style="justify-content: flex-end;">
                <el-pagination v-model:current-page="prize_params.pageNum" background layout="total, prev, pager, next" :total="prize_params.total" @change="changePrizePage"/>
            </div>
        </template>
    </el-dialog>

    <!-- 活动规则弹框 -->
    <el-dialog v-model="rules_dialog" title="活动规则" center width="1000px">
        <el-scrollbar height="500px">
            <div v-html="rules.dictValue"></div>
        </el-scrollbar>
    </el-dialog>

    <!-- 礼品详情弹框 -->
    <customDialog key="prize-info" class="exchange-dialog" v-model="prize_detail_dialog" width="305px" background_color="transparent">
        <template #background>
            <img class="exchange-background" src="https://pstatic.navi-sci.cn/integral/integral-pop.png" />
        </template>
        <div class="flex-center-col dialog-content">
            <div class="flex-center font-600 exchange-title">提示</div>
            <img class="exchange-img" src="https://pstatic.navi-sci.cn/integral/integral-pop_1.png" />
            <div class="exchange-desc">
                <span>-获得</span>
                <span class="font-FF4A2B">{{prize_detail.remark || '--'}}</span>
                <span>京东锦鲤商城积分-</span>
            </div>
            <div class="exchange-desc">
                <span>卡密：</span>
                <span class="font-FF4A2B">{{prize_detail.exchangeInfo || '--'}}</span>
            </div>
            <div class="exchange-button-box">
                <div class="default-button exchange-button-style" @click="prize_detail_dialog = false">取消</div>
            </div>
        </div>
    </customDialog>
    
    <!-- 确认兑换礼品弹框 -->
    <customDialog key="exchange-prize" class="exchange-dialog" v-model="exchange_dialog" width="305px" background_color="transparent">
        <template #background>
            <img class="exchange-background" src="https://pstatic.navi-sci.cn/integral/integral-pop.png" />
        </template>
        <div class="flex-center-col dialog-content">
            <div class="flex-center font-600 exchange-title">兑换确认</div>
            <img class="exchange-img" src="https://pstatic.navi-sci.cn/integral/integral-pop_1.png" />
            <div class="exchange-desc">
                <span class="font-mini">你本次兑换的奖品是“{{ exchange_prize_info.mallName }}”，消耗积分{{ exchange_prize_info.redeemPoints }}是否确认兑换，兑换后不可取消！（注意：</span>
                <span class="font-mini font-FF4A2B">该奖品会以等比例京东锦鲤商城积分形式发放</span>
                <span class="font-mini">）</span>
            </div>
            <div class="flex-center exchange-button-box">
                <div class="default-button exchange-button-style" @click="exchange_dialog = false">取消</div>
                <div class="custom-button exchange-button-style" @click="confirmExchange">确认</div>
            </div>
        </div>
    </customDialog>
</template>

<style lang="scss" scoped>
.head-box {
    justify-content: space-between;
    width: calc(88vw - 30px);
    min-width: 1238px;
    padding: 15px;
    border-radius: 10px;
    background-color: #FFFFFF90;
    .user-integral {
        justify-content: flex-start;
        column-gap: 15px;
        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
        }
    }
    .button-box {
        column-gap: 15px;
        .button-style {
            width: 100px;
            padding: 3px 0;
        }
    }
}

.integral-mall {
    position: relative;
    width: calc(88vw - 30px);
    min-width: 1238px;
    margin-top: 15px;
    padding: 15px;
    border-radius: 10px;
    background-color: #FFFFFF90;
    .search-box {
        position: relative;
        justify-content: space-between;
        min-height: 32px;
        .integral-level {
            justify-content: space-between;
            width: 660px;
            .level {
                cursor: default;
                user-select: none;
                width: 150px;
                height: 30px;
                border: 1px solid #CCCCCC;
                border-radius: 3px;
            }
            .level-active {
                color: #FF8D18;
                border-color: #FCBA5D;
                background-color: #FCBA5D90;
            }
        }
        
    }
    .back-button {
        position: absolute;
        left: 0;
        width: 120px;
        height: 30px;
    }
    
    .mall-list {
        flex-wrap: wrap;
        gap: 15px;
        justify-content: flex-start;
        align-items: flex-start;
        perspective: 1000px;
        perspective-origin: center center;
        width: calc(88vw - 60px);
        min-width: 1208px;
        margin-top: 15px;
        min-height: calc(100vh - 200px);
        @keyframes prize-card-hover {
            0% {
                transform: translateZ(0);
                box-shadow: none;
            }
            100% {
                transform: translateZ(5px);
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.8);
            }
        }
        .prize-card {
            overflow: hidden;
            width: calc((88vw - 135px) / 6);
            min-width: 188.5px;
            padding-bottom: 15px;
            border: 1px solid #FF5000;
            border-radius: 10px;
            background-color: #FFFFFF;
            .prize-img {
                width: calc((88vw - 135px) / 6);
                min-width: 188.5px;
                height: calc((88vw - 135px) / 6);
                min-height: 188.5px;
                vertical-align: middle;
            }
            .info-box {
                cursor: default;
                justify-content: space-between;
                width: calc((88vw - 135px) / 6);
                min-width: 188.5px;
                padding: 10px;
                .text-ellipsis-1 {
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    width: 65%;
                }
                .text-ellipsis-2 {
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    width: 50%;
                }
            }
            .exchange-button {
                cursor: default;
                user-select: none;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 70%;
                height: 30px;
                color: #FFFFFF;
                font-weight: 600;
                border-radius: 3px;
                background-image: linear-gradient(to right, #9FFFD7, #BAFF75);
                background-image: linear-gradient( to right, #FE944A, #F87315);
            }
        }
        .prize-card:hover {
            animation: prize-card-hover 0.2s linear forwards;
        }
    }
    .mall-list-null {
        width: calc(88vw - 60px);
        min-width: 1208px;
        margin-top: 15px;
        min-height: calc(100vh - 200px);
    }
}

.exchange-prize-info {
    margin-bottom: 15px;
    padding: 0 50px;
    border-radius: 5px;
    background-color: #FFF8F2;
    .info-head {
        justify-content: space-between;
        border-bottom: 2px solid #FFBD8F;
        .head-th {
            flex: 2;
            height: 80px;
        }
        .head-th:first-child {
            flex: 3;
        }
    }
    .info-content {
        justify-content: space-between;
        .content-td {
            flex: 2;
            height: 140px;
            .prize-name {
                width: calc(100% - 110px);
            }
            img {
                width: 80px;
                height: 80px;
                margin-right: 10px;
            }
        }
        .content-td:first-child {
            flex: 3;
        }
    }
}

.exchange-operate {
    justify-content: space-between;
    width: 100%;
    height: 60px;
    padding: 0 15px;
    border-radius: 5px;
    background-color: #FFF8F2;
    .operate-button {
        width: 120px;
        height: 35px;
    }
}

.exchange-dialog {
    .exchange-background {
        width: 305px;
    }
    .dialog-content {
        position: relative;
        justify-content: flex-start;
        width: 305px;
        height: 330px;
        padding: 0 15px;
        .exchange-title {
            height: 30px;
            color: #832604;
        }
        .exchange-img {
            width: 110px;
            height: 90px;
        }
        .exchange-desc{
            margin-top: 10px;
            color: #882F0E;
        }
        .exchange-button-box {
            position: absolute;
            column-gap: 15px;
            bottom: 30px;
            .exchange-button-style {
                width: 90px;
                height: 30px;
                font-weight: normal;
            }
        }
    }
}
</style>