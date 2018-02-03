<template>
  <div id="app">
    <Header
      :tournaments="tournaments || []"
      v-on:addTournamentData="addTournamentData"
      v-on:logout="logout"
    />
    <UserInfo
      v-if="user"
      :points="points"
    />
    <Tournaments
      v-if="user && tournaments"
      :tournaments="tournaments"
      :points="points"
    />
  </div>
</template>

<script>
import Header from './Header.vue'
import UserInfo from './UserInfo.vue'
import Tournaments from './Tournaments.vue'
import points from '../scripts/points.js'

export default {
  components: { Tournaments, Header, UserInfo, },
  data () {
    return {
      rawTournamentData: [],
    }
  },
  computed: {
    user () { return this.$store.state.user },
    tournaments () {
      if (!this.user || this.rawTournamentData.length < 1) return []
      const tournaments = this.rawTournamentData.sort((a, b) => a.date < b.date).slice()
      for (let t in tournaments) {
        const placing = this.getPlacing(this.user, tournaments[t])
        console.log(placing)
        if (placing) {
          const winData = this.winData(this.user, tournaments[t])
          const lossData = this.lossData(this.user, tournaments[t])
          tournaments[t] = {
            ...tournaments[t],
            placing,
            winData,
            lossData,
            beat: winData ? winData.map(m => m.opponent) : [],
            lostTo: lossData ? lossData.map(m => m.opponent) : [],
            totalParticipants: tournaments[t].participants.length,
            userMatches: [...winData, ...lossData].sort((m, n) => m.date > n.date),
          }
        }
        else {
          console.log('ditching', t, placing)
          tournaments[t] = null
        }
      }
      return tournaments.filter(t => t)
    },
    points () {
      if (!this.user || !this.tournaments) return null
      return points(this.tournaments, this.user)
    },
  },
  mounted () {},
  methods: {
    addTournamentData (data) {
      if (!this.rawTournamentData.find(t => t.url === data.url))
        this.rawTournamentData.push(data)
    },
    logout () {
      this.rawTournamentData = []
    },
    winData (name, tournament) {
      const id = this.getIDFromName(name, tournament)
      return tournament.matches.map(m => {
        if (m.winnerId === id){
          return {
            ...m,
            opponent: this.getNameFromID(m.loserId, tournament),
            opponentPlacing: this.getPlacing(m.loserId, tournament),
            won: true,
          }
        }
      }).filter(m => m)
    },
    lossData (name, tournament) {
      const id = this.getIDFromName(name, tournament)
      return tournament.matches.map(m => {
        if (m.loserId === id){
          return {
            ...m,
            opponent: this.getNameFromID(m.winnerId, tournament),
            opponentPlacing: this.getPlacing(m.winnerId, tournament),
            won: false,
          }
        }
      }).filter(m => m)
    },
    getNameFromID (id, tournament) {
      return tournament.participants.find(p => p.id === id).name.toLowerCase()
    },
    getIDFromName (name, tournament) {
      const found = tournament.participants.find(p => p.name.toLowerCase() === name.toLowerCase())
      return found ? found.id : false
    },
    getPlacing (participant, tournament) {
      const name = typeof participant !== 'number' ? participant : this.getNameFromID(participant, tournament)
      const found = tournament.participants.find(p => p.name.toLowerCase() === name.toLowerCase())
      return found ? found.placing : false
    },
  },
}
</script>

<style scoped lang="scss">
#app {
  font-family: monospace;
  font-size: 14px;
  color: #f5f5f3;
}

</style>
