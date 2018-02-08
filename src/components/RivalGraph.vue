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
      rivalPoints: null,
    }
  },
  computed: {
    apiURL () { return this.$store.state.apiURL },
    graphDataSets () {
      if (this.points.total === 0) return []
      let total = 0
      const dataSets = [
        this.buildDataSet('You', '#0f0', 'rgba(0, 255, 0, .1)', this.points),
      ]
      if (this.rivalPoints)
        dataSets.push(
          this.buildDataSet('Rival', '#ff0', 'rgba(255, 255, 0, .1)', this.rivalPoints)
        )
      return dataSets
    }
  },
  watch : {},
  mounted () {
    fetch(`${this.apiURL}/points/jasp`)
    .then(res => res.json())
    .then(json => this.rivalPoints = json)
  },
  methods: {
    buildDataSet (label, borderColor, backgroundColor, data) {
      let total = 0
      const dataSet = {
        label,
        backgroundColor,
        borderColor,
        lineTension: 0,
        data: data.tournaments.sort((a, b) => a.date > b.date)
          .map(t => {
            total += t.total
            return {x: new Date(t.date), y: total} 
          })
      }
      //console.log(dataSet.data)
      dataSet.data.unshift({x: new Date(dataSet.data[0].x.getTime() - 1000000000), y: 0})
      dataSet.data.push({x: new Date(), y: total})
      return dataSet
    }
  },
}
</script>

<style scoped lang="scss">
.graph {
  height: 200px;
  padding: 20px 0;
}
</style>
