<template>
  <div id="app">
    {{ msg }}
  </div>
</template>

<script>
export default {
  data () {
    return {
      apiURL: './api',
      msg: ''
    }
  },
  mounted () {
    const tournament = 'lieswkev'
    const participant = 'jasp'
    this.getParticipantInTournament(tournament, participant)
    .then ((data) => {
      this.msg = `${participant} placed #${data.final_rank} at `
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
