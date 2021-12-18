import axios from 'axios'
async function fnArgs(match:any) {
  var prompt: any = match![1].split(" ")
  var symbol     = prompt[0] || "TRY=X//"
  const range    = prompt[1] || "4h"
  const interval = prompt[2] || "30m"
  var listed = ([...prompt].pop() === "-list" ? true : false)
  if (listed) {prompt.pop()}


  if (prompt[0].toUpperCase() === "ETH" || prompt[0].toUpperCase() === "BTC") {
    symbol = prompt[0].toUpperCase() + "-USD"
  } else if (prompt[0].toUpperCase() === "TRY") {
    symbol = prompt[0].toUpperCase() + "=X"
  } else {
    symbol = prompt[0].toUpperCase()
  }
  

  var data:any
  var options:any = {
    method: 'GET',
    url: 'https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v8/finance/spark',
    params: {symbols: symbol, range: range, interval: interval},
    headers: {
      'x-rapidapi-host': 'stock-data-yahoo-finance-alternative.p.rapidapi.com',
      'x-rapidapi-key': '27f4a46847mshdb18aa5242e2e64p1fa70fjsnce9d0b4b1087'
    }
  };

  await axios.request(options)
    .then( res => {
      let first = res.data[`${symbol}`]["close"]
      if (listed) {
        data = `${symbol} (${range} - ${interval}) ${[...first].map(num => '\n' + num)}`
      } else {
        data = `${symbol} (${range} - ${interval}) ${[...first].map(num => ' | ' + num)}`
      }
    })
    .catch( err => data = 'either the symbol is wrong or the interval is wrong \nintervals: \n  1m, 2m, 5m, 15m, 30m\n  60m, 90m, 120m, 4h\n  1d, 5d, 1wk, 1mo, 3mo\n' + err)
    return data
}

export default fnArgs
