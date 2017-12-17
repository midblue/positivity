const Players = {}

module.exports = {
	new (name) {
	  const newPlayer = {
	    placings: {},
	    matches: [],
	  }
	  Players[name] = newPlayer
	  return newPlayer
	},

	update (name, tournament, matches, placing) {
		if (!Players[name])
			this.new(name)
		if (matches) {
			for (let m in matches)
				Players[name].matches.push(matches[m])
		}
		if (placing) Players[name].placings[tournament] = placing
	},

	get (name) {
		return Players[name] || this.new(name)
	},

	placings (name) {
		return Players[name] ? Players[name].placings : {}
	},

	matches (name) {
		return Players[name] ? Players[name].matches : []
	},

	exists (name) {
		return Players[name] ? true : false
	},

	report () {
		console.log(`${Object.keys(Players)} 
			${Object.keys(Players).length} players tracked`)
	},
}
