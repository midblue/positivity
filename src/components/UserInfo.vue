<template>
  <div id="userinfo">
    <div>Upcoming Tournaments Near You</div>
    <div class="sub">
      Next week - 
      <span style="text-decoration: underline;">Akihabara Weekly 2/16</span>
    </div>
    <div class="sub">
      In 2 weeks - 
      <span style="text-decoration: underline;">Friday Night Melee #20</span>
    </div>
    <br />
    <h2>
      Level
      <span class="highlight">{{ this.currentLevel }}</span>
    </h2>
    <div class="graphmarkers">
      <template v-for="key in 4">
        <div class="marker major"></div>
        <div class="marker"></div>
      </template>
      <div class="marker major"></div>
    </div>
    <div class="graphbar">
      <div
        class="fill"
        :class="{
          transitiongraph: currentLevelProgress > 0.3,
          week: finalLevel == currentLevel && finalLevelProgress <= thisWeekPoints,
          month: finalLevel == currentLevel && finalLevelProgress <= thisMonthPoints,
        }"
        :style="`width: ${(currentLevelProgress / currentLevelTotalPoints) * 100}%;`"
      >
        {{ Math.round(currentLevelProgress - 0.4) }}
      </div>
      <div class="right">{{ Math.round(currentLevelTotalPoints) }}</div>
    </div>
    <div class="martopsmall">
      <span class="all">All</span>
      <span class="month">Month</span>
      <span class="week">Week</span>
    </div>
    <br />
    <div>Potential future points:</div>
    <div class="sub">Attendance streak</div>
    <div class="sub">Bounce back</div>
    <div class="sub">Gain a rival!</div>
  </div>
</template>

<script>

export default {
  components: { },
  props: [ 'points', ],
  data () {
    return {
      displayPoints: 0,
      pointsToAdd: 0,
      adding: false,
    }
  },
  computed: {
    user () { return this.$store.state.user },
    levelBreaks () { 
      const levels = [0]
      let sum = 0
      for (let i = 1; i < 200; i++){
        sum += this.levelPoints(i)
        levels[i] = sum
      }
      return levels
    },
    currentLevel () { return this.levelBreaks.findIndex(b => b >= this.displayPoints) },
    finalLevel () { return this.levelBreaks.findIndex(b => b >= this.points.total) },
    currentLevelTotalPoints () { return this.levelBreaks[this.currentLevel] - this.levelBreaks[this.currentLevel - 1] },
    currentLevelProgress () { return (this.displayPoints - this.levelBreaks[this.currentLevel - 1]) },
    finalLevelProgress () { return (this.points.total - this.levelBreaks[this.finalLevel - 1]) },
    mostRecentTournamentPoints () { return this.points.tournaments[0].total },
    aWeekAgo () { return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    aMonthAgo () { return new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000) },
    thisWeekPoints () {
      if (this.points.total === 0) return 0
      return this.points.tournaments
        .map(t => new Date(t.date) >= this.aWeekAgo ? t.total : 0 )
        .reduce((total, t) => total += t)
    },
    thisMonthPoints () {
      if (this.points.total === 0) return 0
      return this.points.tournaments
        .map(t => new Date(t.date) >= this.aMonthAgo ? t.total : 0 )
        .reduce((total, t) => total += t)
    },
  },
  watch : {
    points (newPoints, oldPoints) {
      this.pointsToAdd += newPoints.total - oldPoints.total
    },
    pointsToAdd (newPointsToAdd) {
      if (newPointsToAdd > 0 && this.adding == false)
        this.addPoints()
    },
  },
  mounted () {
  },
  methods: {
    addPoints () {
      this.adding = true
      window.setTimeout(() => {
        if (this.pointsToAdd === 0)
          return this.adding = false
        let pointsToAddThisTime = ((this.points.total / (this.displayPoints || 1)) - 1) + (this.points.total / 1500)
        if (pointsToAddThisTime > this.pointsToAdd) pointsToAddThisTime = this.pointsToAdd
        this.displayPoints += pointsToAddThisTime
        this.pointsToAdd -= pointsToAddThisTime
        this.addPoints()
      }, 40)
    },
    levelPoints (l) {
      return (((l * 2) * l) + 10) * 5
      //return Math.ceil(Math.sqrt(points.total) / 3) },
    },
  },
}
</script>

<style scoped lang="scss">
#userinfo {
  margin-bottom: 60px;
  padding: 0 60px;
}

.right {
  position: absolute;
  right: 6px;
}

.transitiongraph {
  transition: all .04s linear;
}

.all {
  background: #0f0;
  color: #222;
}

.month {
  background: #0f7;
  color: #222;
}
.week {
  background: #0fd;
  color: #222;
}
</style>
