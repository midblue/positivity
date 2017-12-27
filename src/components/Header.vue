<template>
  <div id="header">
    <h1>{{ user }}</h1>
    <AddTournament
      v-on:addTournamentData="addTournamentData"
    />
  </div>
</template>

<script>
import AddTournament from './AddTournament.vue'

export default {
  components: { AddTournament, },
  props: [],
  data () {
    return {}
  },
  computed: {
    user () { return this.$store.state.user },
  },
  mounted () {},
  methods: {
    addTournamentData (data) {
      this.$emit('addTournamentData', data)
    },
  },
}
</script>

<style scoped lang="scss">
#header {
  width: 100%;
  height: 6em;
  background: #222;
  padding: 0 60px;
  display: flex;
  align-items: center;

  h1{
    padding-right: 30px;
  }
}

</style>
