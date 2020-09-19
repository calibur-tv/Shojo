<template>
  <div class="v-audio">
    <span @click="handleClick">{{ playing ? '播放中' : '点击播放' }}</span>
    <audio ref="audio" :src="src" />
  </div>
</template>

<script>
export default {
  name: 'VAudio',
  components: {},
  props: {
    src: {
      required: true,
      type: String
    }
  },
  data() {
    return {
      playing: false
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.bindEvents()
  },
  methods: {
    bindEvents() {
      const audio = this.$refs.audio
      audio.addEventListener('ended', () => {
        this.playing = false
      })
      audio.addEventListener('error', () => {
        this.$toast.error('出错了')
      })
    },
    handleClick() {
      const audio = this.$refs.audio
      if (this.playing) {
        audio.pause()
        this.playing = false
      } else {
        audio.play()
        this.playing = true
      }
    }
  }
}
</script>

<style lang="scss">
.v-audio {
  position: relative;
  width: 100%;
  height: 100%;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  audio {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    user-select: none;
    pointer-events: none;
  }
}
</style>
