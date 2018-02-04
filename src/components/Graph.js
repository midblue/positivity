import {Line} from 'vue-chartjs'

export default {
  extends: Line,
  props: [ 'dataSets', ],
  data () {
    return {}
  },
  computed: {
    graphData () {
      return {
        datasets: this.dataSets
      }
    }
  },
  watch: {
    dataSets () { this.render() }
  },
  mounted () {
    //this.render()
  },
  methods: {
    render () {
      console.log(this.graphData)
      this.renderChart(this.graphData, {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            type: "time",
            time: {
              parser: 'MM/DD/YYYY HH:mm',
              // round: 'day'
              tooltipFormat: 'll HH:mm'
            },
          }, ],
          yAxes: [{
            stacked: true,
          }]
        },
        // legend: {
        //   display: false,
        // },
        // animation: {
        //     duration: 0,
        // },
      })
    }
  }
}