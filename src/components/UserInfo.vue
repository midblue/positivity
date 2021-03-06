<template>
  <div id="userinfo">
    <div v-if="points">
      <h2>
        Level
        <span class="highlight">{{ currentLevel }}</span>
        <div class="sub">
          <span class="highlight">
            {{ displayPoints.toFixed(0) }}
          </span>
          total points
        </div>
        <Coins
          :value="points.specialPointsTotal"
          :total="true"
          class="sub"
        />
      </h2>
      <div class="graphmarkers">
        <div></div>
        <template v-for="key in 3">
          <div class="marker"></div>
          <div class="marker major"></div>
        </template>
        <div class="marker"></div>
        <div></div>
      </div>
      <div
        class="graphbar"
      >
          <div
            class="fill transitiongraph"
            :style="`width: ${(currentLevelProgress / levelPoints(currentLevel)) * 100}%;`"
          >
            <div
              class="month"
              v-if="finalLevelProgress <= thisMonthPoints"
              :style="`width: ${(thisMonthPoints / currentLevelProgress) * 100}%;`"
            >
              <div
                class="week"
                v-if="finalLevelProgress <= thisWeekPoints"
                :style="`width: ${(thisWeekPoints / currentLevelProgress) * 100}%;`"
              >
              </div>
            </div>
            <span class="label">{{ Math.round(currentLevelProgress - 0.4) }}</span>
          </div>
          <div class="right">{{ Math.round(levelPoints(currentLevel)) }}</div>
      </div>
      <div class="martopsmall">
        <span class="all">&nbsp;All Time </span>&nbsp;
        <span class="month">&nbsp;This Month </span>&nbsp;
        <span class="week">&nbsp;This Week </span>&nbsp;
      </div>

      <RivalGraph
        :points="points"
      />

      <!-- <div>Potential future points:</div>
      <div class="sub">Attendance streak</div>
      <div class="sub">Bounce back</div>
      <div class="sub">Gain a rival!</div>
      <br /> -->
      <!-- <div>Upcoming Tournaments Near You</div>
      <div class="sub">
        Next week - 
        <span style="text-decoration: underline;">Akihabara Weekly 2/16</span>
      </div>
      <div class="sub">
        In 2 weeks - 
        <span style="text-decoration: underline;">Friday Night Melee #20</span>
      </div> -->
    </div>
    <h2 v-else>
      Couldn't find you in any tournaments! Add some to see your stats.
    </h2>
  </div>
</template>

<script>
import Coins from './Coins'
import RivalGraph from './RivalGraph'

export default {
  components: { Coins, RivalGraph, },
  props: [],
  data () {
    return {
      displayPoints: 0,
      pointsToAdd: 0,
      adding: false,
    }
  },
  computed: {
    user () { return this.$store.state.user },
    points () { return this.$store.state.points },
    levelBreaks () { 
      const levels = [0]
      let sum = 0
      for (let i = 1; i < 200; i++) {
        sum += this.levelPoints(i)
        levels[i] = sum
      }
      return levels
    },
    currentLevel () { return this.levelBreaks.findIndex(b => b >= this.displayPoints) },
    finalLevel () {
      if (!this.points) return 0
      return this.levelBreaks.findIndex(b => b >= this.points.total)
    },
    currentLevelProgress () {
      if (!this.points) return 0
      return (this.displayPoints - this.levelBreaks[this.currentLevel - 1])
    },
    finalLevelProgress () { 
      if (!this.points) return 0
      return (this.points.total - this.levelBreaks[this.finalLevel - 1]) 
    },
    onFinalLevel () { return this.displayPoints >= this.levelBreaks[this.finalLevel - 1]},
    mostRecentTournamentPoints () { return this.points.tournaments[0].total },
    aWeekAgo () { return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    aMonthAgo () { return new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000) },
    thisWeekPoints () {
      if (!this.points || this.points.total === 0) return 0
      return this.points.tournaments
        .map(t => new Date(t.date) >= this.aWeekAgo ? t.total : 0 )
        .reduce((total, t) => total += t)
    },
    thisMonthPoints () {
      if (!this.points || this.points.total === 0) return 0
      return this.points.tournaments
        .map(t => new Date(t.date) >= this.aMonthAgo ? t.total : 0 )
        .reduce((total, t) => total += t)
    },
  },
  watch : {
    points (newPoints, oldPoints) {
      console.log(newPoints)
      this.pointsToAdd += (newPoints ? newPoints.total : 0) - (oldPoints ? oldPoints.total : 0)
    },
    pointsToAdd (newPointsToAdd) {
      if (newPointsToAdd > 0 && this.adding == false)
        this.addPoints()
    },
  },
  mounted () {
    this.pointsToAdd = this.points.total
  },
  methods: {
    addPoints () {
      this.adding = true
      window.setTimeout(() => {
        if (this.pointsToAdd === 0)
          return this.adding = false
        let pointsToAddThisTime = this.points ? 
          (this.points.total - this.displayPoints) / 40 + (this.points.total / 1000)
          : 0
        if (pointsToAddThisTime > this.pointsToAdd) pointsToAddThisTime = this.pointsToAdd
        this.displayPoints += pointsToAddThisTime
        this.pointsToAdd -= pointsToAddThisTime
        this.addPoints()
      }, 40)
    },
    levelPoints (l) {
      return (((l * 2) * l) + 10) * 5000
    },
  },
}
</script>

<style scoped lang="scss">
#userinfo {
  padding: 30px 60px 60px 60px;
  background: #222;
}

.right {
  position: absolute;
  right: 6px;
}

.transitiongraph {
  transition: all .04s linear;
}

.all {
  background: #0f0 !important;
  color: #222;
}

.month {
  background: #0fa !important;
  color: #222;
}
.week {
  background: #0ff !important;
  color: #222;
}
</style>
