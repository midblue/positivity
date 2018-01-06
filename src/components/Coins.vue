<template>
  <div>
    <div>
      <span class="highlight alt"><span v-if="!total">+</span>{{ big }}</span>
      <span v-if="total">total</span>
      coin<span v-if="big !== 1">s</span>
    </div>
    <div class="coins">
      <div class="big" :class="{on: big > 0}">
        <div v-for="n in big">
          <div></div>
        </div>
      </div>
      <div class="small" >
        <div v-for="n in small">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: Number,
    total: {
      type: Boolean,
      default: false,
      required: false
    },
  },
  data () {
    return {
      currTotal: 0,
      smallCutoff: 16,
      smallValue: 200,
    }
  },
  computed: {
    big () { return Math.floor((this.currTotal / this.smallValue) / this.smallCutoff) },
    small () { return Math.floor(this.currTotal / this.smallValue) % this.smallCutoff }
  },
  mounted () {
    if (this.value > 0) this.addPoint()
  },
  methods: {
    addPoint () {
      window.requestAnimationFrame(() => {
        if (this.currTotal <= this.value) {
          this.currTotal += this.smallValue / 2 //this.value / 300
          this.addPoint()
        }
      })
    }
  },
}
</script>

<style scoped lang="scss">
$height: 24px;
.coins {
  margin-right: 30px;
  height: $height;
  display: inline-flex;

  .big {
    &.on { margin-right: $height / 1.5; }

    & > div {
      height: 100%;
      width: 8px;
      display: inline-block;
      flex: 0;

      & > div {
        width: $height - 2;
        height: $height - 2;
        border-radius: 50%;
        background: #ff0; //linear-gradient(to right, #ff0, #db3);
        border: 1.5px solid #333;
        box-shadow: 
          inset 0 0 0 2px #ff0,
          inset 1px 1px 3px 1px #660;
      }
    }
  }
  .small {
    height: 100%;
    max-width: $height * 2.67;
    display: inline-flex;
    flex-wrap: wrap;
    align-content: center;
    align-items: center;

    & > div {
      flex-grow: 0;
      width: $height / 3;
      height: $height / 3;
      border-radius: 50%;
      background: #ff0;
      opacity: .3;
      box-shadow: inset 0 0 0 1px #333;
    }
  }
}

</style>
