<template>
  <div id="add">
    <form v-on:submit.prevent="getTournamentAndSiblings">
      <div>Add additional tournaments</div>
      <!-- <div class="sub fade">(We'll also automatically pull other tournaments you're in from that host)</div> -->
      <input v-model="typedTournament" />
      <button type="submit">
        Add
      </button>
    </form>
    <div v-if="loading" class="three-quarters-loader"></div>
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
      loading: true,
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
        this.loading = false
      })
    }
  },
}
</script>

<style scoped lang="scss">
#add {
  & > * {
    display: inline-block;
  }
}

$three-quarters-loader-size: 32px !default;
$three-quarters-loader-color: #666 !default;

@keyframes three-quarters-loader {
  0%   { transform: rotateZ(0deg); }
  100% { transform: rotateZ(360deg); }
}

/* :not(:required) hides this rule from IE9 and below */
.three-quarters-loader:not(:required) {
  animation: three-quarters-loader 1250ms infinite linear;
  border: ($three-quarters-loader-size/4) solid $three-quarters-loader-color;
  border-right-color: transparent;
  border-radius: ($three-quarters-loader-size / 2);
  box-sizing: border-box;
  display: inline-block;
  position: relative;
  overflow: hidden;
  text-indent: -9999px;
  width: $three-quarters-loader-size;
  height: $three-quarters-loader-size;
}

</style>
