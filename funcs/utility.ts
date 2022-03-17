export function withCommas(value: string) {
  return Number(value).toLocaleString('en-us')
}

export function executeAfterMilliseconds(
  callback: () => void,
  milliseconds: number
) {
  setInterval(() => {
    callback()
  }, milliseconds)
}
