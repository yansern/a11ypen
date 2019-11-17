<template>
  <header class="home-header">
    <div class="home-header-left home-header-block">
      <a href="/" title="A11yPen Home"><img class="a11ypen-logo" src="/a11ypen-logo.png" title="a11ypen logo" /></a>
      <el-dropdown
        @command="setBoilerplate"
        trigger="click"
        class="home-header-left-item">
        <el-button
          icon="el-icon-document"
          size="mini">
          Boilerplates
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="empty">Empty</el-dropdown-item>
          <el-dropdown-item command="vue">Vue</el-dropdown-item>
          <el-dropdown-item command="vue-jsx">Vue JSX</el-dropdown-item>
          <el-dropdown-item command="react">React</el-dropdown-item>
          <el-dropdown-item command="preact">Preact</el-dropdown-item>
          <el-dropdown-item command="svelte">Svelte</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button
        v-if="!inIframe"
        class="home-header-left-item"
        style="margin-right:0"
        icon="el-icon-plus"
        @click="promptLibrary"
        size="mini">
        Add library
      </el-button>
      <span class="home-header-left-item changelog-indicator"></span>
    </div>
    <div class="home-header-middle home-header-block pan-toggles">
      <span
        class="pan-toggle"
        :class="{visible: isVisible('html')}"
        @click="togglePan('html')">
        HTML
      </span>
      <span
        class="pan-toggle"
        :class="{visible: isVisible('css')}"
        @click="togglePan('css')">
        CSS
      </span>
      <span
        class="pan-toggle"
        :class="{visible: isVisible('js')}"
        @click="togglePan('js')">
        JS
      </span>
      <span
        class="pan-toggle"
        :class="{visible: isVisible('output')}"
        @click="togglePan('output')">
        Output
      </span>
      <span
        class="pan-toggle"
        :class="{visible: isVisible('a11y')}"
        @click="togglePan('a11y')">
          Accessibility
      </span>
    </div>
    <div class="home-header-right home-header-block">
      <el-checkbox
        border
        size="mini"
        :value="autoRun"
        v-if="!inIframe"
        @change="setAutoRun">
        Auto-run
      </el-checkbox>
      <el-button
        :icon="iframeStatusIcon"
        size="mini"
        :type="iframeStatus === 'error' ? 'danger' : 'primary'"
        class="home-header-right-item"
        plain
        @click="runCode">
        Run
      </el-button>
      <el-button
        v-if="!inIframe"
        :icon="editorStatus === 'saving' ? 'el-icon-loading' : 'el-icon-upload2'"
        size="mini"
        plain
        :disabled="editorStatus === 'saving'"
        class="home-header-right-item"
        @click="saveGist">
        Save
      </el-button>
      <el-dropdown
        v-if="!inIframe"
        class="home-header-right-item home-header-more"
        @command="handleDropdownCommand"
        trigger="click">
        <el-button
          :icon=" 'el-icon-more'"
          size="mini">
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <el-button
              v-if="!inIframe"
              :icon="editorStatus === 'saving' ? 'el-icon-loading' : 'el-icon-upload2'"
              size="mini"
              plain
              :disabled="editorStatus === 'saving'"
              @click="saveGist">
              Save
            </el-button>
          </el-dropdown-item>
          <el-dropdown-item>
            <el-button
              :icon="iframeStatusIcon"
              size="mini"
              :type="iframeStatus === 'error' ? 'danger' : 'primary'"
              plain
              @click="runCode">
              Run
            </el-button>
          </el-dropdown-item>
          <el-dropdown-item>
            <el-checkbox
              border
              size="mini"
              :value="autoRun"
              v-if="!inIframe"
              @change="setAutoRun">
              Auto-run
            </el-checkbox>
          </el-dropdown-item>
          <el-dropdown-item command="about">
            <div class="fake-anchor">
              <info-icon /> About
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <a
        title="Edit on A11yPen"
        v-tippy
        v-if="inIframe"
        class="home-header-right-item"
        :href="url"
        target="_blank">
        <img height="30" src="/favicon-180.png" alt="a11ypen">
      </a>
    </div>
    <el-dialog
      :visible.sync="showAboutDialog"
      class="about-dialog"
      :modal="false"
      width="500px">
      <template slot="title">
        <img class="a11ypen-logo xxl" src="/a11ypen-logo.png" title="a11ypen logo" />
      </template>
      <p>A11yPen is an online code playground with accessibility testing for web developers who want to quickly tinker with web accessibility &amp; share their results with others.</p>
      <p>A11yPen is created &amp; maintained by <a href="https://twitter.com/yansernio" target="_blank">Yan Sern</a> as an alternative to CodePen &amp; JSBin with added accessibility testing features.</p>
      <p><strong>Credits</strong><br/>This project is built on top of <a target="_blank" href="https://github.com/egoist/codepan">CodePan</a> by <a target="_blank" href="https://egoist.sh/">EGOIST</a> for its code tinkering features and uses the <a target="_blank" href="https://github.com/dequelabs/axe-core">Axe Core</a> by <a target="_blank" href="https://www.deque.com/">Deque Labs</a> for its accessibility testing features.</p>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="showAboutDialog = false">OK</el-button>
      </span>
    </el-dialog>
  </header>
</template>

<script>
  import { mapState, mapActions } from 'vuex'
  import { Button, Input, Badge, Dropdown, DropdownMenu, DropdownItem, MessageBox, Checkbox, Dialog } from 'element-ui'
  import notie from 'notie'
import {
  Link2Icon,
  SaveIcon,
  TwitterIcon,
  LogOutIcon,
  InfoIcon
} from 'vue-feather-icons'
import SvgIcon from './SvgIcon.vue'
import Event from '@/utils/event'
import { inIframe } from '@/utils'

  export default {
    data() {
      return {
        version: process.env.VERSION,
        latestCommit: process.env.LATEST_COMMIT,
        inIframe,
        url: window.location.href,
        showAboutDialog: false
      }
    },
    computed: {
      ...mapState(['visiblePans', 'editorStatus', 'autoRun', 'iframeStatus']),
      ...mapState({
        totalLogsCount: state => state.logs.length,
        username: state => state.userMeta && state.userMeta.login
      }),
      iframeStatusIcon() {
        switch (this.iframeStatus) {
          case 'loading':
            return 'el-icon-loading'
          case 'error':
            return 'el-icon-warning'
          default:
            return 'el-icon-refresh'
        }
      }
    },
    mounted() {
      window.addEventListener('keydown', this.handleKeydown)
    },
    beforeDestroy() {
      window.removeEventListener('keydown', this.handleKeydown)
    },
    methods: {
      ...mapActions(['togglePan', 'updateCode']),
      handleKeydown(e) {
        if (e.which === 83 && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          this.runCode()
        }
      },
      setAutoRun(status) {
        this.$store.dispatch('setAutoRun', status)
      },
      async promptLibrary() {
        const { value } = await MessageBox.prompt('Type an npm package name:', 'Add Library', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel'
        })
        this.addLibrary(value)
      },
      async addLibrary(name) {
        if (name) {
          const code = `&lt;script src="https://unpkg.com/${name}">&lt;/script>\n`.replace(/&lt;/g, '<') + this.$store.state.html.code
          await this.updateCode({ type: 'html', code })
          Event.$emit('refresh-editor')
        }
      },
      async setBoilerplate(boilerplate) {
        this.$router.push({
          name: 'boilerplate',
          params: {
            boilerplate
          }
        })
      },
      isVisible(pan) {
        return this.visiblePans.indexOf(pan) !== -1
      },
      runCode() {
        Event.$emit('run')
      },
      saveGist() {
        Event.$emit('save-gist')
      },
      handleDropdownCommand(command) {
        if (command === 'save-new-gist') {
          Event.$emit('save-gist', true)
        } else if (command === 'about') {
          this.showAboutDialog = true
        }
      }
    },
    components: {
      'el-dropdown': Dropdown,
      'el-dropdown-menu': DropdownMenu,
      'el-dropdown-item': DropdownItem,
      'el-button': Button,
      'el-input': Input,
      'el-badge': Badge,
      'el-checkbox': Checkbox,
      'el-dialog': Dialog,
      Link2Icon,
      SaveIcon,
      TwitterIcon,
      SvgIcon,
      LogOutIcon,
      InfoIcon
    }
  }
</script>

<style lang="stylus" scoped>
.home-header
  height: 40px
  border-bottom: 1px solid #bfbfbf
  background-color: white
  display: flex
  align-items: center
  padding: 0 10px
  justify-content: space-between
  box-shadow: 0 0 7px #ccc;
  z-index: 2010;
  position: relative;

.a11ypen-logo
  height: 27px
  margin-right: 10px
  &.xxl {
    height: 50px
  }

.about-dialog
  >>> .el-dialog__header
    padding-bottom: 0;
  >>> .el-dialog__body
    padding: 0 20px !important
    word-break: normal
    a
      font-weight: bold;
      color: #409EFF;
  >>> .el-dialog__footer
    padding-top: 0;


.home-header-block
  flex: 1
  width: 0

.home-header-left
  display: flex
  justify-content: flex-start
  height: 28px;
  .home-header-left-item
    margin-right: 10px

.el-dropdown-menu__item > label, .el-dropdown-menu__item > button
  width: 100%
  display: none

.el-dropdown-menu__item > button
  text-align: left

@media screen and (max-width: 992px)
  .el-dropdown-menu__item > label
    display: inline-block

@media screen and (max-width: 576px)
  .el-dropdown-menu__item > button
    display: inline-block

.home-header-right
  display: flex
  justify-content: flex-end
  align-items: center
  .home-header-right-item
    margin-left: 10px
  @media screen and (max-width: 992px)
    > label
      display: none

  @media screen and (max-width: 576px)
    > button
      display: none

.changelog-indicator
  display: flex
  align-items: center
  height: 28px

.pan-toggles
  display: flex
  justify-content: center
  height: 100%

  .pan-toggle
    display: flex
    align-items: center
    height: 100%
    border-left: 1px solid #e2e2e2
    border-right: @border-left
    position: relative
    padding: 0 10px
    cursor: pointer
    user-select: none

    &:not(:first-child)
      margin-left: -1px

    &:hover
      &:not(.visible)
        background-color: #f9f9f9

    &.visible
      background-color: #EBF3FF

.editor-save-status
  display: flex
  align-items: center
  color: #607d8b
  .svg-icon
    display: flex
    align-items: center
    margin-right: 5px
  >>> svg
    fill: @color
    width: 16px
    height: @width

@media screen and (max-width: 768px)
  .home-header-left
    display: none
  .pan-toggles
    justify-content: left
</style>
