<template>
  <div class="tournament">
    <h2>
      {{ tournamentData.name }}
      <span class="sub fade">({{ moment(tournamentData.date).fromNow() }})</span>
    </h2>
    <div class="topsection">
      <div class="sub">
        <span class="highlight">
          +<i-count-up
          :start="0"
          :end="points.total"
          :decimals="0"
          :duration="5"
        />
        </span>
        points!
        <Coins :value="points.specialPointsTotal" />
      </div>
    </div>
    <div class="pointsbreakdown">
      <div
        v-for="category in points.details"
        class="pointscategory"
      >
        <div v-for="point in category">
          <span class="highlight" :class="{alt: point.type !== 'concrete', }">+{{ point.value }}</span>
          {{ point.desc }}
          <span v-if="point.context" class="fade">({{ point.context }})</span>
        </div>
      </div>
    </div>
    <div class="sub" v-if="tournamentData.placing">
      <div>
        Placing: {{ ordinalNumber(tournamentData.placing) }}
        <span class="fade">
          of {{ tournamentData.totalParticipants }} players
          (top {{ parseInt(100 * tournamentData.placing / tournamentData.totalParticipants) }}%)
        </span>
      </div>
      <div v-if="tournamentData.winData.length > 0">
        <div>
          Beat:
          <span class="fade">
            (avg placing {{ ordinalNumber(Math.ceil(beatAvgPlacing(user, tournamentData))) }})
          </span>
        </div>
        <div v-for="m, index in tournamentData.winData">
          <span class="fade">{{ formatDateAsTimeOnly(m.time) }} </span>
          <span>{{ m.opponent }}</span>
          <span class="fade sub"> {{ ordinalNumber(m.opponentPlacing) }}</span>
        </div>
      </div>
      <div v-if="tournamentData.lossData.length > 0">
        <div>
          <span v-if="tournamentData.winData.length > 0">and l</span><span v-else>L</span>ost to:
          <span class="fade">
            (avg placing {{ ordinalNumber(Math.floor(lostToAvgPlacing(user, tournamentData))) }})
          </span>
        </div>
        <div v-for="(m in tournamentData.lossData">
          <span class="fade">{{ formatDateAsTimeOnly(m.time) }} </span>
          <span>{{ m.opponent }}</span>
          <span class="fade sub"> {{ ordinalNumber(m.opponentPlacing) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'Moment'
import ICountUp from 'vue-countup-v2'
import Coins from './Coins.vue'

export default {
  props: [ 'tournamentData', 'points', 'allTournaments', ],
  components: { ICountUp, Coins, },
  data () {
    return {}
  },
  computed: { 
    user () { return this.$store.state.user },
  },
  mounted () {},
  methods: {
    beatAvgPlacing (name, tournament) {
      let total = 0
      this.tournamentData.winData.forEach(w => total += w.opponentPlacing)
      return (total / this.tournamentData.winData.length).toFixed(1)
    },
    lostToAvgPlacing (name, tournament) {
      let total = 0
      this.tournamentData.lossData.forEach(l => total += l.opponentPlacing)
      return (total / this.tournamentData.lossData.length).toFixed(1)
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
  flex: 1;
  min-width: 300px;
  margin-bottom: 30px;
  margin-right: 30px;
  //background: rgba(white, .05);
  //padding: 30px;
}

.topsection {
  font-size: 1.5em;
  padding-bottom: 10px;
  border-bottom: 1px solid #444;
  margin-bottom: 10px;
}

.pointsbreakdown {
  padding-top: 15px;

  .pointscategory {
    margin-bottom: 24px;
  }
}

</style>
