<template>
  <div id="app">
    <Header
      :tournaments="tournaments || []"
      v-on:logout="logout"
    />
    <UserInfo
      v-if="user"
    />
    <Tournaments
      v-if="user && tournaments"
      :tournaments="tournaments"
    />
  </div>
</template>

<script>
import Header from './Header.vue'
import UserInfo from './UserInfo.vue'
import Tournaments from './Tournaments.vue'

export default {
  components: { Tournaments, Header, UserInfo, },
  data () {
    return {}
  },
  computed: {
    user () { return this.$store.state.user },
    points () { return this.$store.state.points },
    rawTournamentData () { return this.$store.state.tournaments },
    tournaments () {
      if (!this.user || this.rawTournamentData.length < 1) return []
      const tournaments = this.rawTournamentData.sort((a, b) => a.date < b.date).slice()
      for (let t in tournaments) {
        if (tournaments[t].placing) {
          const winData = this.winData(this.user, tournaments[t])
          const lossData = this.lossData(this.user, tournaments[t])
          tournaments[t] = {
            ...tournaments[t],
            winData,
            lossData,
            beat: winData ? winData.map(m => m.opponent) : [],
            lostTo: lossData ? lossData.map(m => m.opponent) : [],
            userMatches: [...winData, ...lossData].sort((m, n) => m.date > n.date),
          }
        }
        else {
          console.log('ditching', t, tournaments[t].placing)
          tournaments[t] = null
        }
      }
      return tournaments.filter(t => t)
    },
  },
  mounted () {},
  methods: {
    logout () {
      this.$store.state.commit('set', {
        tournaments: [],
        points: {},
      })
    },
    winData (name, tournament) {
      return tournament.matches.map(m => {
        if (m.winner.name === this.user.toLowerCase()){
          return {
            ...m,
            opponent: m.loser.name,
            opponentPlacing: m.loser.placing,
            won: true,
          }
        }
      }).filter(m => m)
    },
    lossData (name, tournament) {
      return tournament.matches.map(m => {
        if (m.loser.name === this.user.toLowerCase()){
          return {
            ...m,
            opponent: m.winner.name,
            opponentPlacing: m.winner.placing,
            won: false,
          }
        }
      }).filter(m => m)
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
