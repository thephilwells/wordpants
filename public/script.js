const canvas = document.getElementById('canvas')
// const pantsPocket = documnet.getElementById('pants-pocket')
const context = canvas.getContext('2d')

const puzzleAnswer = 'PANTS'

let drawing = false
let score
let brushType = 'rectangle'
let color = 'black'
let size = canvas.width / 120
let squigglePixels = []
let waistline = canvas.height / 6
let highestPixelValue
let puzzleData = getPuzzleData()
let letterX = canvas.width / 12
let allCollisionXs = []
let leftEdge = canvas.width / 24
let rightEdge = canvas.width - leftEdge
let halfway = canvas.width / 2

// draw answer
context.strokeStyle = 'black'
context.font = '120px Arial'

puzzleData.answer.split('').forEach(letter => {
  context.fillText(letter, letterX, canvas.height / 4.8, canvas.width / 6)
  letterX += canvas.width / 6
})

// draw drawing area
context.strokeStyle = 'light gray'
context.font = '12px Arial'
context.textAlign = 'center'
context.fillText('DRAW BELOW THIS LINE', halfway, canvas.height / 2)

redrawBoundaries()

// get letter pixels below waistline
let collisionPixels = getCollisionPixels(puzzleData.answer)

// calculate ideal path from collision pixels
let idealPathPixels = []
getIdealPathPixels()

function redrawBoundaries () {
  // draw dashed waistline
  context.beginPath()
  context.setLineDash([5, 15])
  context.moveTo(0, waistline - 3)
  context.lineTo(600, waistline - 3)
  context.strokeStyle = 'blue'
  context.stroke()

  // draw start area
  context.beginPath()
  context.setLineDash([5, 15])
  context.moveTo(leftEdge, 0)
  context.lineTo(leftEdge, canvas.height)
  context.strokeStyle = 'green'
  context.stroke()

  // draw end area
  context.beginPath()
  context.setLineDash([5, 15])
  context.moveTo(rightEdge, 0)
  context.lineTo(rightEdge, canvas.height)
  context.strokeStyle = 'green'
  context.stroke()

  // draw drawing area boundary
  context.beginPath()
  context.setLineDash([5, 15])
  context.moveTo(0, halfway)
  context.lineTo(600, halfway)
  context.strokeStyle = 'gray'
  context.stroke()
}

window.addEventListener(
  'click',
  function (event) {
    if (event.target.id === 'submit') {
      handleSubmit()
    }
  },
  false
)

// Set up touch events for mobile, etc
canvas.addEventListener(
  'touchstart',
  function (event) {
    event.preventDefault()
    if (event.target === canvas) {
      drawing = true
      handlePenDown(...canvasXYFromEvent(event))
    }
  }
)

canvas.addEventListener(
  'touchend',
  function (event) {
    event.preventDefault()
    if (drawing === true) {
      drawing = false
      handlePenUp(...canvasXYFromEvent(event))
    }
  }
)

canvas.addEventListener(
  'touchmove',
  function (event) {
    event.preventDefault()
    if (drawing === true) {
      handlePenMove(...canvasXYFromEvent(event))
    }
  }
)

window.addEventListener(
  'mousedown',
  function (event) {
    event.preventDefault()
    if (event.target === canvas) {
      drawing = true
      handlePenDown(...canvasXYFromEvent(event))
    }
  },
  false
)

window.addEventListener(
  'mousemove',
  function (event) {
    event.preventDefault()
    if (drawing === true) {
      handlePenMove(...canvasXYFromEvent(event))
    }
  },
  false
)

window.addEventListener(
  'mouseup',
  function (event) {
    event.preventDefault()
    if (drawing === true) {
      drawing = false
      handlePenUp(...canvasXYFromEvent(event))
    }
  },
  false
)

function canvasXYFromEvent (event) {
  const { x, y } = canvas.getBoundingClientRect()
  const clientX = event.clientX || event.targetTouches[0] && event.targetTouches[0].clientX
  const clientY = event.clientY || event.targetTouches[0] && event.targetTouches[0].clientY
  return [clientX - x, clientY - y]
}

// Prevent scrolling when touching the canvas
document.body.addEventListener(
  'touchstart',
  function (e) {
    if (e.target == canvas) {
      e.preventDefault()
    }
  },
  false
)
document.body.addEventListener(
  'touchend',
  function (e) {
    if (e.target == canvas) {
      e.preventDefault()
    }
  },
  false
)
document.body.addEventListener(
  'touchmove',
  function (e) {
    if (e.target == canvas) {
      e.preventDefault()
    }
  },
  false
)

// function handleTouchStart(x, y) {

// }

// function handleTouchMove(x, y) {

// }

// function handleTouchEnd(x, y) {

// }

// This code runs when the user presses down the mouse on the canvas (starts drawing)
function handlePenDown (x, y) {
  if (y >= halfway) {
    placeRectangle(x, y)
    squigglePixels.push({ x, y })
  }
}
// This code runs when the user moves their mouse around while drawing
function handlePenMove (x, y) {
  if (y >= halfway) {
    console.log('drawing and moving', x, y)
    placeRectangle(x, y)
    squigglePixels.push({ x, y })
  }
}

// This code runs when the user lift up the mouse while drawing (i.e. stops drawing)
function handlePenUp (x, y) {
  console.log('no longer drawing', x, y)
  console.log(`squiggle pixels so far: ${JSON.stringify(squigglePixels)}`)
}

function handleSubmit () {
  console.log('submitted')
  if (checkForEnoughSquiggle()) {
    new Audio('whistleup.wav').play()
    pullUpPants()
  } else {
    alert('NOT ENOUGH PANTS - FILL IN THE GAPS')
  }
  // context.clearRect(0, 0, canvas.width, canvas.height)
}

function placeRectangle (x, y) {
  context.fillRect(x - size, y - size, size, size)
  context.closePath()
  context.fillStyle = color
  context.fill()
}

async function pullUpPants () {
  redrawBoundaries()
  highestPixelValue = getHighestPixelValue()
  for (let i = 0; i < squigglePixels.length; i++) {
    context.clearRect(
      squigglePixels[i].x - size,
      squigglePixels[i].y - size,
      size,
      size
    )
    let initialPixels = { x: squigglePixels[i].x, y: squigglePixels[i].y }
    let newPixel = { x: initialPixels.x, y: initialPixels.y - 1 }
    placeRectangle(newPixel.x, newPixel.y)
    squigglePixels[i] = { x: newPixel.x, y: newPixel.y }
  }
  await sleep(0)
  highestPixelValue--
  if (highestPixelValue <= waistline) {
    score = calculateCloseness()
    alert(`TIGHT PANTS!! AVERAGE CLOSENESS: ${score}`)
  } else if (collisionDetected()) {
    alert('COLLISION DETECTED!! REFRESH AND TRY AGAIN!!')
  } else {
    pullUpPants()
  }
}

function getHighestPixelValue () {
  let highest = 9999
  squigglePixels.forEach(pixel => {
    highest = pixel.y < highest ? pixel.y : highest
  })
  return highest
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getPuzzleData () {
  // TODO: get these values from api
  const clue = "Thirsty Doggo's Emissions"
  const answer = puzzleAnswer
  return { clue, answer }
}

function getCollisionPixels (answer) {
  let offset = 50
  let wordPixels = []
  answer.split('').forEach(letter => {
    let letterPixels = []
    let coords = new Uint32Array(
      context.getImageData(offset, waistline - 3, canvas.height / 6, canvas.height / 4.8).data.buffer
    )
    for (let i = 0; i < coords.length; i++) {
      if (coords[i]) {
        letterPixels.push({
          x: (i % 100) + offset,
          y: Math.floor(i / 100) + waistline - 3
        })
      }
    }
    letterPixels.forEach(pixel => {
      // context.fillRect(pixel.x + offset, pixel.y + 97, 1, 1) // debug
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

function collisionDetected () {
  let eligibleSquigglePixels = squigglePixels.filter(pixel => {
    return allCollisionXs[pixel.x] !== undefined
  })
  for (let k = 0; k < eligibleSquigglePixels.length; k++) {
    if (
      eligibleSquigglePixels[k].y <= allCollisionXs[eligibleSquigglePixels[k].x]
    ) {
      return true
    }
  }
  return false
}

function getIdealPathPixels () {
  // start of waistline to first filled pixel's X coordinate
  let index = parseInt(Object.keys(allCollisionXs)[0])
  let lowestCollisionX = index
  let highestCollisionX = allCollisionXs.length - 1
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

  for (let i = highestCollisionX; i < rightEdge; i++) {
    idealPathPixels.push({ x: i, y: waistline })
  }
  paintItRed()
  console.log(idealPathPixels)
}

function calculateCloseness () {
  const distances = []

  // chop out-of-bounds squigglePixels
  squigglePixels = squigglePixels.filter(
    pixel => pixel.x > leftEdge && pixel.x < rightEdge
  )

  let squiggleLength = squigglePixels.length
  let idealLength = idealPathPixels.length
  const diff = Math.abs(idealLength - squiggleLength)
  if (idealLength > squiggleLength) {
    for (let i = 0; i < diff; i++) {
      idealPathPixels.splice(Math.random() * idealPathPixels.length, 1)
    }
  }
  if (squiggleLength > idealLength) {
    for (let i = 0; i < diff; i++) {
      squigglePixels.splice(Math.random() * squigglePixels.length, 1)
    }
  }
  )
  for (let j = 0; j < squigglePixels.length; j++) {
    distances.push(
      Math.sqrt(
        Math.pow(squigglePixels[j].x - idealPathPixels[j].x, 2) +
          Math.pow(squigglePixels[j].y - idealPathPixels[j].y, 2)
      )
    )
  }
  const avgDistance = distances.reduce((sum, x) => sum + x) / distances.length
  console.log(`!!!!!!!! - average distance: ${avgDistance}`)
  return avgDistance
}

function paintItRed () {
  // context.fillStyle = "red"
  // idealPathPixels.forEach(px => { context.fillRect(px.x, px.y, 1, 1) })
  // context.fillStyle = "black"
}

function checkForEnoughSquiggle () {
  let columnsInSquiggle = 0
  for (let i = leftEdge; i < rightEdge; i++) {
    if (squigglePixels.filter(pixel => pixel.x === i).length > 0) {
      columnsInSquiggle += 1
    }
  }
  return columnsInSquiggle / (rightEdge - leftEdge) > 0.5
}
