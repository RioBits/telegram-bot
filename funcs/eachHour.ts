const ONE_HOUR = 1000 * 60 * 60

export default function eachHour(callback: () => void) {
  setInterval(() => {
    callback()
  }, ONE_HOUR)
}
