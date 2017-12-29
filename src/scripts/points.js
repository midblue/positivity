// types of points:
// 1: concrete - base points for going and doing stuff. single-tournament
// 2: progression - points for improvement / dedication. multi-tournament

export default function (tournaments) {
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
	let details = []

	// You showed up! Yay!
	details.push({ value: 20, desc: 'Participated in a tournament', type: 'concrete', })

	// Tournament size
	details.push(tournamentSizePoints(t))

	// Placing
	details.push(placingPoints(t))

	// Matches
	for (let m of t.winData) details.push(wonMatch(m, t))
	for (let m of t.lossData) details.push(lostMatch(m, t))

	details = details.filter(d => d)
	let total = 0
	details.forEach(p => {
	  total += p.value
	})
	return { url: t.url, total: total, details: details, date: t.date }
}



function tournamentSizePoints (t) {
	if (t.totalParticipants < 20) return { value: 5, desc: 'Supporting the local scene', context: 'small tournament', type: 'concrete', }
	else if (t.totalParticipants > 200) return { value: 10, desc: 'Getting in the mix', context: 'major tournament', type: 'concrete', }
}

function placingPoints (t) {
	if (t.totalParticipants < 4 && t.placing == 1) return { value: 16, desc: 'You won!', type: 'concrete', }
	else if (t.totalParticipants < 4 && t.placing == 2) return { value: 12, desc: 'So close!', context: 'top 2 at ' + t.name, type: 'concrete', }
	else if (t.totalParticipants < 8 && t.placing >= 4) return { value: 10, desc: 'Top 4!', type: 'concrete', }
	else if (t.totalParticipants < 12 && t.placing >= 8) return { value: 8, desc: 'Top 8!', type: 'concrete', }
	else if (t.totalParticipants < 20 && t.placing >= 16) return { value: 6, desc: 'Top 16!', type: 'concrete', }
	else if (t.placing / t.totalParticipants <= .5) return { value: 6, desc: 'Top 50%!', type: 'concrete', }
	else if (t.placing / t.totalParticipants <= .75) return { value: 4, desc: 'Top 75%!', type: 'concrete', }
}

function wonMatch (m, t) {
	const basePoints = 1
	const opponentRanking = (t.totalParticipants - m.opponentPlacing) / t.totalParticipants
	const playerRanking = (t.totalParticipants - t.placing) / t.totalParticipants
	const points = basePoints + Math.ceil((opponentRanking / playerRanking))
	return { value: points, desc: `Won a match`, context: m.opponent, type: 'concrete', }
}

function lostMatch (m, t) {
	const basePoints = 3
	const opponentRanking = (t.totalParticipants - m.opponentPlacing) / t.totalParticipants
	const playerRanking = (t.totalParticipants - t.placing) / t.totalParticipants
	const points = basePoints + Math.ceil((opponentRanking / playerRanking))
	return { value: points, desc: `Played a match`, context: m.opponent, type: 'concrete', }
}