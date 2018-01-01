<template>
  <div id="header">
    <h1 class="padright">{{ user }}</h1>
    <a class="button padright" @click.prevent="logOut">Logout</a>
    <div class="sub padright padtop">
      <div>Found you in {{ tournaments.length }} tournaments:</div>
      <div v-for="t in tournaments">
        {{ t.name }}
      </div>
    </div>
    <AddTournament
      v-on:getTournamentAndSiblings="getTournamentAndSiblings"
    />
  </div>
</template>

<script>
import AddTournament from './AddTournament.vue'

export default {
  components: { AddTournament, },
  props: [ 'tournaments', ],
  data () {
    return {}
  },
  computed: {
    user () { return this.$store.state.user },
    apiURL () { return this.$store.state.apiURL },
  },
  mounted () {
    this.logInCheck()
  },
  methods: {
    logOut () {
      window.localStorage.removeItem('user')
      this.$store.commit('set', {
        user: null,
      })
      this.logInCheck()
    },
    logInCheck () {
      let storedUser = window.localStorage.getItem('user')
      if (!storedUser){
        storedUser = window.prompt('Enter player tag')
        window.localStorage.setItem('user', storedUser)
      }
      fetch(`${this.apiURL}/player/${storedUser}`)
      .then(res => res.json())
      .then(player => {
        console.log(player)
        this.$store.commit('set', {
          user: storedUser,
        })
        this.$nextTick(() => {
          for (let t in player.placings) {
            this.getTournamentAndSiblings(t)
          }
        })
      })
    },
    getTournamentAndSiblings (tournament) {
      fetch(`${this.apiURL}/tournament/${tournament}`)
      .then(res => res.json())
      .then(data => this.$emit('addTournamentData', data))
      fetch(`${this.apiURL}/alsoCompetedIn/${tournament}/${this.user}`)
      .then(res => res.json())
      .then(data => {
        for (let t of data)
          this.$emit('addTournamentData', t)
        this.loading = false
      })
    }
  },
}
</script>

<style scoped lang="scss">
#header {
  width: 100%;
  height: 6em;
  //background: #222;
  padding: 0 60px;
  display: flex;
  align-items: center;

  .button {
    text-decoration: underline;
  }

  .padright {
    padding-right: 30px;
  }
  .padtop {
    padding-top: 30px;
  }
}

</style>
