<template>
    <ul class="a11y-rules">
        <li v-for="rule in rules">
            <el-tag v-bind="impactTagAttrs[rule.impact===null ? 'success' : rule.impact]" size="mini">{{ rule.impact }}</el-tag>
            <span class="message">{{ rule.message }}</span>
        </li>
    </ul>
</template>

<script>
import { Tag } from 'element-ui'

export default {
  components: {
    'el-tag': Tag
  },
  data() {
    return {
      impactTagAttrs: {
        minor: {
          effect: 'plain',
          type: 'warning'
        },
        moderate: {
          effect: 'plain',
          type: 'danger'
        },
        serious: {
          effect: 'light',
          type: 'danger'
        },
        critical: {
          effect: 'dark',
          type: 'danger'
        },
        success: {
          effect: 'light',
          type: 'success'
        }
      }
    }
  },
  props: {
    rules: {
      type: Array,
      required: true
    }
  },
  method: {

  }
}
</script>

<style lang="stylus">
.a11y-rules {
    list-style: none;
    padding: 0;

    li {
        margin: 0;
        margin-top: 5px;
        display: flex;

        .el-tag {
            width: 64px;
            min-width: 64px;
            max-width: 64px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            text-transform: uppercase;
            font-size: 0.8em;
            position: relative;
            top: 3px;
            height: 15px;
        }

        .message {
            padding-left: 5px;
            line-height: 1.4;
        }
    }
}

</style>