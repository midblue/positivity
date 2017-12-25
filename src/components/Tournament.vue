<template>
  <div class="tournament">
    <h2>
      {{ tournamentData.name }}
      <span class="highlight sub">
        +<i-count-up
          :start="0"
          :end="points.total"
          :decimals="0"
          :duration="5"
        />
        points!
      </span>
    </h2>
    <div>{{ moment(tournamentData.date).fromNow() }}</div>
    <div v-for="d in points.details" class="sub">
      <span class="highlight">+{{ d.value }}</span>
      {{ d.desc }}
      <span class="fade">({{ d.context }})</span>
    </div>
    <h3>You got {{ ordinalNumber(tournamentData.placing) }}</h3>
    <div>of {{ tournamentData.totalParticipants }} entrants (top {{ parseInt(100 * tournamentData.placing / tournamentData.totalParticipants) }}%)</div>
    <div v-if="tournamentData.winData.length > 0">
      <h3>You beat (avg placing {{ beatAvgPlacing(user, tournamentData) }})</h3>
      <div v-for="m, index in tournamentData.winData">
        <span class="fade">{{ formatDateAsTimeOnly(m.time) }} </span>
        <span>{{ m.opponent }}</span>
        <span class="fade sub"> {{ ordinalNumber(m.opponentPlacing) }}</span>
      </div>
    </div>
    <div v-if="tournamentData.lossData.length > 0">
      <h3>You lost to (avg placing {{ lostToAvgPlacing(user, tournamentData) }})</h3>
      <div v-for="(m in tournamentData.lossData">
        <span class="fade">{{ formatDateAsTimeOnly(m.time) }} </span>
        <span>{{ m.opponent }}
        {{ findPlayerInAllLoadedTournaments(m.opponent).map(u => u.url === tournamentData.url ? null : u.placing).filter(v => v).join(', ') }}</span>
        <span class="fade sub"> {{ ordinalNumber(m.opponentPlacing) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'Moment'
import ICountUp from 'vue-countup-v2'
export default {
  props: [ 'tournamentData', 'points', 'allTournaments', ],
  components: { ICountUp, },
  data () {
    return {}
  },
  computed: { 
    user () { return this.$store.state.user },
  },
  mounted () {},
  methods: {
    findPlayerInAllLoadedTournaments (player) {
      let inAllTournaments = []
      for (let t of this.allTournaments) {
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
    beatAvgPlacing (name, tournament) {
      let total = 0
      this.tournamentData.winData.forEach(w => total += w.opponentPlacing)
      return (total / this.tournamentData.winData.length).toFixed(2)
    },
    lostToAvgPlacing (name, tournament) {
      let total = 0
      this.tournamentData.lossData.forEach(l => total += l.opponentPlacing)
      return (total / this.tournamentData.lossData.length).toFixed(2)
    },
    getNameFromID (id, tournament) {
      return tournament.participants.find(p => p.id === id).name
    },
    getIDFromName (name, tournament) {
      return tournament.participants.find(p => p.name === name).id
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
.tournament {
  margin-bottom: 30px;
  background: rgba(white, .05);
  padding: 30px;
}

</style>
