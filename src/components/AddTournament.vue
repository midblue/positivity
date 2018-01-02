<template>
  <div id="add">
    <form v-on:submit.prevent="getTournamentAndSiblings(typedTournament)">
      <span>Add additional tournament (url ending)</span>
      <input v-model="typedTournament" placeholder="i.e. 'lieswkev'" />
      <button type="submit">
        Add
      </button>
    </form>
  </div>
</template>

<script>

export default {
  components: {},
  props: [ 'tournamentsToLoad', ],
  data () {
    return {
      typedTournament: '',//'lieswkev',//'sqd0djjc',
    }
  },
  computed: {
    user () { return this.$store.state.user },
    apiURL () { return this.$store.state.apiURL },
  },
  mounted () {
    this.$nextTick(() => {
      //this.getTournamentAndSiblings(this.typedTournament)
    })
  },
  methods: {
    getTournamentAndSiblings (t) { this.$emit('getTournamentAndSiblings', t) }
  },
}
</script>

<style scoped lang="scss">
#add {
  & > * {
    display: inline-block;
  }
}

</style>
