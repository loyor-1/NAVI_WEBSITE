<script setup>

const props = defineProps(['team_name'])

</script>

<template>
    <div>
        <div>尊敬的用户:</div>
        <div style="text-indent: 2em; margin-top: 10px;">欢迎您使用湖南纳微新材料科技有限公司（以下简称“纳微创新”）提供的免审核授权服务。本协议旨在明确您作为团队资源管理者与纳微创新之间的权利和义务，确保双方合作愉快且高效。</div>
        <div>
            <div style="margin-top: 10px; font-weight: 800;">一、服务介绍</div>
            <div style="text-indent: 2em; margin-top: 10px;">本协议是纳微创新用户（以下简称“用户”或“您”）与纳微创新就付款授权服务等相关事项所订立的有效合约。当您通过纳微官方平台或纳微微信小程序接受本协议时，即表明您已阅读并同意接受本协议的所有条款，并愿意受这些条款的约束。在接受本协议前，请务必仔细阅读其全部内容；如果您对任何条款存在疑问或不解之处，建议联系纳微创新官方热线（400-168-0661），我们的客服团队将竭诚为您提供帮助和解释。</div>
        </div>
        <div>
            <div style="margin-top: 10px; font-weight: 800;">二、授权内容</div>
            <div style="text-indent: 2em; margin-top: 10px;">鉴于您作为团队的管理者（团长/管理员），根据相关法律法规的规定，现特此授予纳微创新如下权限：</div>
            <ul>
                <li>您可向所在团队成员授权使用您的团队名为： <span style="color: red; font-weight: 800;">{{ team_name }}</span>的团队账户余额及信用额度进行交易。</li>
                <li>免审核额度设定范围为人民币1元至10,000元。在该数值范围内，您可设置的具体金额允许团队所有成员在此额度以下无需额操作审核即可提交检测订单。</li>
                <li>对于超出上述额度的检测订单，则需经过您或团管理员的审核（可通过“我的团队-支付审核”查看待审订单）。</li>
                <li>所有涉及扣款的交易订单信息将在“我的-团队订单”中清晰展示。</li>
            </ul>
        </div>
        <div>
            <div style="margin-top: 10px; font-weight: 800;">三、授权期限</div>
            <div style="text-indent: 2em; margin-top: 10px;">本授权自生效日起立即生效。若您希望终止本服务，须确保不存在未完结的交易订单或其他未解决的付款义务等条件，具体要求以实际情况为准。</div>
        </div>
        <div>
            <div style="margin-top: 10px; font-weight: 800;">四、其他条款</div>
            <div>
                <div>
                    <div style="margin-top: 10px; font-weight: 800;">4.1 更新通知</div>
                    <div style="text-indent: 2em; margin-top: 10px;">为了不断优化用户体验，我们将持续提供服务更新，包括但不限于版本升级、功能增强和规则调整。本协议亦可能随之更新。我们会通过公告、客户端提示、短信或弹窗等方式提前告知您关于协议更新的信息。若您不同意更新后的条款，有权选择停止使用服务；经双方协商一致后，也可对服务及相关条款作出相应变更。</div>
                </div>
                <div>
                    <div style="margin-top: 10px; font-weight: 800;">4.2 争议解决</div>
                    <div style="text-indent: 2em; margin-top: 10px;">若双方在履行本协议过程中产生争议，应首先尝试友好协商解决；如协商不成，任一方均有权向被告所在地具有管辖权的法院提起诉讼。</div>
                </div>
                <div>
                    <div style="margin-top: 10px; font-weight: 800;">4.3 法律适用</div>
                    <div style="text-indent: 2em; margin-top: 10px;">本协议的成立、效力、解释及执行均受中华人民共和国法律管辖。对于法律未明确规定的内容，应遵循纳微创新公司制定的相关业务规则及通行商业惯例。本协议未尽事宜依据《纳微创新服务协议》及其附属规则处理；若本协议与《纳微创新服务协议》及其他附属规则存在冲突，以本协议为准。</div>
                </div>
            </div>
        </div>
        <div style="margin-top: 10px; font-weight: 800;">感谢您选择纳微创新的服务，期待为您提供更优质的支持！</div>
    </div>
</template>