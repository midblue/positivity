<template>
  <div id="app">
    <input v-model="tournament" />
    <input v-model="participant" />
    <button @click="APIQuery">
      Go
    </button>
    <br />
    <br />
    <h2>{{ participant }} got {{ placingOrdinal }}</h2>
    <div>at {{ tournamentName }}</div>
    <br />
    <div>
      <h3>Wins (avg placing {{ beatAvgPlacing }})</h3>
      <div v-for="win in winData">
        {{ win.opponent }} ({{ win.opponentPlacing }})
      </div>
    </div>
    <br />
    <div>
      <h3>Losses (avg placing {{ lostToAvgPlacing }})</h3>
      <div v-for="loss in lossData">
        {{ loss.opponent }} ({{ loss.opponentPlacing }})
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      apiURL: './api',
      tournament: 'lieswkev',
      participant: 'jasp',
      tournamentData: null,
    }
  },
  computed: {
    participantElement () {
      if (!this.tournamentData) return
      return this.tournamentData.participants.filter((p) => {
        return p.participant.display_name === this.participant ? 1 : 0
      })[0].participant
    },
    tournamentName () {
      if (!this.tournamentData) return
      return this.tournamentData.name
    },
    id () {
      if (!this.tournamentData) return
      return this.participantElement.id
    },
    winData () {
      if (!this.tournamentData) return
      let data = []
      for (let m in this.tournamentData.matches){
        if (this.tournamentData.matches[m].match.winner_id === this.id){
          data.push({
            ...this.tournamentData.matches[m].match,
            opponent: this.getNameFromID(this.tournamentData.matches[m].match.loser_id),
            opponentPlacing: this.getPlacing(this.tournamentData.matches[m].match.loser_id),
          })
        }
      }
      return data
    },
    lossData () {
      if (!this.tournamentData) return
      let data = []
      for (let m in this.tournamentData.matches){
        if (this.tournamentData.matches[m].match.loser_id === this.id){
          data.push({
            ...this.tournamentData.matches[m].match,
            opponent: this.getNameFromID(this.tournamentData.matches[m].match.winner_id),
            opponentPlacing: this.getPlacing(this.tournamentData.matches[m].match.winner_id),
          })
        }
      }
      return data
    },
    beat () {
      return this.winData ? this.winData.map((win) => win.opponent) : []
    },
    lostTo () {
      return this.lossData ? this.lossData.map((loss) => loss.opponent) : []
    },
    placing () {
      if (!this.tournamentData) return
      return this.participantElement.final_rank
    },
    placingOrdinal () {
      if (!this.placing) return
      if (this.placing % 10 === 1 && this.placing % 100 !== 11) return this.placing + 'st'
      if (this.placing % 10 === 2 && this.placing % 100 !== 12) return this.placing + 'nd'
      if (this.placing % 10 === 3 && this.placing % 100 !== 13) return this.placing + 'rd'
      return this.placing + 'th'
    },
    beatAvgPlacing () {
      if (!this.tournamentData) return
      let total = 0
      this.winData.forEach(w => { total += w.opponentPlacing })
      return (total / this.winData.length).toFixed(2)
    },
    lostToAvgPlacing () {
      if (!this.tournamentData) return
      let total = 0
      this.lossData.forEach(l => { total += l.opponentPlacing })
      return (total / this.lossData.length).toFixed(2)
    },
  },
  mounted () {
    this.APIQuery()
  },
  methods: {
    APIQuery () {
      fetch(`${this.apiURL}/tournament/${this.tournament}`)
      .then(res => res.json())
      .then(data => { this.tournamentData = data })
    },
    getNameFromID (id) {
      const foundName = this.tournamentData.participants.filter((p) => {
        return p.participant.id === id ? 1 : 0
      })
      if (foundName.length > 0) return foundName[0].participant.display_name
    },
    getIDfromName (name) {
      const foundName = this.tournamentData.participants.filter((p) => {
        return p.participant.display_name === name ? 1 : 0
      })
      if (foundName.length > 0) return foundName[0].participant.id
    },
    getPlacing (participant) {
      const id = typeof participant === 'number' ? participant : this.getIDfromName(participant)
      console.log(id)
      const foundID = this.tournamentData.participants.filter((p) => {
        return p.participant.id === id ? 1 : 0
      })
      if (foundID.length > 0) return foundID[0].participant.final_rank
    },
  },
}
</script>

<style scoped lang="scss">
#app {
  
}

</style>
