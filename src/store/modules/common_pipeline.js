import * as types from '../mutations'
import { } from '@api'

import { cloneDeep } from 'lodash'

const tabInfo = [{
  tab: '基本信息',
  selected: true,
  isCurrent: true
},
{
  tab: '构建',
  selected: false,
  isCurrent: false
}, {
  tab: '扩展',
  selected: false,
  isCurrent: false
}]

const commonInfo = {
  name: '',
  project_name: '',
  description: '',
  parameters: [],
  sub_tasks: [],
  buildv3: {},
  trigger: {}
}

const state = {
  tabs: cloneDeep(tabInfo),
  commonInfo: cloneDeep(commonInfo)

}

const getters = {
  currentTab: (state) => {
    return state.tabs.filter(tab => tab.isCurrent)[0].tab
  },
  selectedTabs: (state) => {
    return state.tabs.filter(tab => tab.selected)
  }
}

const actions = {

}

const mutations = {
  [types.UPDATE_TABS] (state, payload) {
    if (payload.type === 'delete') {
      const tab = state.tabs.filter(tab => tab.tab === payload.tab)[0]
      tab.selected = false
      if (tab.isCurrent) state.tabs[0].isCurrent = true
    } else {
      state.tabs.forEach(tab => {
        tab.isCurrent = false
        if (tab.tab === payload.tab) {
          tab.selected = true
          tab.isCurrent = true
        }
      })
    }
  },
  [types.UPDATE_COMMON_INFO] (state, payload) {
    Object.assign(state.commonInfo, payload)
  },
  [types.RESET_COMMON_PIPELINE] (state) {
    state.tabs = cloneDeep(tabInfo)
    state.commonInfo = cloneDeep(commonInfo)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
