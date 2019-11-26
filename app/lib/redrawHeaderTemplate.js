export default function redrawHeaderTemplate(headerCanvas) {
  const headerContext = headerCanvas.getContext('2d')

  // draw speech bubble
  const pi2 = Math.PI * 2 // 360 deg.
  const r = 5
  const w = headerCanvas.width * 0.75 - 20
  const h = headerCanvas.height / 0.87 - headerCanvas.height / 5

  // draw rounded rectangle
  headerContext.beginPath()
  headerContext.arc(r + 5, r + 2, r, pi2 * 0.5, pi2 * 0.75) // top-left
  headerContext.arc(r + w - r * 2 + 5, r + 2, r, pi2 * 0.75, pi2) // top-right
  headerContext.lineTo(r + w - r * 2 + 10, r + 2 + 20)
  headerContext.lineTo(r + w - r * 2 + 20, r + 2 + 25)
  headerContext.stroke()
  headerContext.lineTo(r + w - r * 2 + 10, r + 2 + 30)
  headerContext.stroke()
  headerContext.arc(r + w - r * 2 + 5, r + h - r * 2 + 2, r, 0, pi2 * 0.25) // bottom-right
  headerContext.arc(r + 5, r + h - r * 2 + 2, r, pi2 * 0.25, pi2 * 0.5) // bottom-left
  headerContext.arc(r + 5, r + 2, r, pi2 * 0.5, pi2 * 0.75) // top-left
  headerContext.stroke()
  headerContext.closePath()
}
