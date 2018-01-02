
const db = require('monk')('localhost/positivity')
const dbPlayers = db.get('players')

// load all players from database on startup
dbPlayers.find({}).then(foundDbPlayers => {
  console.log('Found', foundDbPlayers.length, 'players in database.')
})

module.exports = {
	async new (name) {
		name = name.toLowerCase()
		//console.log('Adding new player', name, 'to database')
	  const newPlayer = {
	  	name: name,
	    placings: {},
	    matches: [],
	  }
	  await dbPlayers.insert(newPlayer)
	  return newPlayer
	},

	async update (name, tournament, matches, placing) {
		name = name.toLowerCase()
		let savedData = await dbPlayers.findOne({ name: name })
		if (!savedData) {
		  savedData = await this.new(name)
		}
		delete savedData._id
		if (matches) {
			for (let m in matches)
				savedData.matches.push(matches[m])
		}
		if (placing) {
			savedData.placings[tournament] = placing
		}
		dbPlayers.update({ name: name }, savedData)
	},

	async get (name) {
		name = name.toLowerCase()
		let savedData = await dbPlayers.findOne({ name: name })
		if (savedData) {
		  console.log('Loading presaved player', savedData.name)
		  return savedData
		}
		else {
			console.log("'"+name+"'", 'not found in database')
			return null
		}
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
