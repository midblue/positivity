const express = require('express')
const fetch = require('node-fetch')
const apiKey = require('../apikey_local.json')
const router = express.Router()
const phantom = require('phantom')

const apiURL = `https://${apiKey.username}:${apiKey.key}@api.challonge.com/v1`

pulledTournaments = {}

router.get('/tournament/:tournament', function (req, res) {
  const tournament = req.params.tournament
  getChallongeTournamentData(tournament)
  .then((data) => res.json(data))
})

router.get('/sisterTournaments/:tournament/:participant', (req, res) => {
  const tournament = req.params.tournament
  const participant = req.params.participant
  getTournamentHost(tournament)
  .then(host => fetch(`http://challonge.com/users/${host}`))
  .then(res => res.text())
  .then(tournaments => {
    tournaments = tournaments.substring(tournaments.indexOf('<h3>Tournaments'))
    tournaments = tournaments.substring(0, tournaments.indexOf('</table>'))
    tournaments = tournaments.split('challonge.com/').map((t) => {
      const tournamentName = t.substring(0, t.indexOf('"'))
      if (tournamentName != tournament)
        return tournamentName
    }).filter(t => t)
    tournaments.shift()
    const foundIn = []
    const promises = []
    tournaments.forEach((t) => {
      const promise = isUserInTournament(t, participant)
      .then((res) => { if (res) foundIn.push(res) })
      promises.push(promise)
    })
    Promise.all(promises)
    .then(() => {
      res.send(foundIn)
    })
  })
})

function getChallongeTournamentData (tournament) {
  return new Promise((resolve, reject) => {
    if (pulledTournaments[tournament] && pulledTournaments[tournament].matches)
      resolve(pulledTournaments[tournament])
    const request = `tournaments/${tournament}.json`
    fetch(`${apiURL}/${request}?include_participants=1&include_matches=1`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    })
    .then(res => res.json())
    .then(json => {
      pulledTournaments[tournament] = json.tournament
      resolve(json.tournament)
    })
  })
}

function getTournamentHost (tournament) {
  //console.log('Getting host of', tournament, '...')
  return new Promise((resolve, reject) => {
    //setTimeout(reject, 7000)
    if (pulledTournaments[tournament] && pulledTournaments[tournament].host)
      resolve(pulledTournaments[tournament].host)
    else (async function() {
      const instance = await phantom.create()
      const page = await instance.createPage()
      await page.on('onResourceRequested', function(requestData) {
        //console.info('Requesting', requestData.url)
      })
      const status = await page.open(`http://challonge.com/${tournament}`)
      let host = await page.property('content')
      host = host.substring(host.indexOf('Hosted by') + 14)
      host = host.substring(host.indexOf('users/') + 6)
      host = host.substring(0, host.indexOf('"'))
      pulledTournaments[tournament] = {
        ...pulledTournaments[tournament],
        host: host
      }
      instance.exit()
      resolve(host)
    })()
  })
}

function isUserInTournament (tournament, participant) {
  return new Promise((resolve, reject) => {
    getChallongeTournamentData(tournament)
    .then(data => {
      const id = getIDfromName(participant, data)
      const matches = JSON.stringify(data.matches).toLowerCase()
      const inTournament = matches.indexOf(id) >= 0
      //console.log(participant, 'is', inTournament ? '' : 'not', 'in', tournament)
      if (inTournament)
        resolve(data)
      else
        resolve(null)
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

module.exports = router
