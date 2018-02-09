


const services = {
  challonge: require('./getters/challonge')
}

const db = require('monk')('localhost/positivity')
const dbTournaments = db.get('tournaments')
const dbPlayers = db.get('players')

// load all tournaments from database on startup
dbTournaments.find({}).then(foundDbTournaments => {
  console.log('Found', foundDbTournaments.length, 'tournaments in database.')
})

// exposed functions
module.exports = {
  async get (service, url, passedHost) {
    if (!services.hasOwnProperty(service)) return { error: true, message: 'Invalid service name' }
    return await services[service].get(url, passedHost)
  },
  async related (service, url) {
    if (!services.hasOwnProperty(service)) return { error: true, message: 'Invalid service name' }
    return await services[service].related(url) 
  },
  search (keyword) {
    return new Promise (async (resolve, reject) => {
      const results = {}
      const promises = []
      for (let service in services) {
        promises.push(await services[service].search(keyword)
          .then(response => results[service] = response))
      }
      Promise.all(promises)
      .then(() => resolve(results)) 
    })
  },
  clear () {
    console.log('CLEARING ALL TOURNAMENT AND PLAYER ENTRIES IN DATABASE')
    dbTournaments.remove({})
    dbPlayers.remove({})
  }
}


