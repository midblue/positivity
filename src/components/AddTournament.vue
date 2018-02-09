<template>
  <div id="add">
    <form v-on:submit.prevent="search">
      <span>Add a tournament</span>
      <input v-model="typedTournament" placeholder="i.e. 'battlegateway'" />
      <button type="submit">
        Search
      </button>
    </form>
    <div class="searchresults">
      <div
        class="searchsection"
        v-for="(sec, key) in searchResults"
        v-if="sec.length > 0"
        :key="key"
      >
        <h3 class="label">{{ key }}:</h3>
        <a
          v-for="(s, index) in sec"
          :key="index"
          @click="getTournamentAndSiblings(s)"
          class="result"
        >
          <div>{{ s.name }}</div>
        </a>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  components: {},
  props: [ 'tournamentsToLoad', ],
  data () {
    return {
      typedTournament: '',//'lieswkev',//'sqd0djjc',
      searchResults: null,
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
    search () {
      fetch(`${this.apiURL}/search/${this.typedTournament}`)
      .then(res => res.json())
      .then(json => this.searchResults = json)
    },
    getTournamentAndSiblings (tournamentObject) {
      this.searchResults = null
      console.log('loading new tournament', tournamentObject)
      this.$emit('getTournamentAndSiblings', tournamentObject)
    },
  },
}
</script>

<style scoped lang="scss">
#add {

  position: relative;

  & > form {
    display: inline-block;
  }

  .searchresults {
    position: absolute;
    top: 150%;
    width: 500px;
    max-width: 100%;
    background: #444;

    h3 {
      padding: 15px 20px;
      background: #333;
      margin: 0;
    }

    a, a:visited, a:hover, a:active {
      display: block;
      color: white;

      & > * {
        cursor: pointer;
        padding: 10px 20px;

        &:hover {
          background: #666;
        }
      }
    }
  }
}

</style>
