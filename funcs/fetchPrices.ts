import axios, { AxiosRequestConfig } from 'axios'

export default async function fetchPrices(params?: {
  symbols?: string
  range?: string
  interval?: string
}) {
  const options: AxiosRequestConfig = {
    method: 'GET',
    url: 'https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v6/finance/quote',
    params: params,
    headers: {
      'x-rapidapi-host': 'stock-data-yahoo-finance-alternative.p.rapidapi.com',
      'x-rapidapi-key': process.env.YAHOO_FA_TOKEN!,
    },
  }

  let data: any

  try {
    const response = await axios.request(options)
    data = ''

    let first = response.data['quoteResponse']['result']

    for (let i = 0; i < first.length; i++) {
      data += `${first[i]['shortName']}: ${first[i]['regularMarketPrice']} \n${first[i]['regularMarketDayRange']} \n\n`
    }

    return data
  } catch (err) {
    return err
  }
}
