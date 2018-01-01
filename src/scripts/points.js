// types of points:
// 1: concrete - base points for going and doing stuff. single-tournament
// 2: progression - points for improvement / dedication. multi-tournament
// 3. relational - points for past-compared things out of a player's control: i.e. opponent was on fire

let all = {}
let userRanking = 0

export default function (tournaments, user) {
	all = tournaments
	userRanking = playerAverageRanking(user)
	const points = []
	for (let t of tournaments) {
		points.push(TournamentPoints(t))
	}
	let total = 0
	for (let p in points) total += points[p].total
	return {
	  total: total,
	  tournaments: points,
	}
}

function TournamentPoints (t) {
	let details = {}

	// You showed up! Yay!
	details['tournament'] = [{ value: 20000, desc: 'Participated in a tournament', type: 'concrete', }]

	// Tournament size
	details['tournament'] = details['tournament'].concat(tournamentSizePoints(t)).filter(d => d)

	// Placing
	details['tournament'] = details['tournament'].concat(placingPoints(t)).filter(d => d)

	// Matches
	for (let m of t.userMatches) details[m.time] = match(m, t)

	// Streaks
	details['streaks'] = streaks(t.userMatches)

	// Multi-tournament
	details['multitournament'] = []

	let total = 0
	for (let category in details) {
		details[category].forEach(p => {
			//console.log(total, p)
		  total += p.value
		})
	}
	return { url: t.url, total: total, details: details, date: t.date }
}

function tournamentSizePoints (t) {
	if (t.totalParticipants < 20) return { value: 5000, desc: 'Supporting the local scene', context: 'small tournament', type: 'progression', }
	else if (t.totalParticipants > 200) return { value: 10000, desc: 'Getting in the mix', context: 'major tournament', type: 'progression', }
}

function placingPoints (t) {
	if (t.totalParticipants > 4 && t.placing == 1) return { value: 16000, desc: 'You won!', type: 'concrete', }
	else if (t.totalParticipants > 4 && t.placing == 2) return { value: 12000, desc: 'So close!', context: 'top 2', type: 'concrete', }
	else if (t.totalParticipants > 8 && t.placing <= 4) return { value: 10000, desc: 'Top 4!', type: 'concrete', }
	else if (t.totalParticipants > 12 && t.placing <= 8) return { value: 8000, desc: 'Top 8!', type: 'concrete', }
	else if (t.totalParticipants > 20 && t.placing <= 16) return { value: 6000, desc: 'Top 16!', type: 'concrete', }
	else if (t.placing / t.totalParticipants <= .5) return { value: 6000, desc: 'Top 50%!', type: 'concrete', }
	else if (t.placing / t.totalParticipants <= .75) return { value: 4000, desc: 'Top 75%!', type: 'concrete', }
}

function match (m, t) {
	const matchPoints = []
	const basePoints = 1000
	const opponentRankingThisTournament = (t.totalParticipants - m.opponentPlacing) / t.totalParticipants
	const playerRankingThisTournament = (t.totalParticipants - t.placing) / t.totalParticipants
	const points = basePoints + Math.ceil((opponentRankingThisTournament / playerRankingThisTournament) * 1000)
		matchPoints.push({ value: points, desc: `Match vs. ${m.opponent}`, type: 'concrete', })

	const inOtherTournaments = findPlayerInAllLoadedTournaments(m.opponent).filter(o => o.url !== t.url )
	if (inOtherTournaments.length > 0) {
		const opponentAvgRanking = inOtherTournaments
			.map(o => o.ranking)
			.reduce((total, o) => total + o) / inOtherTournaments.length
		const opponentAvgPlacing = inOtherTournaments
			.map(o => o.placing)
			.reduce((total, o) => total + o) / inOtherTournaments.length
		if (opponentAvgRanking <= opponentRankingThisTournament || opponentAvgPlacing >= m.opponentPlacing ) {
			if (!m.won)
				matchPoints.push({ value: 3000, desc: `Opponent was on fire!`, context: `${m.opponent} did better than usual at this tournament`, type: 'relational', })
			else
				matchPoints.push({ value: 3000, desc: `Stopped a train!`, context: `${m.opponent} did better than usual at this tournament`, type: 'relational', })
		}
	}

	if (userRanking <= playerAverageRanking(m.opponent) / 2)
		matchPoints.push({ value: 3000, desc: `Strong opponent`, type: 'relational', })

	return matchPoints
}

function streaks (m) {
	let streakPoints = []
	for (let match of m) {

	}
	return streakPoints
}

// utilities

function findPlayerInAllLoadedTournaments (player) {
  let inAll = []
  for (let t in all) {
    for (let p of all[t].participants) {
      if (p.name.toLowerCase() === player.toLowerCase()) {
        inAll.push({
          name: all[t].name,
          placing: p.placing,
          seed: p.seed,
          date: all[t].date,
          url: all[t].url,
          participants: all[t].totalParticipants,
          ranking: (all[t].totalParticipants - p.placing) / all[t].totalParticipants,
        })
        break
      }
    }
  }
  return inAll
}

// maybe we should consider "up to a certain point in time" so later shifts in ability won't skew past comparison
function playerAverageRanking (player) {
	let inAll = findPlayerInAllLoadedTournaments(player)
	return inAll.length > 0 ?
		inAll.map(o => o.ranking).reduce((total, o) => total + o) / inAll.length
		: 0
}