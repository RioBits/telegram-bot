export default function executeAfterMilliseconds(
  callback: () => void,
  milliseconds: number
) {
  setInterval(() => {
    callback()
  }, milliseconds)
}
