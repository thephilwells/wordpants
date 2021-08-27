/* eslint-disable no-param-reassign */
export default function placeSplashImage(
  context,
  splashCanvas,
  gameCanvas,
  header,
  button
) {
  const splashImage = new Image()
  splashImage.onload = () => {
    context.drawImage(splashImage, 0, 0, gameCanvas.width, gameCanvas.height)
  }
  splashImage.src = '/img/wordpantssplash.png'

  splashCanvas.addEventListener(
    'click',
    () => {
      splashCanvas.style.display = 'none'
      gameCanvas.style.visibility = 'visible'
      header.style.visibility = 'visible'
      button.style.visibility = 'visible'
    },
    false
  )
}
