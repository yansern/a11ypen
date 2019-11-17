import Vue from 'vue'
import Vuex from 'vuex'
import progress from 'nprogress'
import req from 'reqjs'
import {
  loadBabel,
  loadPug,
  loadMarkdown,
  loadSvelte,
  loadReason,
  loadCoffeeScript2,
  loadCssnext,
  loadLess,
  loadSass,
  loadRust,
  loadTypescript,
  loadStylus
} from '@/utils/transformer'
import Event from '@/utils/event'

Vue.use(Vuex)

const pans = ['html', 'css', 'js', 'output', 'a11y']
const sortPans = ps => {
  return ps.sort((a, b) => {
    return pans.indexOf(a) > pans.indexOf(b)
  })
}

const emptyPans = () => ({
  js: {
    code: '',
    transformer: 'js'
  },
  css: {
    code: '',
    transformer: 'css'
  },
  html: {
    code: '',
    transformer: 'html'
  }
})

const examplePans = () => ({
  "activePan": "html",
  "css": {
      "code": "html {\n  font-family: sans-serif;\n}\n\nh6:before {\n  content: 'Hello World!';\n}\n\n.low-contrast {\n  background: #ccc;\n  color: #fff;\n}",
      "transformer": "css"
  },
  "html": {
      "code": "<h2>Headings</h2>\n<h6><span></span></h6>\n\n<hr />\n\n<h2>Form Labels</h2>\n<form>\n  <div>\n    <input type=\"checkbox\" value=\"apple\"/>\n    <label>Apple</label>\n  </div>\n  <div>\n    <input type=\"checkbox\" value=\"orange\" title=\"Orange\"/>\n    <label>Orange</label>\n  </div>\n</form>\n\n<hr />\n\n<h2>Image &amp; Link</h2>\n<a href=\"#\"><img src=\"/a11ypen-logo.png\" width=\"100\"></a>\n\n<hr />\n\n<h2>Contrast</h2>\n<p class=\"low-contrast\">This text has low contrast ratio.</p>\n",
      "transformer": "html"
  },
  "js": {
      "code": "",
      "transformer": "js"
  },
  "showPans": ["html", "css", "output", "a11y"]
});

const getFileNameByLang = {
  html: 'index.html',
  js: 'script.js',
  css: 'style.css'
}

// Load entries of all boilerplates
const boilerplates = {
  empty: async () => ({
    ...emptyPans(),
    showPans: ['html', 'css', 'output', 'a11y']
  }),
  example: async() => ({
    ...examplePans(),
    showPans: ['html', 'css', 'output', 'a11y']
  })
}
function importAll(r) {
  r.keys().forEach(key => {
    const name = /^\.\/(.+)\//.exec(key)[1]
    boilerplates[name] = r(key).default
  })
}
importAll(require.context('@/boilerplates', true, /index.js$/))

const store = new Vuex.Store({
  state: {
    ...emptyPans(),
    logs: [],
    visiblePans: ['html', 'css', 'output', 'a11y'],
    activePan: 'js',
    autoRun: false,
    gistMeta: {},
    editorStatus: 'saved',
    iframeStatus: null,
    transforming: false
  },
  mutations: {
    UPDATE_CODE(state, { type, code }) {
      state[type].code = code
    },
    UPDATE_TRANSFORMER(state, { type, transformer }) {
      state[type].transformer = transformer
    },
    ADD_LOG(state, log) {
      state.logs.push(log)
    },
    CLEAR_LOGS(state) {
      state.logs = []
    },
    TOGGLE_PAN(state, pan) {
      const pans = state.visiblePans
      const idx = pans.indexOf(pan)
      if (idx === -1) {
        pans.push(pan)
      } else {
        pans.splice(idx, 1)
      }
      state.visiblePans = sortPans(pans)
    },
    SHOW_PANS(state, pans) {
      state.visiblePans = sortPans(pans)
    },
    ACTIVE_PAN(state, pan) {
      state.activePan = pan
    },
    SET_EDITOR_STATUS(state, status) {
      state.editorStatus = status
    },
    SET_AUTO_RUN(state, status) {
      state.autoRun = status
    },
    SET_IFRAME_STATUS(state, status) {
      state.iframeStatus = status
    },
    SET_TRANSFORM(state, status) {
      state.transforming = status
    }
  },
  actions: {
    updateCode({ commit }, payload) {
      commit('UPDATE_CODE', payload)
    },
    updateError({ commit }, payload) {
      commit('UPDATE_ERROR', payload)
    },
    addLog({ commit }, payload) {
      commit('ADD_LOG', payload)
    },
    clearLogs({ commit }) {
      commit('CLEAR_LOGS')
    },
    setActivePan({ commit }, pan) {
      commit('ACTIVE_PAN', pan)
    },
    togglePan({ commit }, payload) {
      commit('TOGGLE_PAN', payload)
    },
    showPans({ commit }, pans) {
      commit('SHOW_PANS', pans)
    },
    async updateTransformer({ commit }, { type, transformer }) {
      if (
        transformer === 'babel' ||
        transformer === 'jsx' || // @deprecated, use "babel"
        transformer === 'vue-jsx'
      ) {
        await loadBabel()
      } else if (transformer === 'pug') {
        await loadPug()
      } else if (transformer === 'markdown') {
        await loadMarkdown()
      } else if (transformer === 'svelte') {
        await loadSvelte()
      } else if (transformer === 'reason') {
        await loadReason()
      } else if (transformer === 'coffeescript-2') {
        await loadCoffeeScript2()
      } else if (transformer === 'cssnext') {
        await loadCssnext()
      } else if (transformer === 'less') {
        await loadLess()
      } else if (transformer === 'sass' || transformer === 'scss') {
        await loadSass()
      } else if (transformer === 'rust') {
        await loadRust()
      } else if (transformer === 'typescript') {
        await loadTypescript()
      } else if (transformer === 'stylus') {
        await loadStylus()
      }
      commit('UPDATE_TRANSFORMER', { type, transformer })
    },
    transform({ commit }, status) {
      commit('SET_TRANSFORM', status)
    },
    // todo: simplify this action
    async setBoilerplate({ dispatch }, boilerplate) {
      progress.start()

      if (typeof boilerplate === 'string') {
        boilerplate = await boilerplates[boilerplate]()
      }

      const ps = []

      const defaultPans = emptyPans()

      for (const type of ['html', 'js', 'css']) {
        const { code, transformer } = {
          code: defaultPans[type].code,
          transformer: defaultPans[type].transformer,
          ...boilerplate[type]
        }
        ps.push(
          dispatch('updateCode', { type, code }),
          dispatch('updateTransformer', {
            type,
            transformer
          })
        )
      }

      if (boilerplate.showPans) {
        ps.push(dispatch('showPans', boilerplate.showPans))
      }

      const { activePan = 'js' } = boilerplate
      ps.push(dispatch('setActivePan', activePan))
      ps.push(dispatch('clearLogs'))

      await Promise.all(ps)

      setTimeout(() => {
        dispatch('editorSaved')
        Event.$emit('focus-editor', activePan)
      })

      progress.done()
    },
    async setGist({ commit, dispatch, state }, id) {
      try {
        const db = window.firebase.firestore()
        const snippetsRef = db.collection('snippets')
        const doc = await snippetsRef.doc(id).get()
        const main = doc.data()
        setTimeout(() => { console.log(JSON.stringify(main)) }, 250);
        await dispatch('setBoilerplate', main)
      } catch (e) {
        alert('Error loading snippet!')
        throw e
      }
    },
    editorSaved({ commit }) {
      commit('SET_EDITOR_STATUS', 'saved')
    },
    editorChanged({ commit }) {
      commit('SET_EDITOR_STATUS', 'changed')
    },
    editorSaving({ commit }) {
      commit('SET_EDITOR_STATUS', 'saving')
    },
    editorSavingError({ commit }) {
      commit('SET_EDITOR_STATUS', 'error')
    },
    setAutoRun({ commit }, status) {
      commit('SET_AUTO_RUN', status)
    },
    setIframeStatus({ commit }, status) {
      commit('SET_IFRAME_STATUS', status)
    }
  },
  getters: {
  }
})

export default store
