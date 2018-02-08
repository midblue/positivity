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
      window.localStorage.removeItem('user')
      this.$store.commit('set', {
        user: null,
        tournaments: [],
        points: {},
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
    getTournamentAndSiblings (tournament, service) {
      this.loading = true
      fetch(`${this.apiURL}/tournament/${'challonge'}/${tournament}/`)
      //.then(() => setTimeout(this.loadData, 1000))
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
