<template>
  <div id="userinfo">
    <h2>Level
      <i-count-up
        :start="0"
        :end="currentLevel"
        :decimals="0"
        :duration="3"
        class="highlight"
      />
    </h2>
    <div class="graphbar">
      <div
        class="fill"
        :class="{transitiongraph: currentLevelProgress !== 0}"
        :style="`width: ${(currentLevelProgress / currentLevelTotalPoints) * 100}%;`"
      >
        {{ parseInt(currentLevelProgress) }}
      </div>
      <div class="right">{{ parseInt(currentLevelTotalPoints) }}</div>
    </div>
    <div>
      This Year | This Month
    </div>
    <br />
    <div>Potential future points:</div>
    <div class="sub">Attendance streak</div>
    <div class="sub">Bounce back</div>
    <div class="sub">Gain a rival!</div>
    <br />
    <div>Upcoming Tournaments Near You</div>
    <div class="sub" style="text-decoration: underline;">Friday Night Melee #20</div>
    <div class="sub" style="text-decoration: underline;">Akihabara Weekly 2/16</div>
  </div>
</template>

<script>
import ICountUp from 'vue-countup-v2'

export default {
  components: { ICountUp, },
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
    currentLevel () { return this.levelBreaks.findIndex(b => b >= this.displayPoints + 1) },
    currentLevelTotalPoints () { return this.levelBreaks[this.currentLevel] - this.levelBreaks[this.currentLevel - 1] },
    currentLevelProgress () { return (this.displayPoints - this.levelBreaks[this.currentLevel - 1]) }
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
  mounted () {},
  methods: {
    addPoints () {
      this.adding = true
      window.setTimeout(() => {
        if (this.pointsToAdd === 0)
          return this.adding = false
        this.displayPoints++
        this.addPoints()

        this.pointsToAdd--
      }, 50)
    },
    levelPoints (l) {
      return ((l * 2) * l) + 10
      //return Math.ceil(Math.sqrt(points.total) / 3) },
    },
  },
}
</script>

<style scoped lang="scss">
#userinfo {
  margin-bottom: 30px;
  padding: 0 60px;
}

.right {
  position: absolute;
  right: 6px;
}

.transitiongraph {
  transition: all .05s linear;
}
</style>
