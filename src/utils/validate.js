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

//发票抬头
export function validInvoiceTitle(value) {
  return /\s/.test(value)
}

//企业税号
export function validEnterpriseTax(value) {
  return /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/.test(value)
}

//开户行账号
export function validOpenBankAccount(value) {
  return /^\d{12,25}$/.test(value)
}

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
    return /^(https?:|mailto:|tel:)/.test(path)
  }
  
  /**
   * @param {string} str
   * @returns {Boolean}
   */
  export function validUsername(str) {
    const valid_map = ['admin', 'editor']
    return valid_map.indexOf(str.trim()) >= 0
  }
  
  /**
   * @param {string} url
   * @returns {Boolean}
   */
  export function validURL(url) {
    const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
    return reg.test(url)
  }
  
  /**
   * @param {string} str
   * @returns {Boolean}
   */
  export function validLowerCase(str) {
    const reg = /^[a-z]+$/
    return reg.test(str)
  }
  
  /**
   * @param {string} str
   * @returns {Boolean}
   */
  export function validUpperCase(str) {
    const reg = /^[A-Z]+$/
    return reg.test(str)
  }
  
  /**
   * @param {string} str
   * @returns {Boolean}
   */
  export function validAlphabets(str) {
    const reg = /^[A-Za-z]+$/
    return reg.test(str)
  }
  
  /**
   * @param {string} email
   * @returns {Boolean}
   */
  export function validEmail(email) {
    const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return reg.test(email)
  }

  /**
   * @param {string} isIdentity
   * @returns {Boolean}
   */
  export function isIdentity(isIdentity) {
    const reg = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
    return reg.test(isIdentity)
  }

  /**
   * @param {string} isIdentity_taiwan
   * @returns {Boolean}
   */
    export function isIdentity_taiwan(value) {
      const old_taiwan_regex = /^[A-Z][12]\d{8}$/
      const new_taiwan_regex = /^[A-Z][89]\d{8}$/;
      return old_taiwan_regex.test(value) || new_taiwan_regex.test(value)
    }

  /**
   * 手机号码
   * @param {*} s
   */
  export function isMobile (s) {
    return /^1[3-9]\d{9}$/.test(s)
  }

  /**
   * 座机号码
   * @param {*} s
   */
    export function isLandline (s) {
      return /^\d{3,4}-?\d{7,8}$/.test(s)
    }
  
  /**
   * 统一信用代码
   * @param {*} s
   */
  export function isSCN (s) {
    return /^[^_IOZSVa-z\W]{2}\d{6}[^_IOZSVa-z\W]{10}$/g.test(s)
  }
  
  /**
   * 电话号码
   * @param {*} s
   */
  export function isPhone (s) {
    return /^([0-9]{3,4}-)?[0-9]{7,8}$/.test(s)
  }
  /**
   * @param {string} str
   * @returns {Boolean}
   */
  export function isString(str) {
    if (typeof str === 'string' || str instanceof String) {
      return true
    }
    return false
  }
  
  /**
   * @param {Array} arg
   * @returns {Boolean}
   */
  export function isArray(arg) {
    if (typeof Array.isArray === 'undefined') {
      return Object.prototype.toString.call(arg) === '[object Array]'
    }
    return Array.isArray(arg)
  }