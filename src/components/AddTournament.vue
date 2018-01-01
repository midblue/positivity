<template>
  <div id="add">
    <form v-on:submit.prevent="getTournamentAndSiblings(typedTournament)">
      <div>Add additional tournament (url ending)</div>
      <input v-model="typedTournament" placeholder="i.e. 'lieswkev'" />
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
  props: [ 'tournamentsToLoad', ],
  data () {
    return {
      typedTournament: '',//'lieswkev',//'sqd0djjc',
      loading: false,
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
