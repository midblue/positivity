const phantom = require('phantom')

module.exports = {
  get: async function (url, verbose = false) {
    const instance = await phantom.create()
    const page = await instance.createPage()
    await page.on('onResourceRequested', (requestData) => {
      if (verbose) console.info('Requesting', requestData.url)
    })
    const status = await page.open(url)
    const html = await page.property('content')
    instance.exit()
    return html
  }
}
