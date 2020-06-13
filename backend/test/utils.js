const moment = require("moment");

function genCpf() {
  const part1 = ("" + Math.floor(Math.random() * 999)).padStart(3, '0');
  const part2 = ("" + Math.floor(Math.random() * 999)).padStart(3, '0');
  const part3 = ("" + Math.floor(Math.random() * 999)).padStart(3, '0');
  const dig1 = ("" + Math.floor(Math.random() * 9)).padStart(1, '0');
  const dig2 = ("" + Math.floor(Math.random() * 9)).padStart(1, '0');

  return `${part1}.${part2}.${part3}-${dig1}${dig2}`;
}
function formatDateTime(date) {
  return moment(date).format("MMM Do YYYY h:mm:ss a");
}

module.exports = { genCpf, formatDateTime }