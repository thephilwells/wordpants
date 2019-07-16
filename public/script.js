const canvas = document.getElementById('canvas')
// const pantsPocket = documnet.getElementById('pants-pocket')
const context = canvas.getContext('2d')

let drawing = false
let brushType = 'rectangle'
let color = 'black'
let size = 5
let squigglePixels = []
let waistline = 100
let letterBottom = 124
let highestPixelValue
let puzzleData = getPuzzleData()
let letterX = 50
let allCollisionXs = []
let leftEdge = 25
let rightEdge = 600-25

// draw answer
context.strokeStyle = "black"
context.font = '120px Arial'

puzzleData.answer.split('').forEach(letter => {
  context.fillText(letter, letterX, 125, 100)
  letterX += 100
})

// get letter pixels below waistline
let collisionPixels = getCollisionPixels(puzzleData.answer)

// calculate ideal path from collision pixels
let idealPathPixels = []
getIdealPathPixels()

// draw dashed waistline
context.beginPath()
context.setLineDash([5, 15])
context.moveTo(0, waistline - 3)
context.lineTo(600, waistline - 3)
context.strokeStyle = "blue"
context.stroke()

window.addEventListener(
  'click',
  function (event) {
    if (event.target.id === 'submit') {
      handleSubmit()
    }
  },
  false
)

window.addEventListener(
  'mousedown',
  function (event) {
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
    if (drawing === true) {
      handlePenMove(...canvasXYFromEvent(event))
    }
  },
  false
)

window.addEventListener(
  'mouseup',
  function (event) {
    if (drawing === true) {
      drawing = false
      handlePenUp(...canvasXYFromEvent(event))
    }
  },
  false
)

window.addEventListener(
  'change',
  function (event) {
    brushType = event.target.form.brush.value
    color = event.target.form.color.value
    size = parseFloat(event.target.form.size.value)
    console.log('Changed brush type, color, or size', brushType, color, size)

    // TODO, use 'color' here to change the brush color
    // TIP, look up 'fillStyle' on mdn
  },
  false
)

function canvasXYFromEvent(event) {
  const { x, y } = canvas.getBoundingClientRect()
  return [
    event.clientX - x,
    event.clientY - y
  ]
}

// This code runs when the user presses down the mouse on the canvas (starts drawing)
function handlePenDown(x, y) {
  placeRectangle(x, y)
  squigglePixels.push({ x, y })
}

// This code runs when the user moves their mouse around while drawing
function handlePenMove(x, y) {
  console.log('drawing and moving', x, y)
  placeRectangle(x, y)
  squigglePixels.push({ x, y })
}

// This code runs when the user lift up the mouse while drawing (i.e. stops drawing)
function handlePenUp(x, y) {
  console.log('no longer drawing', x, y)
  console.log(`squiggle pixels so far: ${JSON.stringify(squigglePixels)}`)
}

function handleSubmit() {
  console.log('submitted')
  context.clearRect(0, highestPixelValue, 600, 600)
  new Audio("whistleup.wav").play()
  pullUpPants()
  // context.clearRect(0, 0, canvas.width, canvas.height)
}

function placeRectangle(x, y) {
  context.fillRect(x - size, y - size, size, size)
  context.closePath()
  context.fillStyle = color;
  context.fill()
}

async function pullUpPants() {
  highestPixelValue = getHighestPixelValue()
  for (let i = 0; i < squigglePixels.length; i++) {
    context.clearRect(squigglePixels[i].x - size, squigglePixels[i].y - size, size, size)
    let initialPixels = { x: squigglePixels[i].x, y: squigglePixels[i].y }
    let newPixel = { x: initialPixels.x, y: initialPixels.y - 1 }
    placeRectangle(newPixel.x, newPixel.y)
    squigglePixels[i] = { x: newPixel.x, y: newPixel.y }
  }
  await sleep(0)
  highestPixelValue--
  if (highestPixelValue <= waistline) {
    alert('WAISTLINE BREACHED!!')
    return
  } else if (collisionDetected()) {
    alert('COLLISION DETECTED!!')
  }
  else {
    pullUpPants()
  }
}

function getHighestPixelValue() {
  let highest = 9999
  squigglePixels.forEach((pixel) => { highest = (pixel.y < highest) ? pixel.y : highest })
  return highest
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getPuzzleData() {
  // TODO: get these values from api
  const clue = "Thirsty Doggo's Emissions"
  const answer = "PANTS"
  return { clue, answer }
}

function getCollisionPixels(answer) {
  let offset = 50
  let wordPixels = []
  answer.split('').forEach(letter => {
  let letterPixels = []
    let coords = new Uint32Array(context.getImageData(offset, 97, 100, 125).data.buffer)
    for (let i = 0; i < coords.length; i++) {
      if (coords[i]) {
        letterPixels.push({
          x: i % 100 + offset,
          y: Math.floor(i / 100) + 97
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
    if (!allCollisionXs[wordPixels[j].x] || wordPixels[j].y > allCollisionXs[wordPixels[j].x] ) {
      allCollisionXs[wordPixels[j].x] = wordPixels[j].y
    }
  }
  return wordPixels
}

function collisionDetected() {

  let eligibleSquigglePixels = squigglePixels.filter(pixel => {return allCollisionXs[pixel.x] !== undefined})
  for (let k = 0; k < eligibleSquigglePixels.length; k++ ) {
    if (eligibleSquigglePixels[k].y <= allCollisionXs[eligibleSquigglePixels[k].x]) {
      return true
    }
  }
  return false
}

function getIdealPathPixels() {

  // start of waistline to first filled pixel's X coordinate
  let index = parseInt(Object.keys(allCollisionXs)[0])
  let lowestCollisionX = index
  for(let i = leftEdge; i < lowestCollisionX; i++) {
    idealPathPixels.push({x: i, y: waistline, compare: 'down'})
  }
  paintItRed()

  let currentX = lowestCollisionX - 1
  let currentY = waistline
  let nextX = currentX + 1
  let nextY = allCollisionXs[nextX]

  for(let b = 0; b < allCollisionXs.length; b++) {
    // determine direction from this pixel to next

    // jump down
    if(currentY === waistline && nextY - currentY > 5) {
      // fill all y's from here to Y value of nextX
      for (let h = 0; h < nextY - currentY; h++) {
        idealPathPixels.push({x: currentX, y: currentY + h, compare: 'left'})
      }
    }
    paintItRed()

    // step down and right
    if(nextY - currentY < 5 && nextY - currentY > 0) {
      // fill all y's from here to Y value of nextX
      for (let h = 0; h < nextY - currentY; h++) {
        idealPathPixels.push({x: currentX, y: currentY + h, compare: 'average'})
      }
    }
    paintItRed()

    // straight right
    if(nextY - currentY === 0) {
      // fill all x's from here to x value of nextX
      for (let h = 0; h < nextX - currentX; h++) {
        idealPathPixels.push({x: currentX + h, y: currentY, compare: 'down'})
      }
    }
    paintItRed()

    // step up and right
    if(currentY - nextY < 5 &&
       currentY - nextY > 0) {
      // fill all y's from here to Y value of nextX
      for (let h = 0; h < nextY - currentY; h++) {
        idealPathPixels.push({x: currentX, y: currentY + h, compare: 'average'})
      }
    }
    paintItRed()

    // jump up
    if(nextY - currentY > 5) {
      // fill all y's from here to Y value of nextX
      for (let h = 0; h < nextY - currentY; h++) {
        idealPathPixels.push({x: currentX, y: currentY + h, compare: 'right'})
      }
    }
    paintItRed()
    
    // move to next pixel chunk
    if (nextX - currentX > 1) {
      // fill up Y's if necessary
      if (currentY > waistline) {
        for (let k = 0; k < currentY - waistline; k++) {
          idealPathPixels.push({x: currentX, y: currentY - k, compare: 'right'})
        }
      }
    paintItRed()

      // fill waistline to next letter chunk
      for (let m = 0; m < nextX - currentX; m++) {
        idealPathPixels.push({x: currentX + m, y: waistline, compare: 'down'})
      }
    }
    paintItRed()

    currentX = nextX
    currentY = allCollisionXs[currentX]
    nextX = parseInt(Object.keys(allCollisionXs)[b + 1])
    nextY = allCollisionXs[nextX]
  }
}

function paintItRed() {
  context.fillStyle = "red"
  idealPathPixels.forEach(px => { context.fillRect(px.x, px.y, 1, 1) })
  context.fillStyle = "black"
}
