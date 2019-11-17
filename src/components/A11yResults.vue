<template>
    <el-collapse v-model="activeNames" @change="handleChange" class="a11y-results">
        <el-collapse-item v-for="(item, i) in items" :name="i" :key="i">
            <template slot="title">
                <div class="item-header">
                    <el-tag class="item-impact" v-bind="impactTagAttrs[item.impact===null ? 'success' : item.impact]" size="mini">{{ item.impact===null ? 'success' : item.impact }}</el-tag>
                    <span class="item-header-title">{{ item.description }}</span>
                </div>
            </template>
            <div class="a11y-help">
                <p>{{ item.help }}</p>
                <a :href="item.helpUrl" target="_blank">More info...</a>
            </div>
            <ol class="a11y-nodes">
                <li class="a11y-node" v-for="node in item.nodes" >
                    <a11y-selector v-for="target in node.target" :target="target" :key="target"></a11y-selector>
                    <a11y-rules :rules="[...node.any, ...node.all, ...node.none]"></a11y-rules>
                    <a11y-
                    <div class="a11y-tags">
                        <el-tag v-for="tag in item.tags" :key="tag" size="mini" effect="plain" type="info">{{ tag }}</el-tag>
                    </div>
                </li>
            </ol>
        </el-collapse-item>
    </el-collapse>
</template>

<script>
import { Collapse, CollapseItem, Tag, Tooltip, Button } from 'element-ui'
import A11ySelector from './A11ySelector.vue'
import A11yRules from './A11yRules.vue'

export default {
  components: {
    'el-collapse': Collapse,
    'el-collapse-item': CollapseItem,
    'el-tag': Tag,
    'el-tooltip': Tooltip,
    'el-button': Button,
    'a11y-selector': A11ySelector,
    'a11y-rules': A11yRules
  },
  data() {
    return {
      activeNames: [],
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
  created() {
    this.activeNames = this.items.map((item, i) => i)
  },
  props: {
    items: {
      types: Array,
      required: true
    }
  },
  methods: {
    handleChange() {
    }
  }

}
</script>

<style lang="stylus">
.el-tab-pane {

}
.el-collapse {
    border-top: none;
}

.el-collapse-item {
    border-bottom: 1px solid #EBEEF5;
}

.el-collapse-item__header {
    height: unset;
    line-height: unset;
    padding: 10px;
    border-bottom: none;
}

.el-collapse-item__wrap {
    width: 100%;
}

.el-collapse-item__content {
    padding-left: 10px;
    padding-right: 10px;
    padding-bottom: 10px;
}

.a11y-help {
    background: #f2f6fc;
    padding: 10px;

    p {
        margin: 0;
        line-height: 1.4;
        font-weight: bold;
    }

    a {
        color: #606266;
    }
}

.a11y-nodes {
    margin: 5px 0;
}

.a11y-node {
    font-weight: bold;
    * {
        font-weight: normal;
    }
}

.a11y-tags {
    margin: 5px 0;
}

.a11y-tags .el-tag + .el-tag {
    margin-left: 5px;
}

.a11y-results {

    .item-header {
        display: flex;
    }

    .item-header-title {
        margin-left: 5px;
    }

    .item-impact {
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
}
</style>