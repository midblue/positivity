<template>
  <div id="app">
    <div>{{ overview }}</div>
    <div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      apiURL: './api',
      overview: {
        who: '',
        whatPlace: '',
        where: '',
        lostMatches: [],
        wonMatches: [],
        date: null,
      },
    }
  },
  mounted () {
    const tournament = 'lieswkev'
    const participant = 'jasp'
    this.getParticipantInTournament(tournament, participant)
    .then ((data) => {
      console.log(data)
      this.overview.who = participant
      this.overview.whatPlace = data.finalRank
      this.overview.where = data.tournament
      this.overview.lostMatches = data.lostMatches
      this.overview.wonMatches = data.wonMatches
    })
  },
  methods: {
    getTournament (tournament) {
      return fetch(`${this.apiURL}/tournament/${tournament}`)
        .then((res) => res.json())
    },
    getParticipantInTournament (tournament, participant) {
      return fetch(`${this.apiURL}/tournament/${tournament}/participant/${participant}`)
        .then((res) => res.json())
    }
  },
}
</script>

<style scoped lang="scss">
#app {
  
}

</style>
