const express = require('express')
const fetch = require('node-fetch')
const router = express.Router()
const phantom = require('phantom')
const Tournaments = require('../scripts/tournaments.js')
const Players = require('../scripts/players.js')

// clear databases for debug purposes
// setTimeout(Tournaments.clear, 100)
// setTimeout(async () => {
//   Tournaments.get('challonge', 'lieswkev')
//   // console.log(await Players.points('jasp'))
// }, 2000)
// setTimeout(async () => {
//   Tournaments.related('challonge', 'lieswkev')
// }, 5000)

router.get('tournament/:service/:tournament', function (req, res) {
  const tournament = req.params.tournament
  const service = req.params.service
  Tournaments.get(tournament, service)
  .then((data) => res.json(data))
})

router.get('/alsoCompetedIn/:service/:tournament/:participant', (req, res) => {
  const tournament = req.params.tournament
  const participant = req.params.participant
  const service = req.params.service
  let thisHost
  Tournaments.get(tournament, service)
  .then(res => res.getHost())
  .then(host => {
    thisHost = host
    return fetch(`http://challonge.com/users/${host}`)
  })
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
      const promise = Tournaments.get(t, service, thisHost)
      .then(tobj => {
        if (tobj.isInTournament(participant)) foundIn.push(tobj)
      })
      promises.push(promise)
    })
    Promise.all(promises)
    .then(() => {
      res.send(foundIn)
    })
  })
})

router.get('/player/:player', async (req, res) => {
  const player = req.params.player
  console.log('Looking up player', player)
  const foundPlayer = await Players.get(player)
  const points = await Players.points(player)
  res.send({...foundPlayer, points} || {})
})

router.get('/points/:player', async (req, res) => {
  const player = req.params.player
  console.log('Looking up points for player', player)
  const foundPoints = await Players.points(player)
  res.send(foundPoints)
})


module.exports = router
