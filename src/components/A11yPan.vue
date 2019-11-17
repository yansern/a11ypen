<template>
  <div
    class="a11y-pan"
    :class="{'active-pan': isActivePan}"
    @click="setActivePan('a11y')"
    :style="style">
    <div class="pan-head">
        Accessibility
    </div>
    <div class="a11y-results">
        <el-tabs tab-position="top">
            <el-tab-pane name="violations" :label="labels.violations">
                <a11y-results :items="results.violations" v-if="results.violations.length"></a11y-results>
                <div class="a11y-hint" v-else>There are no violations.</div>
            </el-tab-pane>
            <el-tab-pane name="passes" :label="labels.passes">
                <a11y-results :items="results.passes" v-if="results.passes.length"></a11y-results>
                <div class="a11y-hint" v-else>There are no passes.</div>
            </el-tab-pane>
            <el-tab-pane name="incomplete" :label="labels.incomplete">
                <a11y-results :items="results.incomplete" v-if="results.incomplete.length"></a11y-results>
                <div class="a11y-hint" v-else>There are no incompleteness.</div>
            </el-tab-pane>
        </el-tabs>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { Badge, Button, Tabs, TabPane } from 'element-ui'
import debounce from 'debounce'
import panPosition from '@/utils/pan-position'
import PanResizer from '@/components/PanResizer.vue'
import { hasNextPan } from '@/utils'
import '@/utils/highlight'
import Event from '@/utils/event'
import A11yResults from './A11yResults.vue'

export default {
  data() {
    return {
      style: {},
      iframe: null,
      results: {
        violations: [],
        passes: [],
        incomplete: []
      }
    }
  },
  watch: {
    logs() {
        // const { console } = this.$refs
      this.$nextTick(() => {
          // console.scrollTop = console.scrollHeight
      })
    },
    visiblePans: {
      immediate: true,
      handler(val) {
        this.style = panPosition(val, 'a11y')
      }
    }
  },
  mounted() {
    Event.$on(`set-a11y-pan-style`, style => {
      this.style = {
        ...this.style,
        ...style
      }
    })

    Event.$on(`iframe-success`, debounce(iframe => {
      const options = {}
      const win = iframe.$el.contentWindow
      this.iframe = iframe

      win.axe.run(win.document.body).then(results => {
        this.results = results
        // console.dir(results)
      })
    }, 250))

    Event.$on(`inspect-element`, selector => {
      const el = this.iframe.$el.contentDocument.querySelector(selector)
      console.log(selector, el)
    })

    Event.$on(`highlight-element`, selector => {
      const doc = this.iframe.$el.contentDocument
      const win = this.iframe.$el.contentWindow
      const el = doc.querySelector(selector)

      // Create or retrieve existing highlighter
      const div = win['__a11y-highlighter__'] || document.createElement('div')
      div.id = '__a11y-highlighter__'
      doc.body.appendChild(div)

      const rect = el.getBoundingClientRect()
      const left = win.scrollX + rect.left
      const top = win.scrollY + rect.top
      Object.assign(div.style, {
        width: rect.width + 'px',
        height: rect.height + 'px',
        left: left + 'px',
        top: top + 'px',
        background: '#ffff002b',
        outline: '1px solid #e4c003',
        position: 'absolute',
        zIndex: 999999
      })

      const xOffset = -50
      const yOffset = -50
      win.scrollTo({ top: top + yOffset, left: left + xOffset, behavior: 'smooth' })
    })

    Event.$on(`unhighlight-element`, selector => {
      const doc = this.iframe.$el.contentDocument
      const win = this.iframe.$el.contentWindow
      const div = win['__a11y-highlighter__']
      const el = doc.querySelector(selector)

      if (div) {
        doc.body.removeChild(div)
      }
    })
  },
  computed: {
    ...mapState(['logs', 'visiblePans', 'activePan']),
    enableResizer() {
      return hasNextPan(this.visiblePans, 'a11y')
    },
    isActivePan() {
      return this.activePan === 'a11y'
    },
    labels() {
      const { violations, passes, incomplete } = this.results
      return {
        violations: `Violations (${violations.length})`,
        passes: `Passes (${passes.length})`,
        incomplete: `Incomplete (${incomplete.length})`
      }
    }
  },
  methods: {
    ...mapActions(['setActivePan']),
    checkA11y() {
      console.log('TODO')
    }
  },
  components: {
    'el-badge': Badge,
    'el-button': Button,
    'el-tabs': Tabs,
    'el-tab-pane': TabPane,
    'pan-resizer': PanResizer,
    'a11y-results': A11yResults
  }
}
</script>

<style lang="stylus">

.a11y-results {
    height: calc(100% - 40px);
    background: #fff;
}

.el-tabs {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

.el-tabs__header {
    margin-bottom: 0;
}

.el-tabs__content {
    flex-grow: 1;
    height: 100%;
    overflow-y: scroll;
}

.el-tabs__nav-wrap {
    padding: 0 10px;
}

.el-tab-pane {
    width: 100%;
    height: 100%;
}
.a11y-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

#tab-violations {
  color: #F56C6C;
  padding: 0 10px;
}

#tab-passes {
  color: #67C23A;
  padding: 0 10px;
}

#tab-incomplete {
  color: #E6A23C;
  padding: 0 10px;
}
</style>
