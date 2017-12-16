<template>
  <div id="app">
    <form v-on:submit.prevent="APIQuery">
      <input v-model="tournament" />
      <input v-model="typedParticipant" />
      <button type="submit">
        Go
      </button>
    </form>
    <br />
    <br />
    <div v-if="tournamentData">
      <h2>{{ participant }} got {{ placingOrdinal }}</h2>
      <div>of {{ totalParticipants }} entrants (top {{ parseInt(100 * placing / totalParticipants) }}%)</div>
      <div>at {{ tournamentName }}</div>
      <br />
      <div>
        <h3>Beat (avg placing {{ beatAvgPlacing }})</h3>
        <div v-for="win in winData">
          <span class="fade">{{ formatDateAsTimeOnly(win.completed_at) }} </span>
          <span>{{ win.opponent }}</span>
          <span class="fade sub"> {{ ordinalNumber(win.opponentPlacing) }}</span>
        </div>
      </div>
      <br />
      <div>
        <h3>Lost to (avg placing {{ lostToAvgPlacing }})</h3>
        <div v-for="loss in lossData">
          <span class="fade">{{ formatDateAsTimeOnly(loss.completed_at) }} </span>
          <span>{{ loss.opponent }}</span>
          <span class="fade sub"> {{ ordinalNumber(loss.opponentPlacing) }}</span>
        </div>
      </div>
    </div>
    <br />
    <div v-if="otherTournaments.length">
      <div>
        We also found {{ participant }} in 
        <strong>{{ otherTournaments.length }}</strong>
        related tournaments.
      </div>
    </div>
    <div v-else class="fade">
      Searching related tournaments...
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      apiURL: './api',
      tournament: 'lieswkev',
      participant: 'watch',
      typedParticipant: 'watch',
      tournamentData: {},
      otherTournaments: {}
    }
  },
  computed: {
    participantElement () {
      if (!this.tournamentData[this.tournament]) return
      return this.tournamentData[this.tournament].participants.filter((p) => {
        return p.participant.display_name === this.participant ? 1 : 0
      })[0].participant
    },
    tournamentName () {
      if (!this.tournamentData[this.tournament]) return
      return this.tournamentData[this.tournament].name
    },
    totalParticipants () {
      if (!this.tournamentData[this.tournament]) return
      return this.tournamentData[this.tournament].participants_count
    },
    id () {
      if (!this.tournamentData[this.tournament]) return
      return this.participantElement.id
    },
    winData () {
      const tournament = this.tournamentData[this.tournament]
      if (!tournament) return
      let data = []
      for (let m in tournament.matches){
        if (tournament.matches[m].match.winner_id === this.id){
          data.push({
            ...tournament.matches[m].match,
            opponent: this.getNameFromID(tournament.matches[m].match.loser_id),
            opponentPlacing: this.getPlacing(tournament.matches[m].match.loser_id),
          })
        }
      }
      return data
    },
    lossData () {
      const tournament = this.tournamentData[this.tournament]
      if (!tournament) return
      let data = []
      for (let m in tournament.matches){
        if (tournament.matches[m].match.loser_id === this.id){
          data.push({
            ...tournament.matches[m].match,
            opponent: this.getNameFromID(tournament.matches[m].match.winner_id),
            opponentPlacing: this.getPlacing(tournament.matches[m].match.winner_id),
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
      if (!this.tournamentData[this.tournament]) return
      return this.participantElement.final_rank
    },
    placingOrdinal () {
      if (!this.placing) return
      return this.ordinalNumber(this.placing)
    },
    beatAvgPlacing () {
      if (!this.tournamentData[this.tournament]) return
      let total = 0
      this.winData.forEach(w => { total += w.opponentPlacing })
      return (total / this.winData.length).toFixed(2)
    },
    lostToAvgPlacing () {
      if (!this.tournamentData[this.tournament]) return
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
      .then(data => {
        this.participant = this.typedParticipant
        this.$set(this.tournamentData, this.tournament, data)
      })
      this.otherTournaments = {}
      fetch(`${this.apiURL}/sisterTournaments/${this.tournament}/${this.participant}`)
      .then(res => res.json())
      .then(data => this.otherTournaments = data)
    },
    formatDateAsTimeOnly (date) {
      const d = new Date(date)
      return d.getHours() + ':' + d.getMinutes()
    },
    getNameFromID (id) {
      const foundName = this.tournamentData[this.tournament].participants.filter((p) => {
        return p.participant.id === id ? 1 : 0
      })
      if (foundName.length > 0) return foundName[0].participant.display_name
    },
    getIDfromName (name) {
      const foundName = this.tournamentData[this.tournament].participants.filter((p) => {
        return p.participant.display_name === name ? 1 : 0
      })
      if (foundName.length > 0) return foundName[0].participant.id
    },
    getPlacing (participant) {
      const id = typeof participant === 'number' ? participant : this.getIDfromName(participant)
      const foundID = this.tournamentData[this.tournament].participants.filter((p) => {
        return p.participant.id === id ? 1 : 0
      })
      if (foundID.length > 0) return foundID[0].participant.final_rank
    },
    ordinalNumber (number) {
      if (number % 10 === 1 && number % 100 !== 11) return number + 'st'
      if (number % 10 === 2 && number % 100 !== 12) return number + 'nd'
      if (number % 10 === 3 && number % 100 !== 13) return number + 'rd'
      return number + 'th'
    },
  },
}
</script>

<style scoped lang="scss">
#app {
  width: 100%;
  height: 100vh;
  padding: 60px;
  font-family: monospace;
  font-size: 14px;
  color: #222;
  background: #f5f5f3;
  overflow-y: auto;
}

</style>
