<template>
    <div class="a11y-selector" @mouseenter="highlightElement" @mouseleave="unhighlightElement">
        <strong @click="inspectElement">{{ target }}</strong>
        <div>
            <el-tooltip class="item" effect="dark" content="Show element in console" placement="top-end">
                <el-button size="mini" @click="inspectElement" icon="el-icon-aim" class="inspect-button">Inspect</el-button>
            </el-tooltip>
        </div>
    </div>
</template>

<script>
import { Tooltip, Button } from 'element-ui'
import Event from '@/utils/event'

export default {
  components: {
    'el-tooltip': Tooltip,
    'el-button': Button
  },
  props: {
    target: {
      type: String,
      required: true
    }
  },
  methods: {
    highlightElement() {
      Event.$emit('highlight-element', this.target)
    },
    unhighlightElement() {
      Event.$emit('unhighlight-element', this.target)
    },
    inspectElement() {
      Event.$emit('inspect-element', this.target)
    }
  }

}
</script>

<style lang="stylus">
.a11y-selector {
    border-bottom: 1px solid #DCDFE6;
    cursor: pointer;
    display: flex;

    > strong {
        font-weight: bold;
        flex-grow: 1;
        line-height: 1.3;
        margin-bottom: 5px;
    }

    .inspect-button {
        padding: 4px 4px;
        font-size: 0.9em;
        position: relative;
        top: -4px;
    }
}
</style>