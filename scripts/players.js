const Players = {}

module.exports = {
	newPlayer (name) {
	  const newPlayer = {
	    name: name,
	    placings: {},
	    matches: [],
	  }
	  Players.push(newPlayer)
	  return newPlayer
	},

	updatePlayer (name, matches, placing) {
		if (Players[name]){
			for (let match in matches)
				Players[name].matches.push(matches[match])
			Players[name].placings.push(placing)
			return Players[name]
		}
		else return newPlayer(name)
	},

	getPlayer (name) {
		return Players[name] || newPlayer(name)
	},

	getPlacings (name) {
		return Players[name] ? Players[name].placings : {}
	},

	getMatches (name) {
		return Players[name] ? Players[name].matches : []
	},
}
