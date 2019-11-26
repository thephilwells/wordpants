/* eslint-env browser */
let canvas
let headerCanvas
let buttonCanvas
let splashCanvas

export default function setCanvasMobileBreakpoint(breakpoint = 600) {
  if (window.innerWidth < breakpoint) {
    splashCanvas = document.getElementById('mobile-splash')
    document
      .getElementById('splash')
      .parentNode.removeChild(document.getElementById('splash'))
  } else {
    splashCanvas = document.getElementById('splash')
    document
      .getElementById('mobile-splash')
      .parentNode.removeChild(document.getElementById('mobile-splash'))
  }

  if (window.innerWidth < breakpoint) {
    canvas = document.getElementById('mobile-canvas')
    headerCanvas = document.getElementById('mobile-header-canvas')
    buttonCanvas = document.getElementById('mobile-button-canvas')
    document
      .getElementById('canvas')
      .parentNode.removeChild(document.getElementById('canvas'))
    document
      .getElementById('header-canvas')
      .parentNode.removeChild(document.getElementById('header-canvas'))
    document
      .getElementById('button-canvas')
      .parentNode.removeChild(document.getElementById('button-canvas'))
  } else {
    canvas = document.getElementById('canvas')
    headerCanvas = document.getElementById('header-canvas')
    buttonCanvas = document.getElementById('button-canvas')
    document
      .getElementById('mobile-canvas')
      .parentNode.removeChild(document.getElementById('mobile-canvas'))
    document
      .getElementById('mobile-header-canvas')
      .parentNode.removeChild(document.getElementById('mobile-header-canvas'))
    document
      .getElementById('mobile-button-canvas')
      .parentNode.removeChild(document.getElementById('mobile-button-canvas'))
  }

  return { canvas, headerCanvas, buttonCanvas, splashCanvas }
}
