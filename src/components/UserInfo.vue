<template>
  <div id="userinfo">
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
    <div>Potential future points:</div>
    <div class="sub">Attendance streak</div>
    <div class="sub">Bounce back</div>
    <div class="sub">Gain a rival!</div>
  </div>
</template>

<script>
import ICountUp from 'vue-countup-v2'

export default {
  components: { ICountUp, },
  props: [ 'points', ],
  data () {
    return {

    }
  },
  computed: {
    user () { return this.$store.state.user },
  },
  mounted () {},
  methods: {
    
  },
}
</script>

<style scoped lang="scss">
#userinfo {
  margin-bottom: 30px;
  padding: 0 60px;
}
</style>
