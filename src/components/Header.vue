<template>
  <div id="header">
    <h1 class="padright">{{ user }}</h1>
    <a class="button padright" @click.prevent="logout">Logout</a>
    <div v-if="tournaments.length > 0" class="padright padtop padbot">
      <div>Found you in {{ tournaments.length }} tournament<span v-if="tournaments.length !== 1">s</span></div>
      <!-- <span v-if="tournaments.length > 0">:</span></div>
      <div v-for="t in tournaments" class="sub">
        {{ t.name }}
      </div> -->
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
      loading: false,
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
      this.$emit('logout')
      window.localStorage.removeItem('user')
      this.$store.commit('set', {
        user: null,
      })
      this.logInCheck()
    },
    logInCheck () {
      let storedUser = window.localStorage.getItem('user')
      while (!storedUser || storedUser === 'null') {
        storedUser = window.prompt('Enter player tag')
        window.localStorage.setItem('user', storedUser)
      }
      fetch(`${this.apiURL}/player/${storedUser}`)
      .then(res => res.json())
      .then(data => {
        this.$store.commit('set', {
          user: storedUser,
          points: data.points,
          tournaments: data.tournaments,
        })
      })
    },
    getTournamentAndSiblings (tournament, service) {
      this.loading = true
      fetch(`${this.apiURL}/${service}/${tournament}`)
      .then(res => res.json())
      .then(data => this.$emit('addTournamentData', data))
      .then(this.getPoints)
      fetch(`${this.apiURL}/alsoCompetedIn/${service}/${tournament}/${this.user}`)
      .then(res => res.json())
      .then(data => {
        for (let t of data)
          this.$emit('addTournamentData', t)
        this.loading = false
      })
      .then(this.getPoints)
    },
    getPoints () {

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
