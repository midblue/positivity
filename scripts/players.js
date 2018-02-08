const Points = require('./points')
const db = require('monk')('localhost/positivity')
const dbPlayers = db.get('players')
const dbTournaments = db.get('tournaments')

// load all players from database on startup
dbPlayers.find({}).then(foundDbPlayers => {
  console.log('Found', foundDbPlayers.length, 'players in database.')
})

module.exports = {
	async new (name, url, service) {
		name = name.toLowerCase()
		//console.log('Adding new player', name, 'to database')
	  const newPlayer = {
	  	name: name,
	    tournaments: []
	  }
	  await dbPlayers.insert(newPlayer)
	  return newPlayer
	},

	async update (name, url, service) {
		name = name.toLowerCase()
		let savedData = await dbPlayers.findOne({ name: name })
		if (!savedData) {
		  savedData = await this.new(name)
		}
		delete savedData._id
		savedData.tournaments.push({ url, service })
		dbPlayers.update({ name: name }, savedData)
	},

	get (name) {
		return new Promise(async (resolve, reject) => {
			const inAllTournaments = []
			const dbPlayer = await dbPlayers.findOne({ name: name.toLowerCase() })
			if (!dbPlayer) return resolve({averageRanking: -1, tournaments: []})
			const tournaments = dbPlayer.tournaments
			const promises = tournaments.map(async (t) => {
				const tournamentData = await dbTournaments.findOne({ url: t.url, service: t.service })
				const foundPlayer = tournamentData.participants.find(p => p.name.toLowerCase() === name.toLowerCase())
				inAllTournaments.push({
				  ...tournamentData,
				  placing: foundPlayer.placing,
				  seed: foundPlayer.seed,
				  ranking: (tournamentData.totalParticipants - foundPlayer.placing) / tournamentData.totalParticipants,
				})
			})
			Promise.all(promises)
			.then(() => {
				const averageRanking = inAllTournaments.length > 0 ?
					inAllTournaments.map(o => o.ranking).reduce((total, o) => total + o) / inAllTournaments.length
					: -1
			  resolve({
			  	averageRanking,
			  	tournaments: inAllTournaments,
			  })
			})
		})
		
	},

	async points (name) {
		return await Points(name, this)
	},

	// async placings (name) {
	// name = name.toLowerCase()
	// 	return Players[name] ? Players[name].placings : {}
	// },

	// async matches (name) {
	//  name = name.toLowerCase()
	// 	return Players[name] ? Players[name].matches : []
	// },

	// async exists (name) {
	//  name = name.toLowerCase()
	// 	return Players[name] ? true : false
	// },

	async report () {
		const savedData = await dbPlayers.find({})
	  console.log(savedData.length)
	},
}

