const express = require('express')
const fetch = require('node-fetch')
const apiKey = require('../apikey_local.json')
const router = express.Router()
const phantom = require('phantom')

const apiURL = `https://${apiKey.username}:${apiKey.key}@api.challonge.com/v1`

router.get('/tournament/:tournament', function (req, res) {
  const tournament = req.params.tournament
  getChallongeTournamentData(tournament)
  .then((response) => response.json())
  .then((data) => res.json(data.tournament))
})

router.get('/sisterTournaments/:tournament', (req, res) => {
  const tournament = req.params.tournament
  getTournamentHost(tournament)
  .then((host) => fetch(`http://challonge.com/users/${host}`))
  .then(res => res.text())
  .then(html => {
    html = html.substring(html.indexOf('<h3>Tournaments'))
    html = html.substring(0, html.indexOf('</table>'))
    res.send(html)
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
function getTournamentHost (tournament) {
  return new Promise((resolve, reject) => {
    (async function() {
      const instance = await phantom.create()
      const page = await instance.createPage()
      await page.on('onResourceRequested', function(requestData) {
        console.info('Requesting', requestData.url)
      })

      const status = await page.open(`http://challonge.com/${tournament}`)
      let content = await page.property('content')
      content = content.substring(content.indexOf('Hosted by') + 14)
      content = content.substring(content.indexOf('users/') + 6)
      content = content.substring(0, content.indexOf('"'))
      instance.exit()
      resolve(content)
    })()
  })
}

module.exports = router