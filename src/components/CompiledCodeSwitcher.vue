<template>
  <repeat-icon
    class="svg-icon"
    @click="handleClick"
    v-tippy="{title: 'View compiled'}">
  </repeat-icon>
</template>

<script>
import { RepeatIcon } from 'vue-feather-icons'
import Event from '@/utils/event'

export default {
  props: {
    type: {
      required: true,
      type: String
    }
  },
  methods: {
    handleClick() {
      Event.$emit('show-compiled-code', this.type)
    }
  },
  components: {
    RepeatIcon
  }
}
</script>
