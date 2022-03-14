import axios from 'axios'

async function symb(args: string[]) {
  const mesg = args
  const resp = mesg[0]
  var options: any = {
    method: 'GET',
    url: 'https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v6/finance/autocomplete',
    params: { query: resp, lang: 'en' },
    headers: {
      'x-rapidapi-host': 'stock-data-yahoo-finance-alternative.p.rapidapi.com',
      'x-rapidapi-key': process.env.YAHOO_FA_TOKEN!,
    },
  }
  var data: any
  await axios
    .request(options)
    .then((res) => {
      if (true) {
        data = [...res.data['ResultSet']['Result']]
          .map((result) => result['symbol'] + ' => ' + result['name'])
          .join('\n')
      }
      // } else {
      //   data = [...res.data['ResultSet']['Result']][0].symbol
      // }
    })
    .catch((err) => (data = 'symbol not found'))

  return data
}

export default symb
