<template>
  <div id="app">
    <h1>{{ user }}</h1>
    <form v-on:submit.prevent="getTournamentAndSiblings">
      <div>Add additional tournaments</div>
      <input v-model="typedTournament" />
      <button type="submit">
        Add
      </button>
    </form>
    <br />
    <h2>Level <span class="highlight">{{ Math.ceil(Math.sqrt(points.total) / 3) }}</span></h2>
    <h2>Total points: <span class="highlight">{{ points.total }}</span></h2>
    <div v-for="t in points.tournaments">
      <div v-for="d in t.details" class="sub">
        <span class="highlight">+{{ d.value }}</span>
        {{ d.desc }}
        <span class="fade">({{ d.context }})</span>
      </div>
    </div>
    <br />
    <div>Potential future points:</div>
    <div class="sub">Attendance streak</div>
    <div class="sub">Bounce back</div>
    <div class="sub">Gain a rival!</div>
    <br />
    <br />
    <div v-for="t in tournaments">
      <h2>
        {{ t.name }}
        <span class="highlight sub">
          +{{ points.tournaments[t.url].total }} points!
        </span>
      </h2>
      <div>{{ moment(t.date).fromNow() }}</div>
      <h3>You got {{ ordinalNumber(t.placing) }}</h3>
      <div>of {{ t.totalParticipants }} entrants (top {{ parseInt(100 * t.placing / t.totalParticipants) }}%)</div>
      <div v-if="t.winData.length > 0">
        <h3>You beat (avg placing {{ beatAvgPlacing(user, t) }})</h3>
        <div v-for="m, index in t.winData">
          <span class="fade">{{ formatDateAsTimeOnly(m.time) }} </span>
          <span>{{ m.opponent }}</span>
          <span class="fade sub"> {{ ordinalNumber(m.opponentPlacing) }}</span>
        </div>
      </div>
      <div v-if="t.lossData.length > 0">
        <h3>You lost to (avg placing {{ lostToAvgPlacing(user, t) }})</h3>
        <div v-for="(m in t.lossData">
          <span class="fade">{{ formatDateAsTimeOnly(m.time) }} </span>
          <span>{{ m.opponent }}
          {{ findPlayerInAllLoadedTournaments(m.opponent).map(u => u.url === t.url ? null : u.placing).filter(v => v).join(', ') }}</span>
          <span class="fade sub"> {{ ordinalNumber(m.opponentPlacing) }}</span>
        </div>
      </div>
      <br />
      <br />
    </div>
  </div>
</template>

<script>
import moment from 'Moment'
export default {
  data () {
    return {
      apiURL: './api',
      typedTournament: '7cx6wwa2',//'lieswkev',//'sqd0djjc',
      user: 'jasp',//'Hungrybox',
      rawTournamentData: [],
    }
  },
  computed: {
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
    this.user = window.localStorage.getItem('user') || 'jasp'
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
    id (inTournament) {
      for (let t of rawTournamentData)
      return this.participantElement.id
    },
    findPlayerInAllLoadedTournaments (player) {
      let inAllTournaments = []
      for (let t of this.tournaments) {
        for (let p of t.participants) {
          if (p.name.toLowerCase() === player.toLowerCase()) {
            inAllTournaments.push({
              name: t.name,
              placing: p.placing,
              seed: p.seed,
              date: t.date,
              url: t.url,
            })
            break
          }
        }
      }
      return inAllTournaments
    },
    winData (name, tournament) {
      const id = this.getIDfromName(name, tournament)
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
      const id = this.getIDfromName(name, tournament)
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
    beatAvgPlacing (name, tournament) {
      let total = 0
      const winData = this.winData(name, tournament)
      winData.forEach(w => total += w.opponentPlacing)
      return (total / winData.length).toFixed(2)
    },
    lostToAvgPlacing (name, tournament) {
      let total = 0
      const lossData = this.lossData(name, tournament)
      lossData.forEach(l => total += l.opponentPlacing)
      return (total / lossData.length).toFixed(2)
    },
    getNameFromID (id, tournament) {
      return tournament.participants.find(p => p.id === id).name
    },
    getIDfromName (name, tournament) {
      return tournament.participants.find(p => p.name === name).id
    },
    getPlacing (participant, tournament) {
      const id = typeof participant === 'number' ? participant : this.getIDfromName(participant, tournament)
      return tournament.participants.find(p => p.id === id).placing
    },
    formatDateAsTimeOnly (date) {
      const d = new Date(date)
      return d.getHours() + ':' + d.getMinutes()
    },
    ordinalNumber (number) {
      if (number % 10 === 1 && number % 100 !== 11) return number + 'st'
      if (number % 10 === 2 && number % 100 !== 12) return number + 'nd'
      if (number % 10 === 3 && number % 100 !== 13) return number + 'rd'
      return number + 'th'
    },
    moment (arg) {
      return moment(arg)
    }
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
