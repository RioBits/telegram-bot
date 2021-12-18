import axios from 'axios'

async function symb(match:any) {
  const mesg = match![1].split(' ')
  const resp = mesg[0]
  var options: any = {
    method: 'GET',
    url: 'https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v6/finance/autocomplete',
    params: { query: resp, lang: 'en' },
    headers: {
      'x-rapidapi-host': 'stock-data-yahoo-finance-alternative.p.rapidapi.com',
      'x-rapidapi-key': '27f4a46847mshdb18aa5242e2e64p1fa70fjsnce9d0b4b1087',
    },
  }
  var data: any
  await axios
    .request(options)
    .then((res) => {
      if (true) {
        data = (
          [...res.data['ResultSet']['Result']]
          .map(result => result["symbol"] + ' => ' + result["name"]).join('\n')
        )
      }
      // } else {
      //   data = [...res.data['ResultSet']['Result']][0].symbol
      // }
    })
    .catch((err) => (data = 'symbol not found'))

  return data
}

export default symb