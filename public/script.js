/* eslint-env browser */
import getPuzzleData from './lib/puzzleData'
import redrawHeaderTemplate from './lib/redrawHeaderTemplate'
import setCanvasMobileBreakpoint from './lib/setCanvasMobileBreakpoint'
import placeSplashImage from './lib/placeSplashImage'
import log from './lib/logger'

// draw the canvas in either desktop or mobile size, setting size values
const {
  canvas,
  headerCanvas,
  buttonCanvas,
  splashCanvas,
  context,
  headerContext,
  buttonContext,
  splashContext,
} = setCanvasMobileBreakpoint(600)

// on first load, display the splash image on the canvas
// on click, the splash disappears and the game canvasses appear
// TODO: replace with a modal, or moment, or something i guess
placeSplashImage(
  splashContext,
  splashCanvas,
  canvas,
  headerCanvas,
  buttonCanvas
)

let drawing = false
let winScreen = false
let score
const color = 'black'
const size = canvas.width / 240
let squigglePixels = []
let collisionPixels = []
const waistline = canvas.height / 6
let highestPixelValue
let lowestPixelValue
let puzzleNumber = 0
let idealPathPixels = []
let puzzleData = getPuzzleData(puzzleNumber)
let letterX = canvas.width / 12
let allCollisionXs = []
const leftEdge = canvas.width / 24
const rightEdge = canvas.width - leftEdge
const halfway = canvas.width / 2

redrawHeaderTemplate(headerCanvas)
calmJean()
redrawBoundaries()
drawAnswer()
drawBoundaryTexts()
setHeaderText(`Clue: ${puzzleData.clue}`)

// draw buttons
buttonContext.beginPath()
buttonContext.setLineDash([5, 5])
buttonContext.moveTo(halfway, 0)
buttonContext.lineTo(halfway, buttonCanvas.height)
buttonContext.strokeStyle = 'gray'
buttonContext.stroke()
buttonContext.fillStyle = 'gray'
buttonContext.font = `25px Arial`
buttonContext.textAlign = 'center'
buttonContext.textBaseline = 'middle'
buttonContext.fillText('RESTART', buttonCanvas.width * 0.25, 25)
buttonContext.fillText('SUBMIT', buttonCanvas.width * 0.75, 25)

// handle button taps and clicks
function isInside(pos, rect) {
  return (
    pos[0] > rect.x &&
    pos[0] < rect.x + rect.width &&
    pos[1] < rect.y + rect.height &&
    pos[1] > rect.y
  )
}

const restartRect = {
  x: 0,
  y: 0,
  width: buttonCanvas.width / 2,
  height: buttonCanvas.height,
}

const submitRect = {
  x: buttonCanvas.width / 2,
  y: 0,
  width: buttonCanvas.width / 2,
  height: buttonCanvas.height,
}

buttonCanvas.addEventListener(
  'click',
  event => {
    if (isInside(canvasXYFromEvent(event, buttonCanvas), submitRect)) {
      handleSubmit()
    } else if (isInside(canvasXYFromEvent(event, buttonCanvas), restartRect)) {
      handleRestart()
    }
  },
  false
)

function calmJean() {
  // draw jean in header
  const jeanImage = new Image()
  jeanImage.onload = () => {
    headerContext.drawImage(
      jeanImage,
      headerCanvas.width - headerCanvas.width / 4 - 2,
      2,
      headerCanvas.width / 4,
      headerCanvas.height / 0.87 - headerCanvas.height / 5
    )
  }
  jeanImage.src = '/img/BlueJeanWithEyes.png'
}

function shockJean() {
  // draw jean in header
  const jeanImage = new Image()
  jeanImage.onload = () => {
    headerContext.drawImage(
      jeanImage,
      headerCanvas.width - headerCanvas.width / 4 - 2,
      2,
      headerCanvas.width / 4,
      headerCanvas.height / 0.87 - headerCanvas.height / 5
    )
  }
  jeanImage.src = '/img/BlueJeanWithBigEyes.png'
}

function drawAnswer() {
  // draw answer
  context.strokeStyle = 'black'
  context.font = `${canvas.height / 5}px Arial`
  context.textAlign = 'left'
  const initialLetterX = letterX
  puzzleData.answer.split('').forEach(letter => {
    context.fillText(letter, letterX, canvas.height / 4.8, canvas.width / 6)
    letterX += canvas.width / 6
  })
  letterX = initialLetterX

  // get letter pixels below waistline
  collisionPixels = getCollisionPixels(puzzleData.answer)

  // calculate ideal path from collision pixels
  getIdealPathPixels()
}

function drawBoundaryTexts() {
  // draw drawing area
  context.strokeStyle = 'light gray'
  context.font = `10px Arial`
  context.textAlign = 'center'
  context.fillText('DRAW BELOW THIS LINE', halfway, canvas.height / 2 - 5)

  // draw start label
  context.save()
  context.translate(
    leftEdge - canvas.width / 80,
    canvas.height - canvas.width / 4
  )
  context.rotate(-0.5 * Math.PI)
  var rText = 'START HERE'
  context.fillText(rText, 0, 0)
  context.restore()

  // draw end label
  context.save()
  context.translate(
    canvas.width - canvas.width / 80,
    canvas.height - canvas.width / 4
  )
  context.rotate(-0.5 * Math.PI)
  var rText = 'END HERE'
  context.fillText(rText, 0, 0)
  context.restore()
}

function setHeaderText(text) {
  headerContext.clearRect(0, 0, headerCanvas.width, headerCanvas.height)
  redrawHeaderTemplate(headerCanvas)
  headerContext.textAlign = 'center'
  headerContext.font = `${headerCanvas.height / 6}px Arial`
  headerContext.fillText(
    text,
    (headerCanvas.width * 0.75 - canvas.width / 40) / 2,
    headerCanvas.height / 0.87 -
      headerCanvas.height / 5 -
      headerCanvas.height / 2.5
  )
}

function redrawBoundaries() {
  context.clearRect(
    0,
    lowestPixelValue,
    canvas.width,
    canvas.height - lowestPixelValue
  )

  // draw dashed waistline
  context.beginPath()
  context.setLineDash([])
  context.moveTo(0, waistline - 3)
  context.lineTo(canvas.width, waistline - 3)
  context.strokeStyle = 'blue'
  context.stroke()

  // draw start area
  context.beginPath()
  context.setLineDash([5, 15])
  context.moveTo(leftEdge, waistline)
  context.lineTo(leftEdge, canvas.height)
  context.strokeStyle = 'green'
  context.stroke()

  // draw end area
  context.beginPath()
  context.setLineDash([5, 15])
  context.moveTo(rightEdge, waistline)
  context.lineTo(rightEdge, canvas.height)
  context.strokeStyle = 'green'
  context.stroke()

  // draw drawing area boundary
  context.beginPath()
  context.setLineDash([5, 15])
  context.moveTo(0, halfway)
  context.lineTo(canvas.width, halfway)
  context.strokeStyle = 'gray'
  context.stroke()
}

window.addEventListener(
  'click',
  function(event) {
    if (event.target.id === 'submit') {
      handleSubmit()
    }
  },
  false
)

// Set up touch events for mobile, etc
canvas.addEventListener('touchstart', function(event) {
  event.preventDefault()
  if (event.target === canvas) {
    calmJean()
    drawing = true
    handlePenDown(getTouchPos(canvas, event).x, getTouchPos(canvas, event).y)
  }
})

canvas.addEventListener('touchend', function(event) {
  event.preventDefault()
  if (drawing === true) {
    drawing = false
    handlePenUp(getTouchPos(canvas, event).x, getTouchPos(canvas, event).y)
  }
})

canvas.addEventListener('touchmove', function(event) {
  event.preventDefault()
  if (drawing === true) {
    handlePenMove(getTouchPos(canvas, event).x, getTouchPos(canvas, event).y)
  }
})

window.addEventListener(
  'mousedown',
  function(event) {
    event.preventDefault()
    if (event.target === canvas) {
      drawing = true
      handlePenDown(...canvasXYFromEvent(event, canvas))
    }
  },
  false
)

window.addEventListener(
  'mousemove',
  function(event) {
    event.preventDefault()
    if (drawing === true) {
      handlePenMove(...canvasXYFromEvent(event, canvas))
    }
  },
  false
)

window.addEventListener(
  'mouseup',
  function(event) {
    event.preventDefault()
    if (drawing === true) {
      drawing = false
      handlePenUp(...canvasXYFromEvent(event, canvas))
    }
  },
  false
)

function canvasXYFromEvent(event, canvas) {
  const { x, y } = canvas.getBoundingClientRect()
  const clientX =
    event.clientX || (event.targetTouches[0] && event.targetTouches[0].clientX)
  const clientY =
    event.clientY || (event.targetTouches[0] && event.targetTouches[0].clientY)
  return [clientX - x, clientY - y]
}

function getTouchPos(canvasDom, touchEvent) {
  const rect = canvasDom.getBoundingClientRect()
  return {
    x:
      touchEvent.touches[0] &&
      ((touchEvent.targetTouches[0].clientX - rect.left) /
        (rect.right - rect.left)) *
        canvasDom.width -
        20,
    y:
      touchEvent.touches[0] &&
      ((touchEvent.targetTouches[0].clientY - rect.top) /
        (rect.bottom - rect.top)) *
        canvasDom.height -
        25,
  }
}

// This code runs when the user presses down the mouse on the canvas (starts drawing)
function handlePenDown(x, y) {
  if (y >= halfway) {
    calmJean()
    placeRectangle(x, y)
    squigglePixels.push({ x, y })
  }
}
// This code runs when the user moves their mouse around while drawing
function handlePenMove(x, y) {
  if (y >= halfway) {
    // console.log('drawing and moving', x, y)
    placeRectangle(x, y)
    squigglePixels.push({ x, y })
  }
}

// This code runs when the user lift up the mouse while drawing (i.e. stops drawing)
function handlePenUp(x, y) {
  // console.log('no longer drawing', x, y)
  // console.log(`squiggle pixels so far: ${JSON.stringify(squigglePixels)}`)
}

function handleSubmit() {
  // console.log('submitted')
  squigglePixels = squigglePixels.filter(pixel => pixel.x >= 0)
  if (winScreen) {
    collisionPixels = []
    allCollisionXs = []
    buttonContext.clearRect(
      buttonCanvas.width / 2,
      0,
      buttonCanvas.width,
      buttonCanvas.height
    )
    buttonContext.fillText('SUBMIT', buttonCanvas.width * 0.75, 25)
    handleRestart()
    winScreen = false
  } else {
    highestPixelValue = getHighestPixelValue()
    lowestPixelValue = getLowestPixelValue()
    if (checkForEnoughSquiggle()) {
      new Audio('whistleup.wav').play()
      pullUpPants()
    } else {
      shockJean()
      setHeaderText('NOT ENOUGH PANTS - FILL IN THE GAPS')
    }
  }
  // context.clearRect(0, 0, canvas.width, canvas.height)
}

function handleRestart() {
    new Audio('whistledown.wav').play()
  squigglePixels = []
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.closePath()
  redrawHeaderTemplate(headerCanvas)
  calmJean()
  redrawBoundaries()
  drawBoundaryTexts()
  drawAnswer()
  collisionPixels = getCollisionPixels(puzzleData.answer)
  idealPathPixels = []
  getIdealPathPixels()
  setHeaderText(`Clue: ${puzzleData.clue}`)
}

function placeRectangle(x, y) {
  context.fillRect(x, y, size, size)
  context.closePath()
  context.fillStyle = color
  context.fill()
}

async function pullUpPants() {
  // clear all pixels beneath lowest pixel on the squiggle, and redraw game board
  redrawBoundaries()
  
  // traverse the squiggle
  for (let i = 0; i < squigglePixels.length; i++) {
    const initialPixels = { x: squigglePixels[i].x, y: squigglePixels[i].y }
    let newPixel = { x: initialPixels.x, y: initialPixels.y - size }
    placeRectangle(newPixel.x, newPixel.y)
    // console.log(`Clearing rectangle at x: ${squigglePixels[i].x - size / 2}, y: ${squigglePixels[i].y + size / 2}, size ${size * 2}x${size * 2}`)
    context.clearRect(
      squigglePixels[i].x - size / 3,
      squigglePixels[i].y + size / 3,
      size * 2,
      size * 2
    )
    squigglePixels[i] = { x: newPixel.x, y: newPixel.y }
  }
  
  // let canvas operations finish
  await sleep(5)
  
  // move the bounds of the squiggle up a bit
  highestPixelValue -= size
  lowestPixelValue -= size
  
  // debug
  // console.log(`WAISTLINE: ${waistline} HIGHEST SQUIGGLE POINT: ${highestPixelValue}`)

  if (highestPixelValue <= waistline) {
    score = calculateCloseness()
    shockJean()
    if (score < 51) {
      setHeaderText(`TIGHT PANTS!! AVERAGE CLOSENESS: ${Math.floor(score)} PIXELS`)
      puzzleNumber += 1
      puzzleData = getPuzzleData(puzzleNumber)
      winScreen = true
      buttonContext.clearRect(
        buttonCanvas.width / 2,
        0,
        buttonCanvas.width,
        buttonCanvas.height
      )
      buttonContext.fillText('NEXT', buttonCanvas.width * 0.75, 25)
    } else {
      setHeaderText(`Too baggy! Average closeness: ${Math.floor(score)} pixels. Try again!`)
        `Too baggy! Average closeness: ${Math.floor(score)}. Try again!`
      )
    }
  } else if (collisionDetected()) {
    shockJean()
    setHeaderText('COLLISION DETECTED!! TRY AGAIN!!')
  } else {
    pullUpPants()
  }
}

function getHighestPixelValue() {
  let highest = 9999
  squigglePixels.forEach(pixel => {
    highest = pixel.y < highest ? pixel.y : highest
  })
  return highest
}

function getLowestPixelValue() {
  let lowest = 0
  squigglePixels.forEach(pixel => {
    lowest = pixel.y > lowest ? pixel.y : lowest
  })
  return lowest
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getCollisionPixels(answer) {
  let offset = canvas.width / 12
  const wordPixels = []
  answer.split('').forEach(letter => {
    const letterPixels = []
    const coords = new Uint32Array(
      context.getImageData(
        offset,
        waistline - 3,
        canvas.height / (canvas.height / 100),
        canvas.height / (canvas.height / 75)
      ).data.buffer
    )
    for (let i = 0; i < coords.length; i++) {
      if (coords[i]) {
        letterPixels.push({
          x: (i % (canvas.width / (canvas.width / 100))) + offset,
          y:
            Math.floor(i / (canvas.height / (canvas.height / 100))) +
            waistline -
            3,
        })
      }
    }
    letterPixels.forEach(pixel => {
      // context.fillRect(pixel.x, pixel.y + 97, 1, 1) // debug
      wordPixels.push(pixel)
    })
    offset += 100
  })
  for (let j = 0; j < wordPixels.length; j++) {
    if (
      !allCollisionXs[wordPixels[j].x] ||
      wordPixels[j].y > allCollisionXs[wordPixels[j].x]
    ) {
      allCollisionXs[wordPixels[j].x] = wordPixels[j].y
    }
  }
  return wordPixels
}

function collisionDetected() {
  const eligibleSquigglePixels = squigglePixels.filter(pixel => {
    return allCollisionXs[Math.floor(pixel.x)] !== undefined
  })
  for (let k = 0; k < eligibleSquigglePixels.length; k++) {
    if (
      eligibleSquigglePixels[k].y <=
        allCollisionXs[Math.floor(eligibleSquigglePixels[k].x)] &&
      Math.floor(eligibleSquigglePixels[k].x) < rightEdge - 5 &&
      Math.floor(eligibleSquigglePixels[k].x) > leftEdge + 5
    ) {
      console.log(
        `!!!!!!!! - Collision detected at [${Math.floor(
          eligibleSquigglePixels[k].x
        )}, ${allCollisionXs[Math.floor(eligibleSquigglePixels[k].x)]}]`
      )
      return true
    }
  }
  return false
}

function getIdealPathPixels() {
  // start of waistline to first filled pixel's X coordinate
  const index = parseInt(Object.keys(allCollisionXs)[0])
  const lowestCollisionX = index
  const highestCollisionX = allCollisionXs.length - 1
  for (let i = leftEdge; i < lowestCollisionX; i++) {
    idealPathPixels.push({ x: i, y: waistline })
  }
  paintItRed()

  let currentX = lowestCollisionX - 1
  let currentY = waistline
  let nextX = currentX + 1
  let nextY = allCollisionXs[nextX]

  for (let b = 0; b < allCollisionXs.length; b++) {
    // determine direction from this pixel to next

    // jump down
    if (nextY - currentY > 5) {
      // fill all y's from here to Y value of nextX
      for (let h = 0; h < nextY - currentY; h++) {
        idealPathPixels.push({ x: currentX, y: currentY + h })
      }
      // currentX = nextX
      currentY = allCollisionXs[currentX]
      nextX = parseInt(Object.keys(allCollisionXs)[b + 1])
      nextY = allCollisionXs[nextX]
      paintItRed()
    }

    // step down and right
    if (nextY - currentY < 7 && nextY - currentY > 0) {
      // fill all y's from here to Y value of nextX
      for (let h = 0; h < nextY - currentY; h++) {
        idealPathPixels.push({ x: currentX, y: currentY + h })
      }
      currentX = nextX
      currentY = allCollisionXs[currentX]
      nextX = parseInt(Object.keys(allCollisionXs)[b + 1])
      nextY = allCollisionXs[nextX]

      paintItRed()
    }

    // straight right
    if (nextY - currentY === 0) {
      // fill all x's from here to x value of nextX
      for (let h = 0; h < nextX - currentX; h++) {
        idealPathPixels.push({ x: currentX + h, y: currentY })
      }
      currentX = nextX
      // currentY = allCollisionXs[currentX]
      nextX = parseInt(Object.keys(allCollisionXs)[b + 1])
      nextY = allCollisionXs[nextX] || waistline

      paintItRed()
    }

    // step up and right
    if (Math.abs(currentY - nextY) < 7 && Math.abs(currentY - nextY > 0)) {
      // fill all y's from here to Y value of nextX
      for (let h = 0; h < nextY - currentY; h++) {
        idealPathPixels.push({ x: currentX, y: currentY + h })
      }
      currentX = nextX
      currentY = allCollisionXs[currentX]
      nextX = parseInt(Object.keys(allCollisionXs)[b + 1])
      nextY = allCollisionXs[nextX] || waistline

      paintItRed()
    }

    // jump up
    if (currentY - nextY > 7) {
      // fill all y's from here to Y value of nextX
      for (let h = 0; h < currentY - nextY; h++) {
        idealPathPixels.push({ x: currentX, y: currentY - h })
      }
      // currentX = nextX
      currentY = allCollisionXs[currentX]
      nextX = parseInt(Object.keys(allCollisionXs)[b + 1])
      nextY = allCollisionXs[nextX]

      paintItRed()
    }

    // move to next pixel chunk
    if (nextX - currentX > 1 || isNaN(nextX)) {
      // fill up Y's if necessary
      if (currentY > waistline) {
        for (let k = 0; k < currentY - waistline; k++) {
          idealPathPixels.push({ x: currentX, y: currentY - k })
        }
        currentY = waistline
        nextX = parseInt(Object.keys(allCollisionXs)[b + 1])
        nextY = allCollisionXs[nextX]
        paintItRed()
      }

      // fill waistline to next letter chunk
      for (let m = 0; m < nextX - currentX; m++) {
        idealPathPixels.push({ x: currentX + m, y: waistline })
      }
      currentX = nextX
      currentY = waistline
      nextX = parseInt(Object.keys(allCollisionXs)[b + 1])
      nextY = allCollisionXs[nextX]

      paintItRed()
    }
  }

  for (let i = highestCollisionX; i < rightEdge; i += 1) {
    idealPathPixels.push({ x: i, y: waistline })
  }
  paintItRed()
  // console.log(idealPathPixels)
}

function calculateCloseness() {
  const distances = []

  // chop out-of-bounds squigglePixels
  squigglePixels = squigglePixels.filter(
    pixel => pixel.x > leftEdge && pixel.x < rightEdge
  )

  const squiggleLength = squigglePixels.length
  const idealLength = idealPathPixels.length
  const diff = Math.abs(idealLength - squiggleLength)
  if (idealLength > squiggleLength) {
    for (let i = 0; i < diff; i += 1) {
      idealPathPixels.splice(Math.random() * idealPathPixels.length, 1)
    }
  }
  if (squiggleLength > idealLength) {
    for (let i = 0; i < diff; i += 1) {
      squigglePixels.splice(Math.random() * squigglePixels.length, 1)
    }
  }
  for (let j = 0; j < squigglePixels.length; j++) {
    distances.push(
      Math.sqrt(
        Math.pow(squigglePixels[j].x - idealPathPixels[j].x, 2) +
          Math.pow(squigglePixels[j].y - idealPathPixels[j].y, 2)
      )
    )
  }
  const avgDistance = distances.reduce((sum, x) => sum + x) / distances.length
  log(`!!!!!!!! - average distance: ${avgDistance}`)
  return avgDistance
}

function paintItRed() {
  /*
  context.fillStyle = "red"
  idealPathPixels.forEach(px => { context.fillRect(px.x, px.y, 1, 1) })
  context.fillStyle = "black"
  */
}

function checkForEnoughSquiggle() {
  let columnsInSquiggle = 0
  for (let i = Math.floor(leftEdge); i < Math.floor(rightEdge); i += 1) {
    if (squigglePixels.filter(pixel => Math.floor(pixel.x) === i).length > 0) {
      columnsInSquiggle += 1
    }
  }
  return columnsInSquiggle / (rightEdge - leftEdge) > 0.5
}
