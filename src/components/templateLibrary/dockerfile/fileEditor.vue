<template>
  <div
       class="pipeline-workflow__column file-editor pipeline-workflow__column--w100p">
    <div class="white-box-with-shadow">
        <div class="white-box-with-shadow__content">
          <div class="row cf-pipeline-yml-build__wrapper">
            <div class="cf-pipeline-yml-build__editor cf-pipeline-yml-build__editor_inline">
              <div
                   class="cf-pipeline-yml-build__editor-wrapper"
                   @keydown.meta.83.prevent="updateFileWhenEnter">
                <codemirror style="width: 100%; height: 100%;"
                            ref="myCm"
                            :value="fileContent.content"
                            :options="cmOptions"
                            @input="onCmCodeChange">
                </codemirror>
              </div>
            </div>
          </div>
        </div>
        <div v-if="errors.length > 0"
             class="yaml-errors__container yaml-errors__accordion-opened">
          <ul class="yaml-errors__errors-list">
            <li v-for="(error,index) in errors"
                :key="index"
                class="yaml-errors__errors-list-item">
              <div class="yaml-errors__errors-list-item-counter"> {{index+1}} </div>
              <div class="yaml-errors__errors-list-item-text">{{error}}</div>
            </li>
          </ul>
        </div>
        <div class="controls__wrap">
          <div class="controls__right">
            <el-button v-hasPermi="{type: 'system', action: fileStatus === 'added'?'edit_template':'create_template',isBtn:true, disabled: disabledSave }" type="primary"
                       size="small"
                       :disabled="disabledSave"
                       @click="updateFile">保存</el-button>
          </div>
        </div>
    </div>
  </div>
</template>
<script>
import { debounce } from 'lodash'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/dockerfile/dockerfile'
import 'codemirror/theme/neo.css'
import 'codemirror/addon/scroll/annotatescrollbar.js'
import 'codemirror/addon/search/matchesonscrollbar.js'
import 'codemirror/addon/search/matchesonscrollbar.css'
import 'codemirror/addon/search/match-highlighter.js'
import 'codemirror/addon/search/jump-to-line.js'

import 'codemirror/addon/dialog/dialog.js'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/search/search.js'
import { validateDockerfileAPI, createDockerfileTemplateAPI, updateDockerfileTemplateAPI } from '@api'

export default {
  props: {
    fileContent: {
      type: Object,
      required: true
    },
    fileContentChange: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      cmOptions: {
        tabSize: 5,
        readOnly: false,
        theme: 'neo',
        mode: 'text/x-dockerfile',
        lineNumbers: true,
        line: true,
        collapseIdentical: true
      },
      errors: [],
      file: {
        content: ''
      },
      stagedFile: {},
      initFileContent: '',
      newCode: ''
    }
  },
  methods: {
    updateFileWhenEnter () {
      const disabledSave = this.disabledSave
      if (disabledSave) {
        return
      }
      this.updateFile()
    },
    async updateFile () {
      const fileName = this.fileContent.name
      const fileId = this.fileContent.id
      const content = this.fileContent.content
      const status = this.fileStatus
      const payload = {
        name: fileName,
        content: content
      }
      if (status === 'added') {
        const res = await updateDockerfileTemplateAPI(
          fileId, payload
        ).catch(err => {
          console.log(err)
        })
        if (res) {
          this.$emit('onUpdateFile', { name: fileName, status: 'added', payload })
          this.$message({
            type: 'success',
            message: `模板 ${fileName} 更新成功`
          })
        }
      } else if (status === 'named') {
        const res = await createDockerfileTemplateAPI(payload
        ).catch(err => {
          console.log(err)
        })
        if (res) {
          this.$emit('onUpdateFile', { name: fileName, status: 'added', payload })
          this.$message({
            type: 'success',
            message: `模板 ${fileName} 创建成功`
          })
        }
      }
    },
    onCmCodeChange: debounce(function (newCode) {
      this.errors = []
      this.fileContent.content = newCode
      if (this.fileContent.content) {
        this.validateFile(newCode)
        if (this.fileContent.status === 'named') {
          this.stagedFile[this.fileContent.name] = newCode
        }
      }
    }, 500),
    validateFile (code) {
      const payload = {
        content: code
      }
      validateDockerfileAPI(payload).then((res) => {
        this.errors = []
        if (res && res.error) {
          this.errors.push(res.error)
        } else if (res && res.error === '') {
          this.errors = []
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
    fileName () {
      return this.fileContent.name
    },
    fileId () {
      return this.fileContent.id
    },
    fileStatus () {
      return this.fileContent.status
    },
    disabledSave () {
      return this.errors.length > 0
    }
  },
  mounted () {
    this.editorFocus()
  },
  components: {
    codemirror
  }
}
</script>
<style lang="less">
@import "~@assets/css/component/file-editor.less";
</style>
