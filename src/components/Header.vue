<template>
  <div id="header">
    <h1 class="padright">{{ user }}</h1>
    <a class="button padright" @click.prevent="logout">Logout</a>
    <div v-if="tournaments && tournaments.length > 0" class="padright padtop padbot">
      <div>
        Found you in {{ tournaments.length }} tournament<span v-if="tournaments.length !== 1">s</span>
      </div>
    </div>
    <AddTournament
      v-on:getTournamentAndSiblings="getTournamentAndSiblings"
    />
    <div v-if="loading" class="three-quarters-loader fixtopright"></div>
  </div>
</template>

<script>
import AddTournament from './AddTournament.vue'

export default {
  components: { AddTournament, },
  props: [],
  data () {
    return {
      loading: true,
    }
  },
  computed: {
    user () { return this.$store.state.user },
    apiURL () { return this.$store.state.apiURL },
    tournaments () { return this.$store.state.tournaments },
  },
  mounted () {
    this.logInCheck()
  },
  methods: {
    logout () {
      localStorage.removeItem('user')
      localStorage.removeItem('rival')
      this.$store.commit('set', {
        user: null,
        tournaments: null,
        points: null,
      })
      this.logInCheck()
    },
    logInCheck () {
      let storedUser = window.localStorage.getItem('user')
      while (!storedUser || storedUser === 'null') {
        storedUser = window.prompt('Enter player tag')
        window.localStorage.setItem('user', storedUser)
      }
      this.$store.commit('set', {
        user: storedUser,
      })
      this.$nextTick(() => this.loadData())
    },
    getTournamentAndSiblings (t) {
      this.loading = true
      fetch(`${this.apiURL}/tournament/${t.service}/${t.url}/`)
      .then(res => res.json())
      .then(() => {
        console.log('finished loading new tournament data. refreshing...')
        this.loadData()
      })
    },
    loadData () {
      fetch(`${this.apiURL}/player/${this.user}`)
      .then(res => res.json())
      .then(data => {
        this.$store.commit('set', {
          points: data.points,
          tournaments: data.tournaments,
        })
        this.loading = false
      })
    }
  },
}
</script>

<style scoped lang="scss">
#header {
  width: 100%;
  background: #111;
  // border-bottom: 1px solid #000;
  padding: 0 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1000;

  .button {
    text-decoration: underline;
  }

  .padright {
    padding-right: 42px;
  }
  .padtop {
    padding-top: 30px;
  }
  .padbot {
    padding-bottom: 30px;
  }
  .fixtopright {
    position: fixed;
    top: 30px;
    right: 30px;
  }
}

</style>
