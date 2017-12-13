const express = require('express')
const fetch = require('node-fetch')
const apiKey = require('../apikey_local.json')
const router = express.Router()

const apiURL = `https://${apiKey.username}:${apiKey.key}@api.challonge.com/v1`

router.get('/tournament/:tournament', function (req, res) {
  const tournament = req.params.tournament
  getChallongeTournamentData(tournament)
  .then((response) => response.json())
  .then((data) => res.json(data.tournament))
})

router.get('/sisterTournaments/:tournament', (req, res) => {
  const tournament = req.params.tournaments
  fetch(`http://www.challonge.com/${tournament}`)
  .then(res => res.text())
  .then(html => {
    html = html.substring(html.indexOf('Hosted by'))
    html = html.substring(html.indexOf('<a'))
    html = html.substring(html.indexOf('>') + 1)
    html = html.substring(0, html.indexOf('</a>'))
    fetch(`http://challonge.com/users/${html}`)
    .then(res => res.text())
    .then(html => {
      html = html.substring(html.indexOf('<h3>Tournaments'))
      html = html.substring(0, html.indexOf('</table>'))
      res.send(html)
    })
  })
})
/*
router.get('/tournament/:tournament/participant/:participant', function (req, res) {
  const tournament = req.params.tournament
  const participant = req.params.participant
	getChallongeTournamentData(tournament)
  .then((response) => response.json())
  .then((data) => {
  	if (data) {
  		let participantID
  		let finalRank
			let filteredData = data.tournament.participants
			.filter((a) => {
        if (a.participant.name === participant)
        	participantID = a.participant.id
	        finalRank = a.participant.final_rank
          return 1
        return 0
      })[0].participant
      filteredData['finalRank'] = finalRank
      filteredData['tournament'] = data.tournament.name
      filteredData['wonMatches'] = data.tournament.matches.filter((m) => {
      	console.log(m)
      	if (m.match.winner_id == participantID) return 1
    		return 0
      })
      filteredData['lostMatches'] = data.tournament.matches.filter((m) => {
      	if (m.match.loser_id == participantID) return 1
      	return 0
      })
  		res.json(filteredData)
  	}
  })
})*/

function getChallongeTournamentData (tournament) {
	const request = `tournaments/${tournament}.json`
	return fetch(`${apiURL}/${request}?include_participants=1&include_matches=1`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
  })
}

module.exports = router