export function timeFormat(time) { 
	const day = Math.floor(time / (24 * 3600))
	const hours = Math.floor(time % (24 * 3600) / 3600) < 10 ? '0' + Math.floor(time % (24 * 3600) / 3600) : Math.floor(time % (24 * 3600) / 3600)
	const minutes = Math.floor(time % (24 * 3600) % 3600 / 60) < 10 ? '0' + Math.floor(time % (24 * 3600) % 3600 / 60) : Math.floor(time % (24 * 3600) % 3600 / 60)
	const seconds = (time % 60) < 10 ? '0' + time % 60 : time % 60
	return {day,hours,minutes,seconds}
}

export const encryptionPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) {
        return phoneNumber
    }
    // 根据长度处理
    if (phoneNumber.length === 11) {
        // 11位手机号，替换中间四个星号
        return phoneNumber.substring(0, 3) + "****" + phoneNumber.substring(7)
    } else {
        // 其他长度，中间替换长度-2个星号
        if (phoneNumber.length <= 2) {
            return "*".repeat(phoneNumber.length)
        } else {
            let numAsterisks = phoneNumber.length - 2
            let part1Length = (phoneNumber.length - numAsterisks) / 2
            let part2Start = part1Length + numAsterisks
            let asterisks = "*".repeat(numAsterisks)
            return (
                phoneNumber.substring(0, part1Length) +
                asterisks +
                phoneNumber.substring(part2Start)
            )
        }
    }
}