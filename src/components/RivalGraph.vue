<template>
  <div>
    <Graph 
      class="graph"
      :dataSets="graphDataSets"
    />
  </div>
</template>

<script>
import Graph from './Graph.js'

export default {
  components: { Graph, },
  props: [ 'points', ],
  data () {
    return {
    }
  },
  computed: {
    apiURL () { return this.$store.state.apiURL },
    graphDataSets () {
      if (this.points.total === 0) return []
      let total = 0
      const dataSets = [
        {
          label: 'You',
          backgroundColor: 'rgba(0,255,0,.1)',
          borderColor: '#0f0',
          lineTension: 0,
          data: this.points.tournaments.sort((a, b) => a.date > b.date)
            .map(t => {
              total += t.total;
              return {x: new Date(t.date), y: total} 
            })
        },
      ]
      // console.log('1', dataSets[0].data)
      dataSets[0].data.unshift({x: new Date(dataSets[0].data[0].x.getTime() - 1000000000), y: 0})
      dataSets[0].data.push({x: new Date(), y: total})
      // console.log('2', dataSets[0].data)
      return dataSets
    }
  },
  watch : {},
  mounted () {
    //fetch(`${this.apiURL}/points/jasp`)
  },
  methods: {},
}
</script>

<style scoped lang="scss">
.graph {
  height: 200px;
  padding: 20px 0;
}
</style>
