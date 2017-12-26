<template>
  <div id="add">
    <form v-on:submit.prevent="getTournamentAndSiblings">
      <div>Add additional tournaments</div>
      <div class="sub fade">(We'll also automatically pull other tournaments you're in from that host)</div>
      <input v-model="typedTournament" />
      <button type="submit">
        Add
      </button>
    </form>
  </div>
</template>

<script>

export default {
  components: {},
  props: [],
  data () {
    return {
      apiURL: './api',
      typedTournament: '7cx6wwa2',//'lieswkev',//'sqd0djjc',
    }
  },
  computed: {
    user () { return this.$store.state.user },
  },
  mounted () {
    this.$nextTick(() => {
      this.getTournamentAndSiblings()
    })
  },
  methods: {
    getTournamentAndSiblings () {
      fetch(`${this.apiURL}/tournament/${this.typedTournament}`)
      .then(res => res.json())
      .then(data => this.$emit('addTournamentData', data))
      fetch(`${this.apiURL}/alsoCompetedIn/${this.typedTournament}/${this.user}`)
      .then(res => res.json())
      .then(data => {
        for (let t of data)
          this.$emit('addTournamentData', t)
      })
    }
  },
}
</script>

<style scoped lang="scss">
#add {
  margin-bottom: 30px;
}

</style>
