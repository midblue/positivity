
const fetch = require('node-fetch')
const apiKey = require('./challonge_apikey_local.json')
const apiURL = `https://${apiKey.username}:${apiKey.key}@api.challonge.com/v1`
const ssr = require('../../scripts/ssr.js')
const Players = require('../players')

const db = require('monk')('localhost/positivity')
const dbTournaments = db.get('tournaments')

// returns tournament object. also saves data to database if it's new.
module.exports = {
  async get (url, passedHost) {
    // look for a saved tournament
    const savedData = await dbTournaments.findOne({ url: url })
    if (savedData) {
      console.log('Loading presaved tournament', savedData.name)
      if (passedHost) savedData.host = passedHost
      return {
        ...savedData,
        ...tournamentMethods,
      }
    }
    // get new tournament data
    console.log('Getting new tournament data for', url, 'from challonge API.')
    return new Promise((resolve, reject) => {
      const request = `tournaments/${url}.json`
      fetch(`${apiURL}/${request}?include_participants=1&include_matches=1`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
      })
      .then(res => res.json())
      .then(json => {
        const builtTournament = buildTournament(json.tournament, passedHost)
        saveToDatabase(builtTournament)
        resolve(builtTournament)
      })
    })
  },

  async related (url) {
    const originalTournament = await this.get(url)
    const host = await originalTournament.getHost()
    const hostPageData = await fetch(`http://challonge.com/users/${host}`)
    let newTournaments = await hostPageData.text()
    newTournaments = newTournaments.substring(newTournaments.indexOf('<h3>Tournaments'))
    newTournaments = newTournaments.substring(0, newTournaments.indexOf('</table>'))
    .split('challonge.com/').map(t => {
      const tournamentName = t.substring(0, t.indexOf('"'))
      if (tournamentName != url)
        return tournamentName
    })
    .filter(t => t)
    newTournaments.shift()
    const promises = []
    newTournaments.forEach(async newUrl => {
      promises.push(this.get(newUrl, host))
    })
    await Promise.all(promises)
    return { status: 'success' }
  },
  async search (keyword) {
    let results = await fetch(`http://challonge.com/tournaments?utf8=%E2%9C%93&q=${keyword.replace(' ', '+')}`)
    .then(res => res.text())
    results = results
    .substring(results.indexOf('tbody'), results.indexOf('/tbody'))
    .split('challonge.com/')
    results.shift()
    results = results
    .map(t => {
      return {
        service: 'challonge',
        url: t.substring(0, t.indexOf('"')),
        name: t.substring(t.indexOf('>') + 1, t.indexOf('</a>'))
      }
    })
    return results
  },
}

function saveToDatabase (builtTournament) {
  dbTournaments.findOne({ service: 'challonge', url: builtTournament.url })
  .then(docs => {
    if (docs){
      console.log('Already have data for', builtTournament.name, '– skipping.')
      return
    }
    dbTournaments.insert(builtTournament)
    .then(() => { console.log('Saved', builtTournament.name, 'to database.') })
    builtTournament.participants.map(p => {
      Players.update(
        p.name,
        builtTournament.url,
        builtTournament.service,
      )
    })
  })
}

/*

TOURNAMENT
  service
  url
  name
  date
  totalParticipants
  host
  state: 'complete'/'in progress'/'not started'
  rawData

  matches
    winner
      id
      name
    loser
      id
      name
    time
    score [#, #]

  participants
    localId
    name
    seed
    placing

  getHost() -> saved or ssrGetHost
  isInTournament(name) -> bool
  (private ssrGetHost())
  (private saveDataToDB())

PLAYER
  name
  tournaments [
    { url, service }
  ]
  placings() ->
    service
    url
    name
    totalParticipants
    placing

*/

function buildTournament(data, passedHost) {
  const participants = data.participants.map(p => parseParticipantData(p.participant))
  const matches = data.matches.map(m => parseMatchData(m.match, participants))
  return {
    service: 'challonge',
    url: data.url,
    name: data.name,
    date: new Date(data.started_at),
    totalParticipants: data.participants.length,
    host: passedHost || null,
    state: data.state,
    //rawData: data,
    matches,
    participants,
    ...tournamentMethods,
  }
}

function parseParticipantData (participantData) {
  //if (participantData.group_player_ids.length > 0 || !participantData.id) console.log(participantData)
  return {
    localId: participantData.group_player_ids.length > 0 ? 
      participantData.group_player_ids[0] : participantData.id,
    name: participantData.display_name.toLowerCase(),
    seed: participantData.seed,
    placing: participantData.final_rank,
  }
}

function parseMatchData (matchData, participants) {
  const winnerId = matchData.player2_id === matchData.winner_id ? 
    matchData.player2_id : matchData.player1_id
  const loserId = matchData.player1_id === matchData.winner_id ? 
    matchData.player2_id : matchData.player1_id
  const winnerName = getNameFromID(winnerId, participants)
  const loserName = getNameFromID(loserId, participants)
  return {
    winner: {
      id: winnerId,
      name: winnerName,
      placing: getPlacing(winnerName, participants),
    },
    loser: {
      id: loserId,
      name: loserName,
      placing: getPlacing(loserName, participants),
    },
    score: [
      parseInt(matchData.scores_csv.substring(0, 1)), 
      parseInt(matchData.scores_csv.substring(2))
    ],
    time: matchData.completed_at,
  }
}

// methods that get added to all live tournaments
const tournamentMethods = {
  isInTournament (name) {
    return this.participants.find(p => p.name === name) ? true : false
  },

  async ssrGetHost () {
    try {
      const html = await ssr.get(`http://challonge.com/${this.url}`)
      let host = html.substring(html.indexOf('Hosted by') + 14)
      host = host.substring(host.indexOf('users/') + 6)
      host = host.substring(0, host.indexOf('"'))
      return host
    } catch (e) {
      return console.log('Unable to get host.')
    }
  },

  getHost () {
    return new Promise((resolve, reject) => {
      if (this.host){
        console.log('Presaved host for', this.name + ':', this.host)
        resolve(this.host)
      }
      else {
        console.log('SSR getting host of', this.name, '...')
        this.ssrGetHost()
        .then(host => {
          console.log('SSR found host of', this.name + ':', host)
          this.host = host
          this.saveDataToDB()
          resolve(host)
        })
      }
    })
  },

  saveDataToDB () {
    dbTournaments.update({ url: this.url }, { ...this })
  }
}

function getPlacing (name, participants) {
  //console.log('getPlacing', name, participants.find(p => p.name.toLowerCase() === name))
  const foundParticipant = participants.find(p => p.name.toLowerCase() === name)
  if (!foundParticipant) return -1
  return foundParticipant.placing
}

function getNameFromID (id, participants) {
  const foundParticipant = participants.find(p => p.localId === id)
  if (!foundParticipant) {
    //console.log('not found', id, )//participants)
    return null
  }
  return foundParticipant.name.toLowerCase()
}
