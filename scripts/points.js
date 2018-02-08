// types of points:
// 1: concrete - base points for going and doing stuff. single-tournament
// 2: progression - points for improvement / dedication. multi-tournament
// 3. relational - points for past-compared things out of a player's control: i.e. opponent was on fire

let Players

module.exports = async function (name, players) {
	if (players) Players = players
	const { tournaments, averageRanking } = await Players.get(name)
	const points = []
	for (let t of tournaments) {
		if (t.participants[0].placing)
			points.push(await TournamentPoints(t, name, averageRanking, Players))
	}
	let total = 0
	let specialPointsTotal = 0
	for (let p in points) {
		total += points[p].total
		specialPointsTotal += points[p].specialPointsTotal
	}
	return {
	  total,
	  specialPointsTotal,
	  tournaments: points,
	}
}

async function TournamentPoints (t, name, averageRanking) {
	let details = {}

	// You showed up! Yay!
	details['tournament'] = [{ value: 20000, desc: 'Participated in a tournament', type: 'concrete', }]

	// Tournament size
	details['tournament'] = details['tournament'].concat(tournamentSizePoints(t)).filter(d => d)

	// Placing
	details['tournament'] = details['tournament'].concat(placingPoints(t)).filter(d => d)

	// Matches
	const userMatches = t.matches
		.map(m => m.loser.name === name || m.winner.name === name ? m : null)
		.filter(m => m)
	for (let m of userMatches) details[m.time] = await match(m, t, name, averageRanking)
	
	// Streaks
	details['streaks'] = streaks(userMatches)

	// Multi-tournament
	details['multitournament'] = []

	let total = 0
	let specialPointsTotal = 0
	for (let category in details) {
		details[category].forEach(p => {
			//console.log(total, p)
		  total += p.value
		  if (p.type !== 'concrete')
			specialPointsTotal += p.value
		})
	}
	return { url: t.url, total, specialPointsTotal, details, date: t.date }
}

function tournamentSizePoints (t) {
	if (t.totalParticipants < 20) return { value: 5000, desc: 'Supporting the local scene', context: 'small tournament', type: 'progression', }
	else if (t.totalParticipants > 200) return { value: 10000, desc: 'Getting in the mix', context: 'major tournament', type: 'progression', }
}

function placingPoints (t) {
	if (!t.placing) return
	if (t.totalParticipants > 4 && t.placing === 1) return { value: 16000, desc: 'You won!', type: 'concrete', }
	else if (t.totalParticipants > 4 && t.placing === 2) return { value: 12000, desc: 'So close!', context: 'top 2', type: 'concrete', }
	else if (t.totalParticipants > 8 && t.placing <= 4) return { value: 10000, desc: 'Top 4!', type: 'concrete', }
	else if (t.totalParticipants > 12 && t.placing <= 8) return { value: 8000, desc: 'Top 8!', type: 'concrete', }
	else if (t.totalParticipants > 20 && t.placing <= 16) return { value: 6000, desc: 'Top 16!', type: 'concrete', }
	else if (t.placing / t.totalParticipants <= .5) return { value: 6000, desc: 'Top 50%!', type: 'concrete', }
	else if (t.placing / t.totalParticipants <= .75) return { value: 4000, desc: 'Top 75%!', type: 'concrete', }
}

async function match (m, t, name, userRanking) {
	const matchPoints = []
	const basePoints = 1000
	const opponent = (m.winner.name === name ? m.loser.name : m.winner.name)
	const opponentPlacing = t.participants.find(p => p.name === name).placing
	const opponentRankingThisTournament = (t.totalParticipants - opponentPlacing) / t.totalParticipants
	const playerRankingThisTournament = (t.totalParticipants - t.placing) / t.totalParticipants
	const points = basePoints + Math.ceil((opponentRankingThisTournament / playerRankingThisTournament) * 1000)
		matchPoints.push({ value: points, desc: `Match vs. ${opponent}`, type: 'concrete', })

	const opponentData = await Players.get(opponent)
	const opponentInOtherTournaments = opponentData.tournaments.filter(o => o.url !== t.url)
	if (opponentInOtherTournaments.length > 0) {
		const opponentAvgRanking = opponentInOtherTournaments
			.map(o => o.ranking)
			.reduce((total, o) => total + o) / opponentInOtherTournaments.length
		const opponentAvgPlacing = opponentInOtherTournaments
			.map(o => o.placing)
			.reduce((total, o) => total + o) / opponentInOtherTournaments.length
		if (opponentAvgRanking <= opponentRankingThisTournament || opponentAvgPlacing >= opponentPlacing ) {
			if (!m.won)
				matchPoints.push({ value: 3000, desc: `Opponent was on fire!`, context: `${opponent} did better than usual at this tournament`, type: 'relational', })
			else
				matchPoints.push({ value: 3000, desc: `Stopped a train!`, context: `${opponent} did better than usual at this tournament`, type: 'relational', })
		}
	}

	if (userRanking <= opponentData.averageRanking / 2)
		matchPoints.push({ value: 3000, desc: `Strong opponent`, context: `${opponent} usually places well`, type: 'relational', })

	return matchPoints
}

function streaks (m) {
	let streakPoints = []
	for (let match of m) {

	}
	return streakPoints
}





