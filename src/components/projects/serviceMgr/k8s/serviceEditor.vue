<template>
  <div class="pipeline-workflow__column pipeline-workflow__column_left pipeline-workflow__column--w100p">
    <div class="white-box-with-shadow">
      <div class="white-box-with-shadow__content">
        <div class="row cf-pipeline-yml-build__wrapper">
          <div class="cf-pipeline-yml-build__editor cf-pipeline-yml-build__editor_inline">
            <div
              class="cf-pipeline-yml-build__editor-wrapper"
              @keydown.meta.83.prevent="updateServiceByKeyword"
            >
              <div class="yaml-desc" v-show="!service.yaml">请输入 Kubernetes YAML 配置</div>
              <CodeMirror style="width: 100%; height: 100%;" ref="myCm" :value="service.yaml" :options="cmOptions" @input="onCmCodeChange"/>
            </div>
            <div class="modal-block" v-if="service.source === 'template' && showModal">
              <el-button type="primary" size="small" @click="showModal = false">预览/编辑</el-button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="info.message" class="yaml-errors__container yaml-errors__accordion-opened">
        <ul class="yaml-errors__errors-list yaml-infos__infos-list">
          <li class="yaml-errors__errors-list-item yaml-infos__infos-list-item">
            <div class="yaml-errors__errors-list-item-text">{{info.message}}</div>
          </li>
        </ul>
      </div>
      <div v-if="errors.length > 0" class="yaml-errors__container yaml-errors__accordion-opened">
        <ul class="yaml-errors__errors-list">
          <li v-for="(error,index) in errors" :key="index" class="yaml-errors__errors-list-item">
            <div class="yaml-errors__errors-list-item-counter">{{index+1}}</div>
            <div class="yaml-errors__errors-list-item-text">{{error.message}}</div>
          </li>
        </ul>
      </div>
      <div class="controls__wrap">
        <div class="controls__right">
          <el-button v-hasPermi="{projectName: projectName, actions:['edit_service','create_service'],operator:'or',isBtn:true}" v-if="!hideSave" type="primary" size="small" :disabled="disabledSave || !yamlChange" @click="updateService">保存</el-button>
          <el-button v-hasPermi="{projectName: projectName, action:'manage_environment',isBtn:true}" v-if="!isOnboarding" type="primary" size="small" :disabled="!showJoinToEnvBtn" @click="showJoinToEnvDialog">加入环境</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import jsyaml from 'js-yaml'
import { debounce } from 'lodash'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/yaml/yaml.js'
import 'codemirror/theme/xq-light.css'
import 'codemirror/addon/scroll/annotatescrollbar.js'
import 'codemirror/addon/search/matchesonscrollbar.js'
import 'codemirror/addon/search/matchesonscrollbar.css'
import 'codemirror/addon/search/match-highlighter.js'
import 'codemirror/addon/search/jump-to-line.js'

import 'codemirror/addon/dialog/dialog.js'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/search/search.js'
import {
  validateYamlAPI,
  serviceTemplateAPI,
  saveServiceTemplateAPI
} from '@api'
export default {
  props: {
    serviceInTree: {
      type: Object,
      required: true
    },
    isOnboarding: {
      type: Boolean,
      default: false
    },
    showJoinToEnvBtn: {
      type: Boolean,
      default: false
    },
    yamlChange: Boolean
  },
  data () {
    return {
      // codemirror options
      cmOptions: {
        tabSize: 5,
        readOnly: false,
        mode: 'text/yaml',
        lineNumbers: true,
        line: true,
        collapseIdentical: true
      },
      importTemplateEditorOption: {
        tabSize: 2,
        readOnly: 'nocursor',
        theme: 'neo',
        mode: 'text/x-dockerfile',
        lineNumbers: false,
        line: true,
        showGutter: false,
        displayIndentGuides: false,
        showPrintMargin: false,
        collapseIdentical: true
      },
      errors: [],
      info: { message: '' },
      service: {},
      stagedYaml: {},
      initYaml: '',
      dialogImportYamlVisible: false,
      previewYamlFile: false,
      showModal: true
    }
  },
  methods: {
    keepInitYaml (newYaml) {
      this.initYaml = newYaml
      this.$emit('update:yamlChange', this.initYaml !== this.service.yaml)
    },
    getService (val) {
      const serviceName = val ? val.service_name : this.serviceName
      const projectName = val.product_name
      const serviceType = val.type
      this.service.yaml = ''
      if (val && serviceType) {
        serviceTemplateAPI(serviceName, serviceType, projectName).then(res => {
          this.service = res
          // emit template id to tree
          if (res.template_id) {
            this.$emit('onGetTemplateId', { service_name: res.service_name, template_id: res.template_id })
          }
          this.keepInitYaml(res.yaml)
          if (this.$route.query.kind) {
            this.jumpToWord(`kind: ${this.$route.query.kind}`)
          }
        })
      }
    },
    updateServiceByKeyword () {
      const cantSave = this.hideSave || this.disabledSave || !this.yamlChange
      if (cantSave) {
        return
      }
      this.updateService()
    },
    updateService () {
      const projectName = this.projectName
      const serviceName = this.service.service_name
      const visibility = this.service.visibility
        ? this.service.visibility
        : 'private'
      const yaml = this.service.yaml
      const isEdit = this.serviceInTree.status === 'added'
      const payload = {
        product_name: projectName,
        service_name: serviceName,
        visibility: visibility,
        type: 'k8s',
        yaml: yaml,
        source: 'spock'
      }
      return saveServiceTemplateAPI(isEdit, payload).then(res => {
        this.$message({
          type: 'success',
          message: `服务 ${payload.service_name} 保存成功`
        })
        this.keepInitYaml(payload.yaml)
        this.$emit('onUpdateService', {
          serviceName: serviceName,
          serviceStatus: this.service.status,
          res
        })
        this.$emit('update:showJoinToEnvBtn', true)
      })
    },
    showJoinToEnvDialog () {
      this.$emit('showJoinToEnvDialog', true)
    },
    onCmCodeChange: debounce(function (newCode) {
      this.errors = []
      this.service.yaml = newCode
      this.$emit('update:yamlChange', this.initYaml !== this.service.yaml)
      if (this.service.yaml) {
        this.validateYaml(newCode)
        if (this.service.status === 'named') {
          this.stagedYaml[this.service.service_name] = newCode
        }
      }
    }, 100),
    validateYaml (code) {
      const payload = this.service
      validateYamlAPI(this.projectName, payload).then(res => {
        if (res && res.length > 0) {
          this.errors = res
        } else if (res && res.length === 0) {
          this.errors = []
          this.kindParser(payload.yaml)
        }
      })
    },
    kindParser (yaml) {
      const yamlJsonArray = yaml
        .split('---')
        .filter(element => {
          return element.indexOf('kind') > 0
        })
        .map(element => {
          return jsyaml.load(element)
        })
      this.$emit('onParseKind', {
        service_name: this.service.service_name,
        payload: yamlJsonArray.filter(item => {
          return item
        })
      })
    },
    jumpToWord (word) {
      this.$nextTick(() => {
        const result = this.codemirror.showMatchesOnScrollbar(word)
        if (result.matches.length > 0) {
          const line = result.matches[0]
          this.codemirror.setSelection(line.from, line.to)
          this.codemirror.scrollIntoView({ from: line.from, to: line.to }, 200)
        }
      })
    },
    editorFocus () {
      this.codemirror.focus()
    }
  },
  computed: {
    codemirror () {
      return this.$refs.myCm.codemirror
    },
    projectName () {
      return this.$route.params.project_name
    },
    serviceType () {
      return this.serviceInTree.type
    },
    serviceName () {
      return this.serviceInTree.service_name
    },
    disabledSave () {
      return this.errors.length > 0
    },
    hideSave () {
      if (
        this.service.source === 'gitlab' ||
        this.service.source === 'github' ||
        this.service.source === 'gerrit' ||
        (this.service.visibility === 'public' &&
          this.service.product_name !== this.projectName)
      ) {
        return true
      } else {
        return false
      }
    }
  },
  watch: {
    serviceInTree: {
      handler (val, old_val) {
        if (
          val.visibility === 'public' &&
          val.product_name !== this.projectName
        ) {
          this.info = {
            message:
              '信息：其他项目的共享服务，不支持在本项目中编辑，编辑器为只读模式'
          }
        } else if (
          val.product_name === this.projectName &&
          val.source &&
          val.source !== 'spock' && val.source !== 'template'
        ) {
          this.info = {
            message: '信息：当前服务为仓库管理服务，编辑器为只读模式'
          }
        } else {
          this.info = {
            message: ''
          }
        }
        if (val.status === 'added') {
          this.getService(val)
          if (
            val.source === 'gitlab' ||
            val.source === 'gerrit' ||
            val.source === 'github' ||
            (val.visibility === 'public' &&
              val.product_name !== this.projectName)
          ) {
            this.cmOptions.readOnly = 'nocursor'
          } else {
            this.cmOptions.readOnly = false
          }
          if (val.source === 'template') {
            this.showModal = true
          }
        } else if (val.status === 'named') {
          this.service = {
            yaml: '',
            service_name: val.service_name,
            status: 'named'
          }
          this.initYaml = '-#-'
          this.$emit('update:yamlChange', this.initYaml !== this.service.yaml)
          this.cmOptions.readOnly = false
          if (this.stagedYaml[val.service_name]) {
            this.service.yaml = this.stagedYaml[val.service_name]
          }
          this.$refs.myCm && this.editorFocus()
        }
      },
      immediate: true
    }
  },
  mounted () {
    this.editorFocus()
  },
  components: {
    CodeMirror: codemirror
  }
}
</script>
<style lang="less">
@import '~@assets/css/component/service-editor.less';
</style>
