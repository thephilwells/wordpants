const pino = require('pino')()

export default function logger(msg) {
  pino.info(msg)
}
