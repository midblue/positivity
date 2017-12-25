<template>
  <div id="app">
    <form v-on:submit.prevent="getTournamentAndSiblings">
      <div>Add additional tournaments</div>
      <div class="sub fade">(We'll also automatically pull other tournaments you're in from that host)</div>
      <input v-model="typedTournament" />
      <button type="submit">
        Add
      </button>
    </form>
    <br />
    <h1>{{ user }}</h1>
    <h2>Level
      <i-count-up
        :start="0"
        :end="Math.ceil(Math.sqrt(points.total) / 3)"
        :decimals="0"
        :duration="5"
        class="highlight"
      />
    </h2>
    <h2>Total points:
      <i-count-up
        :start="0"
        :end="points.total"
        :decimals="0"
        :duration="5"
        class="highlight"
      />
    </h2>
    <br />
    <div>Potential future points:</div>
    <div class="sub">Attendance streak</div>
    <div class="sub">Bounce back</div>
    <div class="sub">Gain a rival!</div>
    <br />
    <br />
    <transition-group name="fade">
      <Tournament
        v-for="t, index in tournaments"
        :key="index"
        :tournamentData="t"
        :allTournaments="tournaments"
        :points="points.tournaments[t.url]"
      />
    </transition-group>
  </div>
</template>

<script>
import Tournament from './components/Tournament.vue'
import ICountUp from 'vue-countup-v2'
export default {
  components: { ICountUp, Tournament, },
  data () {
    return {
      apiURL: './api',
      typedTournament: '7cx6wwa2',//'lieswkev',//'sqd0djjc',
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
      const points = {}
      for (let t of this.tournaments) {
        const details = []
        details.push({ value: 20, desc: 'Participated in a tournament', context: t.name })
        if (t.totalParticipants < 20) details.push({ value: 5, desc: 'Supporting the local scene', context: 'small tournament' })
        else if (t.totalParticipants > 200) details.push({ value: 10, desc: 'Getting in the mix', context: 'major tournament' })
        for (let m of t.winData) details.push({ value: Math.ceil(((t.totalParticipants - m.opponentPlacing) / t.totalParticipants * 10) + 2), desc: 'Won a game', context: `${m.opponent}` })
        for (let m of t.lossData) details.push({ value: Math.ceil(((t.totalParticipants - m.opponentPlacing) / t.totalParticipants * 10) + 2), desc: 'Took an L', context: `${m.opponent}` })
        let total = 0
        details.forEach(p => {
          total += p.value
        })
        points[t.url] = { total: total, details: details }
      }
      let total = 0
      for (let p in points) total += points[p].total
      return {
        total: total,
        tournaments: points,
      }
    },
  },
  mounted () {
    this.$store.commit('set', {
      user: window.localStorage.getItem('user') || 'jasp',
    })
    this.getTournamentAndSiblings()
  },
  methods: {
    getTournamentAndSiblings () {
      fetch(`${this.apiURL}/tournament/${this.typedTournament}`)
      .then(res => res.json())
      .then(data => this.rawTournamentData.push(data))
      fetch(`${this.apiURL}/alsoCompetedIn/${this.typedTournament}/${this.user}`)
      .then(res => res.json())
      .then(data => {
        for (let t of data)
          this.rawTournamentData.push(t)
      })
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
  padding: 30px 60px 120px 60px;
  font-family: monospace;
  font-size: 14px;
  color: #f5f5f3;
  background: #333;
  overflow-y: auto;
}

</style>
