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
    this.render()
  },
  methods: {
    render () {
      // console.log(this.graphData)
      this.renderChart(this.graphData, {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            gridLines: {
              color: 'rgba(255,255,255,.1)'
            },
            type: "time",
            time: {
              parser: 'MM/DD/YYYY HH:mm',
              // round: 'day'
              tooltipFormat: 'll HH:mm'
            },
            ticks: {
              fontColor: 'rgba(255,255,255,.7)',
            },
          }, ],
          yAxes: [{
            gridLines: {
              color: 'rgba(255,255,255,.1)'
            },
            stacked: false,
            ticks: {
              beginAtZero: true,
              fontColor: 'rgba(255,255,255,.7)',
            },
          }]
        },
        legend: {
          labels: {
            fontColor: 'rgba(255,255,255,.7)',
          },
        },
        // animation: {
        //     duration: 0,
        // },
      })
    }
  }
}