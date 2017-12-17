const express = require('express')
const fetch = require('node-fetch')
const apiKey = require('../apikey_local.json')
const router = express.Router()
const phantom = require('phantom')
const Tournaments = require('../scripts/tournaments.js')
const Players = require('../scripts/players.js')

const apiURL = `https://${apiKey.username}:${apiKey.key}@api.challonge.com/v1`

router.get('/tournament/:tournament', function (req, res) {
  const tournament = req.params.tournament
  Tournaments(tournament)
  .then((data) => res.json(data))
})

router.get('/alsoCompetedIn/:tournament/:participant', (req, res) => {
  const tournament = req.params.tournament
  const participant = req.params.participant
  Tournaments(tournament)
  .then(res => res.host())
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
      const promise = Tournaments(t)
      .then(tobj => tobj.isUserInTournament(participant))
      .then(res => { if (res) foundIn.push(res) })
      promises.push(promise)
    })
    Promise.all(promises)
    .then(() => {
      res.send(foundIn)
    })
  })
})


module.exports = router
