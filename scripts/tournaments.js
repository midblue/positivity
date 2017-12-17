
const fetch = require('node-fetch')
const apiKey = require('../apikey_local.json')
const phantom = require('phantom')
const Players = require('../scripts/players.js')

const apiURL = `https://${apiKey.username}:${apiKey.key}@api.challonge.com/v1`

const Tournaments = {}

async function getTournament (url) {
  if (Tournaments[url]) {
    console.log('Presaved tournament')
    return Tournaments[url]
  }
  const data = await getChallongeTournamentData(url)
  const newTournament = {
    name: data.name,
    id: data.id,
    url: url,
    date: data.started_at,
    participantsCount: data.participants_count,
    participants: data.participants.map(p => {
      return {
        id: p.participant.id,
        name: p.participant.name,
        seed: p.participant.seed,
        placing: p.participant.final_rank,
      }
    }),
    matches: data.matches.map(m => {
      return {
        players: [
          {
            id: m.match.player1_id,
            name: getNameFromID(m.match.player1_id, data),
            won: m.match.player1_id === m.match.winner_id,
          },
          {
            id: m.match.player2_id,
            name: getNameFromID(m.match.player2_id, data),
            won: m.match.player2_id === m.match.winner_id,
          },
        ],
        winnerId: m.match.winner_id,
        loserId: m.match.loser_id,
        winnerName: getNameFromID(m.match.winner_id, data),
        loserName: getNameFromID(m.match.loser_id, data),
        time: m.match.completed_at,
      }
    }),
  }

  newTournament.isUserInTournament = function (participant) {
    const id = getIDfromName(participant, data)
    const matches = JSON.stringify(this.matches).toLowerCase()
    const inTournament = matches.indexOf(id) >= 0
    console.log(participant, 'is', inTournament ? '' : 'not', 'in', this.url)
    if (inTournament)
      return this
    else
      return null
  }

  newTournament.phantomGetHost = function () {
    return new Promise((resolve, reject) => {
      (async () => {
        const instance = await phantom.create()
        const page = await instance.createPage()
        await page.on('onResourceRequested', (requestData) => {
          //console.info('Requesting', requestData.url)
        })
        const status = await page.open(`http://challonge.com/${this.url}`)
        let host = await page.property('content')
        host = host.substring(host.indexOf('Hosted by') + 14)
        host = host.substring(host.indexOf('users/') + 6)
        host = host.substring(0, host.indexOf('"'))
        console.log('Host found:', host)
        instance.exit()
        resolve(host)
      }) ()
    })
  }

  newTournament.host = function () {
    return new Promise((resolve, reject) => {
      if (this.phantomHost){
        console.log('Presaved host')
        resolve(this.phantomHost)
      }
      else {
        console.log('Phantom getting host of', this.url, '...')
        this.phantomGetHost()
        .then(host => {
          this.phantomHost = host
          resolve(host)
        })
      }
    })
  }

  Tournaments[url] = newTournament
  return newTournament
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
