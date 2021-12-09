// Calculate how much time passed (ex. 10seconds, 5 hours, 3 days, 25weeks)
const timeDifference = (target: number, now = new Date().getTime()) => {
  // https://stackoverflow.com/questions/9873197/how-to-convert-date-to-timestamp
  let difference = target - now

  const daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24)
  difference -= daysDifference * 1000 * 60 * 60 * 24

  const hoursDifference = Math.floor(difference / 1000 / 60 / 60)
  difference -= hoursDifference * 1000 * 60 * 60

  const minutesDifference = Math.floor(difference / 1000 / 60)
  difference -= minutesDifference * 1000 * 60

  const secondsDifference = Math.floor(difference / 1000)

  // just an example, later on oculd be extended to calculate time difference (trying to avoid any external libs for this matter)
  let amount = secondsDifference
  let timeType = 'second'
  if (minutesDifference > 0) {
    timeType = 'minute'
    amount = minutesDifference
  }
  if (hoursDifference > 0) {
    timeType = 'hour'
    amount = hoursDifference
  }
  if (daysDifference > 0) {
    timeType = 'day'
    amount = daysDifference
  }
  if (daysDifference > 7) {
    timeType = 'week'
    amount = Math.round(daysDifference / 7)
  }

  return `${amount} ${timeType}${amount > 1 ? 's' : ''} ago`
}

export {
  timeDifference
}