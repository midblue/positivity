


const challonge = require('./getters/challonge')

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
    switch (service) {
      case 'challonge':
        return await challonge.get(url, passedHost)
      default:
        return { error: true, message: 'Invalid service name' }
    } 
  },
  async related (service, url) {
    switch (service) {
      case 'challonge':
        return await challonge.related(url)
      default:
        return { error: true, message: 'Invalid service name' }
    } 
  },
  clear () {
    console.log('CLEARING ALL TOURNAMENT AND PLAYER ENTRIES IN DATABASE')
    dbTournaments.remove({})
    dbPlayers.remove({})
  }
}


