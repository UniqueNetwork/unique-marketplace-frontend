// Calculate how much time passed (ex. 10seconds, 5 hours, 3 days, 25weeks)
const timeDifference = (when: number, sinceWhen: number | null = null) => {
  const first = sinceWhen || new Date().getTime() / 1000;
  const second = when;
  // https://stackoverflow.com/questions/16767301/calculate-difference-between-2-timestamps-using-javascript
  let difference = Math.abs(first - second) * 1000;

  const daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);

  difference -= daysDifference * 1000 * 60 * 60 * 24;

  const hoursDifference = Math.floor(difference / 1000 / 60 / 60);

  difference -= hoursDifference * 1000 * 60 * 60;

  const minutesDifference = Math.floor(difference / 1000 / 60);

  difference -= minutesDifference * 1000 * 60;

  const secondsDifference = Math.floor(difference / 1000);
  // just an example, later on oculd be extended to calculate time difference (trying to avoid any external libs for this matter)

  const getUnit = (type: 'day' | 'hr' | 'min' | 'sec', plural: boolean) => {
    return `${type}${plural ? 's' : ''}`;
  };

  if (daysDifference >= 1) {
    return `${daysDifference} ${getUnit('day', daysDifference > 1)} ${hoursDifference} ${getUnit('hr', hoursDifference > 1)}`;
  }

  if (hoursDifference >= 1) {
    return `${hoursDifference} ${getUnit('hr', hoursDifference > 1)} ${minutesDifference} ${getUnit('min', minutesDifference > 1)}`;
  }

  if (minutesDifference >= 1) {
    return `${minutesDifference} ${getUnit('min', minutesDifference > 1)} ${secondsDifference} ${getUnit('sec', secondsDifference > 1)}`;
  }

  if (secondsDifference < 1) return 'Less than a second';

  return `${secondsDifference} ${getUnit('sec', minutesDifference > 1)}`;
};

const timestampTableFormat = (timestamp: number) => new Date(timestamp).toLocaleString('en-GB', {
  hour12: false
}).replaceAll('/', '-');

export { timeDifference, timestampTableFormat };
