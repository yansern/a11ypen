<template>
  <div
    class="output-pan"
    :class="{ 'active-pan': isActivePan }"
    @click="setActivePan('output')"
    :style="style">

    <div class="pan-head">
      Output
    </div>
    <div class="output-iframe" id="output-iframe">
      <div id="output-iframe-holder"></div>
    </div>
    <pan-resizer pan="output" :enable="enableResizer" />
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import notie from 'notie'
import SvgIcon from './SvgIcon.vue'
import { getHumanlizedTransformerName, hasNextPan } from '@/utils'
import * as transform from '@/utils/transform'
import createIframe from '@/utils/iframe'
import Event from '@/utils/event'
import panPosition from '@/utils/pan-position'
import getScripts from '@/utils/get-scripts'
import PanResizer from '@/components/PanResizer.vue'

const sandboxAttributes = [
  'allow-modals',
  'allow-forms',
  'allow-pointer-lock',
  'allow-popups',
  'allow-same-origin',
  'allow-scripts'
]

const replaceQuote = str => str.replace(/__QUOTE_LEFT__/g, '<')

const createElement = tag => (content = '', attrs = {}) => {
  attrs = Object.keys(attrs)
    .map(key => {
      return `${key}="${attrs[key]}"`
    })
    .join(' ')
  return replaceQuote(
    `__QUOTE_LEFT__${tag} ${attrs}>${content}__QUOTE_LEFT__/${tag}>`
  )
}

export default {
  name: 'output-pan',
  data() {
    return {
      style: {}
    }
  },
  watch: {
    visiblePans: {
      immediate: true,
      handler(val) {
        this.style = panPosition(val, 'output')
      }
    }
  },
  computed: {
    ...mapState([
      'js',
      'css',
      'html',
      'visiblePans',
      'activePan',
      'iframeStatus'
    ]),
    ...mapGetters([
      'isLoggedIn',
      'canUpdateGist'
    ]),
    isActivePan() {
      return this.activePan === 'output'
    },
    enableResizer() {
      return hasNextPan(this.visiblePans, 'output')
    }
  },
  mounted() {
    this.iframe = createIframe({
      el: document.getElementById('output-iframe-holder'),
      sandboxAttributes
    })

    window.addEventListener('message', this.listenIframe)
    Event.$on('run', () => this.run())
    Event.$on(`set-output-pan-style`, style => {
      this.style = {
        ...this.style,
        ...style
      }
    })
    Event.$on('save-gist', saveNew => {
      this.save({ saveNew })
    })
  },
  beforeDestroy() {
    window.removeEventListener('message', this.listenIframe)
  },
  methods: {
    ...mapActions([
      'addLog',
      'clearLogs',
      'setActivePan',
      'setBoilerplate',
      'editorSaved',
      'editorSaving',
      'editorSavingError',
      'setIframeStatus',
      'transform'
    ]),
    getHumanlizedTransformerName,

    async listenIframe({ data = {} }) {
      if (data.type === 'iframe-error') {
        this.addLog({ type: 'error', message: data.message.trim() })
        this.setIframeStatus('error')
      } else if (data.type === 'codepan-console') {
        if (data.method === 'clear') {
          this.clearLogs()
        } else {
          this.addLog({ type: data.method, message: data.args.join('') })
        }
      } else if (data.type === 'codepan-make-output-active') {
        this.setActivePan('output')
      } else if (data.type === 'codepan-set-boilerplate' && data.boilerplate) {
        await this.setBoilerplate(JSON.parse(data.boilerplate))
        Event.$emit('refresh-editor')
      } else if (data.type === 'iframe-success') {
        this.setIframeStatus('success')
        Event.$emit('iframe-success', this.iframe)
      }
    },

    async run() {
      this.setIframeStatus('loading')
      let js
      // We may add preprocessors supports for html/css in the future
      let html
      let css
      const scripts = []

      await this.transform(true)

      try {
        await Promise.all([
          transform.js(this.js)
            .then(code => getScripts(code, scripts))
            .then(code => {
              js = code
            }),
          transform.html(this.html)
            .then(code => {
              html = code
            }),
          transform.css(this.css)
            .then(code => {
              css = code
            })
        ])

        js = js.replace(/<\/script>/, '<\\/script>')
        js = `
          try {
            ${js}
          } catch (err) {
            window.parent.postMessage(
              {
                type: 'iframe-error',
                message: err instanceof Error ? (err.frame ? err.message + '\\n' + err.frame : err.stack) : err
              },
              '*'
            )
          }
        `
        js = `
          if (window.Vue) {
            window.Vue.config.productionTip = false;
          }
          console.clear();
          document.addEventListener('DOMContentLoaded', __executeA11yPen);
          function __executeA11yPen(){
            let script = document.createElement('script');
            script.innerHTML = ${JSON.stringify(js)};
            document.body.appendChild(script);
            window.parent.postMessage({ type: 'iframe-success' }, '*');
          };`
      } catch (err) {
        this.setIframeStatus('error')
        return this.addLog({
          type: 'error',
          message: err.frame ? `${err.message}\n${err.frame}` : err.stack
        })
      }

      await this.transform(false)

      const headStyle = createElement('style')(css)
      const head = headStyle

      const body =
        html +
        createElement('script')(js)

      this.iframe.setHTML({
        head,
        body
      })
    },

    async save({ saveNew } = {}) {
      this.editorSaving()
      try {
        const shouldUpdateGist = false
        // const shouldUpdateGist = this.canUpdateGist && !saveNew

        const db = window.firebase.firestore()
        const snippetsRef = db.collection('snippets')
        const snippetData = {
          js: this.js,
          css: this.css,
          html: this.html,
          showPans: this.visiblePans,
          activePan: this.activePan
        }

        const snippetRef = await snippetsRef.add(snippetData)
        const snippetId = snippetRef.id

        if (shouldUpdateGist) {
          this.editorSaved()
        } else {
          this.$router.push(`/s/${snippetRef.id}`)
        }
      } catch (err) {
        throw err
        this.editorSavingError()
        if (err.response) {
          notie.alert({
            type: 'error',
            text: err.response.data.message
          })
        }
      }
    }
  },
  components: {
    SvgIcon,
    PanResizer
  }
}
</script>

<style lang="stylus" scoped>
.output-pan {
  overflow: hidden;
}

.output-iframe {
  width: 100%;
  height: calc(100% - 40px);
  background: #fff;

  &.disable-mouse-events {
    pointer-events: none;
  }
}
</style>
