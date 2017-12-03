const express = require('express')
const fetch = require('node-fetch')
const apiKey = require('../apikey_local.json')
const router = express.Router()

router.get('/tournament/:tournament', function (req, res) {
  const tournament = req.params.tournament
	const request = `tournaments/${tournament}.json`
  fetch(`https://${apiKey.username}:${apiKey.key}@api.challonge.com/v1/${request}`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    include_participants: true,
  })
  .then((response) => response.json())
  .then((data) => res.json(data))
})

router.get('/tournament/:tournament/participant/:participant', function (req, res) {
  const tournament = req.params.tournament
  const participant = req.params.participant
	const request = `tournaments/${tournament}/participants.json`
  fetch(`https://${apiKey.username}:${apiKey.key}@api.challonge.com/v1/${request}`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
  })
  .then((response) => response.json())
  .then((data) => {
  	console.log(data)
  	if (data) {
  		res.json(data
  			.filter((a) => {
	        if (a.participant.name === participant)
	          return 1
	        return 0
	      })[0].participant
	  	)
  	}
  })
})

module.exports = router