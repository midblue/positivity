
const fetch = require('node-fetch')
const apiKey = require('../apikey_local.json')
const ssr = require('../scripts/ssr.js')
const Players = require('../scripts/players.js')

const apiURL = `https://${apiKey.username}:${apiKey.key}@api.challonge.com/v1`
const db = require('monk')('localhost/positivity')
const dbTournaments = db.get('tournaments')

// load all tournaments from database on startup
dbTournaments.find({}).then(foundDbTournaments => {
  console.log('Found', foundDbTournaments.length, 'tournaments in database.')
})

async function getTournament (url) {
  const savedData = await dbTournaments.findOne({ url: url })
  if (savedData) {
    console.log('Loading presaved tournament', savedData.name)
    return {
      ...savedData,
      ...tournamentMethods,
    }
  }

  const data = await getChallongeTournamentData(url)
  let newTournament = {
    name: data.name,
    rawData: data,
    id: data.id,
    url: url,
    date: data.started_at,
    phantomHost: '',
    participantsCount: data.participants_count,
    participants: data.participants.map(p => {
      return parseParticipantData(p.participant)
    }),
    matches: data.matches.map(m => {
      return parseMatchData(m.match, data)
    }),
  }

  newTournament = {
    ...newTournament,
    ...tournamentMethods,
  }

  // save player data
  data.participants.map(p => {
    const participantId = p.participant.id
    let relevantMatches = data.matches.map(m => {
      if (m.match.player1_id === participantId || m.match.player2_id === participantId)
        return {
          ...parseMatchData(m.match, data),
          tournament: data.name,
        }
    }).filter(m => m)
    Players.update(
      p.participant.name,
      data.name,
      relevantMatches,
      {
        seed: p.participant.seed,
        placing: p.participant.final_rank,
        outOf: data.participants_count,
      }
    )
  })

  // save it
  dbTournaments.insert(newTournament)
  return newTournament
}

const tournamentMethods = {
  isUserInTournament (participant) {
    const id = getIDfromName(participant, this.rawData)
    const matches = JSON.stringify(this.matches).toLowerCase()
    const inTournament = matches.indexOf(id) >= 0
    if (inTournament){
      console.log(participant, 'also participated in', this.name)
      return this
    }
    else
      return null
  },

  async phantomGetHost () {
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

  host () {
    return new Promise((resolve, reject) => {
      if (this.phantomHost !== ''){
        console.log('Presaved host for', this.name + ':', this.phantomHost)
        resolve(this.phantomHost)
      }
      else {
        console.log('Phantom getting host of', this.name, '...')
        this.phantomGetHost()
        .then(host => {
          console.log('Phantom found host of', this.name + ':', host)
          dbTournaments.update({ url: this.url }, {
            ...this,
            phantomHost: host,
          })
          resolve(host)
        })
      }
    })
  },
}

function getChallongeTournamentData (tournament) {
  console.log('Getting new tournament data for', tournament, 'from API')
  return new Promise((resolve, reject) => {
    const request = `tournaments/${tournament}.json`
    fetch(`${apiURL}/${request}?include_participants=1&include_matches=1`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    })
    .then(res => res.json())
    .then(json => {
      resolve(json.tournament)
    })
  })
}

function parseMatchData (matchData, tournamentData) {
  return {
    players: [
      {
        id: matchData.player1_id,
        name: getNameFromID(matchData.player1_id, tournamentData),
        won: matchData.player1_id === matchData.winner_id,
      },
      {
        id: matchData.player2_id,
        name: getNameFromID(matchData.player2_id, tournamentData),
        won: matchData.player2_id === matchData.winner_id,
      },
    ],
    winnerId: matchData.winner_id,
    loserId: matchData.loser_id,
    winnerName: getNameFromID(matchData.winner_id, tournamentData),
    loserName: getNameFromID(matchData.loser_id, tournamentData),
    time: matchData.completed_at,
  }
}

function parseParticipantData (participantData) {
  return {
    id: participantData.id,
    name: participantData.name,
    seed: participantData.seed,
    placing: participantData.final_rank,
  }
}

function getNameFromID (id, tournamentData) {
  const foundName = tournamentData.participants.filter((p) => {
    return p.participant.id === id ? 1 : 0
  })
  if (foundName.length > 0) return foundName[0].participant.display_name
}
function getIDfromName (name, tournamentData) {
  const foundName = tournamentData.participants.filter((p) => {
    return p.participant.display_name === name ? 1 : 0
  })
  if (foundName.length > 0) return foundName[0].participant.id
}

module.exports = getTournament
