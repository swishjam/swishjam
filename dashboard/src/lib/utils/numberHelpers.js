const randomNumberBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const formatMoney = (amount) => ((amount || 0) / 100)?.toLocaleString('en-US', { style: "currency", currency: "USD" })
const formatShrinkMoney = (amount) => formatShrinkNumbers(((amount || 0) / 100));
const formatNumbers = num => num?.toLocaleString('en-US') || 0;
const formatShrinkNumbers = num => {
  // Uses: the charts need to have small numbers on the Y axis and this will help with that
  let t = 0; 
  if (num >= 1000000000) {
    t = (num / 1000000000);
    return t.toString().length > 2 ? t.toString().substring(0,3)+'B':t.toFixed(1) + 'B';
  } else if (num >= 1000000) {
    t = (num / 1000000);
    return t.toString().length > 2 ? t.toString().substring(0,3)+'M':t.toFixed(1) + 'M';
  } else if (num >= 1000) {
    t = (num / 1000)
    return t.toString().length > 2 ? t.toString().substring(0,3)+'K':t.toFixed(1) + 'K';
  } else {
    return num.toString();
  }
}

export { randomNumberBetween, formatMoney, formatNumbers, formatShrinkNumbers, formatShrinkMoney }