const phantom = require('phantom')

module.exports = {
  async get (url, verbose = false) {
  	try {
	    if (verbose) console.info('Loading', url)
	    const instance = await phantom.create([
	    	'--ignore-ssl-errors=yes',
	    	'--load-images=no'
    	])
	    const page = await instance.createPage()
	    await page.on('onResourceRequested', (requestData) => {
	      if (verbose) console.info('Requesting', requestData.url)
	    })
	    const status = await page.open(url)
	    const html = await page.property('content')
	    instance.exit()
	    return html
	} catch (e) {
		return console.log('SSR failed: ', e)
	}
  }
}
