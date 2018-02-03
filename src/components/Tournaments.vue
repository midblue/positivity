<template>
  <div id="tournaments">
    <!-- <h2 class="fade">Tournaments You Competed In</h2> -->
    <transition-group
      name="fade"
      tag="div"
      class="flexwrap"
    >
      <Tournament
        v-for="t, index in tournaments"
        :key="t.id"
        :tournamentData="t"
        :allTournaments="tournaments"
        :points="points.tournaments.find(f => t.url === f.url)"
      />
    </transition-group>
  </div>
</template>

<script>
import Tournament from './Tournament.vue'
export default {
  components: { Tournament, },
  props: [ 'tournaments', 'points', ],
  data () {
    return {}
  },
  computed: {},
  mounted () {},
  methods: {},
}
</script>

<style scoped lang="scss">
#tournaments {
  padding: 30px 30px 60px 60px;
  background: #333;
}

</style>
