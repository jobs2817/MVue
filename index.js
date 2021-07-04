const isElement = (el) => el instanceof Element

const $ = document.querySelector.bind(document)

const isDirctive = (dirctive) => dirctive.startsWith('v-')
const getVal = (expr, data) => {
  const len = expr.split('.').length
  return len ? expr.split('.').reduce((pre, current) => {
    return pre[current]
  }, data) : data[expr]
}

const compileUtils = {
  text: (el, expr, vm) => {
    el.textContent = getVal(expr, vm.$data)
  },
  html: (el, expr, vm) => {
    const value = getVal(expr, vm.$data)
    new Watcher(vm.$data, expr, (newVal) => {
      el.innerHTML = getVal(expr, vm.$data)
    })
    el.innerHTML = value
  },
  model: (el, expr, vm) => {
    el.value = getVal(expr, vm.$data)
  },
  on: (el, eventName, value, vm) => {
    const fn = vm.$options.methods[value]
    el.addEventListener(eventName, fn.bind(vm))
  }
}

class Compile {
  constructor(el, vm) {
    this.el = isElement(el) ? el : $(el)
    this.vm = vm
    const fragment = this.nodeToFragment(this.el)
    // 编译
    this.compile(fragment)
    this.el.appendChild(fragment)
  }
  // 编译元素
  compileElement(element) {
    const attr = element.attributes
    ;[...attr].forEach(attribute => {
      const { name, value } = attribute
      if (isDirctive(name)) {
        const [, dirctive] = name.split('-')
        if (dirctive.includes(':')) {
          const [event, eventName] = dirctive.split(':')
          compileUtils[event](element, eventName, value, this.vm)
          return
        }
        compileUtils[dirctive](element, value, this.vm)
      }
    })
  }
  // 编译文本
  compileText(text) {
    let value
    const content = text.textContent
    value = content.replace(/\{\{(.*?)\}\}/g, (match, str) => {
      return getVal(str.trim(), this.vm.$data)
    })
    text.textContent = value
  }

  compile(fargment) {
    // 获取碎片文档
    const childNodes = fargment.childNodes
    ;[...childNodes].forEach(element => {
      if (isElement(element)) {
        this.compileElement(element)
        if (element.childNodes && element.childNodes.length) {
          this.compile(element)
        }
      } else {
        this.compileText(element)
      }
    })
  }
  nodeToFragment(el) {
    const f = document.createDocumentFragment()
    let firstNode;
    while (firstNode = el.firstChild) {
      f.appendChild(firstNode)
    }
    return f
  }
}

class MVue {
  constructor(options) {
    this.$el = options.el
    this.$data = options.data
    this.$options = options
    if (this.$el) {
      new Observer(this.$data)
      new Compile(this.$el, this)
    }
  }
}