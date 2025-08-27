/**
 * 校验手机号格式（国内手机号规则）
 * @param {string|number} phone - 待校验的手机号（支持字符串、数字，或含非数字的字符串）
 * @returns {Object} 校验结果：{ valid: boolean, message: string }
 */
export function validPhone(phone) {
    // 1. 过滤输入中的非数字字符（处理用户误输入的空格、横杠等）
    const pure_phone = String(phone).replace(/\D/g, '');

    // 2. 基础校验：长度必须为 11 位
    if (pure_phone.length !== 11) {
        return {
            valid: false,
            message: '手机号必须为 11 位数字'
        };
    }

    // 3. 号段校验：匹配国内合法手机号开头（13/14/15/16/17/18/19）
    // 正则说明：^1 开头，第二位为 3-9（覆盖所有合法号段），后续 9 位为数字
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(pure_phone)) {
        return {
            valid: false,
            message: '请输入正确的手机号格式'
        };
    }

    // 4. 校验通过
    return {
        valid: true,
        message: ''
    };
}