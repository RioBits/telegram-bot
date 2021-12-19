export function withCommas(value: string) {
  return Number(value).toLocaleString('en-us')
}
