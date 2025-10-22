export function timeFormat(time) { 
	const day = Math.floor(time / (24 * 3600))
	const hours = Math.floor(time % (24 * 3600) / 3600) < 10 ? '0' + Math.floor(time % (24 * 3600) / 3600) : Math.floor(time % (24 * 3600) / 3600)
	const minutes = Math.floor(time % (24 * 3600) % 3600 / 60) < 10 ? '0' + Math.floor(time % (24 * 3600) % 3600 / 60) : Math.floor(time % (24 * 3600) % 3600 / 60)
	const seconds = (time % 60) < 10 ? '0' + time % 60 : time % 60
	return {day,hours,minutes,seconds}
}