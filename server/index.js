/* eslint-disable import/no-extraneous-dependencies */
const { resolve } = require('path')

const express = require('express')

const { PORT } = process.env || 8080

const app = express()
app.use(express.static('public'))

const compiler = require('webpack')(require('../webpack.config'))

app.use(
  require('webpack-dev-middleware')(compiler, {
    stats: 'minimal',
    watchOptions: {
      aggregateTimeout: 700,
    },
  })
)
app.use(require('webpack-hot-middleware')(compiler))

app.use(express.static(resolve(__dirname, '../public')))

const appListener = app.listen(PORT, () => {
  console.log(`server is listening on port ${appListener.address().port}`)
})
