<template>
  <div id="app">
    <Header
      v-on:addTournamentData="addTournamentData"
    />
    <UserInfo
      :points="points"
    />
    <Tournaments
      :tournaments="tournaments"
      :points="points"
    />
  </div>
</template>

<script>
import Header from './components/Header.vue'
import UserInfo from './components/UserInfo.vue'
import Tournaments from './components/Tournaments.vue'
import points from './scripts/points.js'

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
      const tournaments = this.rawTournamentData.sort((a, b) => a.date < b.date)
      for (let t in tournaments) {
        const winData = this.winData(this.user, tournaments[t])
        const lossData = this.lossData(this.user, tournaments[t])
        tournaments[t] = {
          ...tournaments[t],
          winData: winData,
          lossData: lossData,
          beat: winData ? winData.map(m => m.opponent) : [],
          lostTo: lossData ? lossData.map(m => m.opponent) : [],
          placing: this.getPlacing(this.user, tournaments[t]),
          totalParticipants: tournaments[t].participants.length,
          userMatches: [...winData, ...lossData],
        }
      }
      return tournaments
    },
    points () {
      return points(this.tournaments)
    },
  },
  mounted () {
    this.$store.commit('set', {
      user: window.localStorage.getItem('user') || 'jasp',
    })
  },
  methods: {
    addTournamentData (data) {
      this.rawTournamentData.push(data)
    },
    winData (name, tournament) {
      const id = this.getIDFromName(name, tournament)
      return tournament.matches.map(m => {
        if (m.winnerId === id){
          return {
            ...m,
            opponent: this.getNameFromID(m.loserId, tournament),
            opponentPlacing: this.getPlacing(m.loserId, tournament),
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
          }
        }
      }).filter(m => m)
    },
    getNameFromID (id, tournament) {
      return tournament.participants.find(p => p.id === id).name
    },
    getIDFromName (name, tournament) {
      return tournament.participants.find(p => p.name === name).id
    },
    getPlacing (participant, tournament) {
      const id = typeof participant === 'number' ? participant : this.getIDFromName(participant, tournament)
      return tournament.participants.find(p => p.id === id).placing
    },
  },
}
</script>

<style scoped lang="scss">
#app {
  width: 100%;
  height: 100vh;
  font-family: monospace;
  font-size: 14px;
  color: #f5f5f3;
  background: #333;
  overflow-y: auto;
}

</style>
