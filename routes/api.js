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

router.get('/tournament/:service/:tournament', async (req, res) => {
  const tournament = req.params.tournament
  const service = req.params.service
  Tournaments.related(service, tournament)
  .then(() => res.send({ status: 'done' }))
})

router.get('/player/:player', async (req, res) => {
  const player = req.params.player.toLowerCase()
  console.log('Looking up player', player)
  const foundPlayer = await Players.get(player)
  const points = await Players.points(player)
  res.send({...foundPlayer, points} || {})
})

router.get('/points/:player', async (req, res) => {
  const player = req.params.player.toLowerCase()
  console.log('Looking up points for player', player)
  const foundPoints = await Players.points(player)
  res.send(foundPoints)
})

router.get('/search/:keyword', async (req, res) => {
  const keyword = req.params.keyword
  console.log('Searching for tournaments by keyword', keyword)
  const results = await Tournaments.search(keyword)
  res.send(results)
})

module.exports = router
