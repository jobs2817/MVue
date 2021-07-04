
class Dep {
  constructor() {
    this.subs = []
  }
  add(watcher) {
    this.subs.push(watcher)
  }
  notify() {
    console.log(this.subs)
    this.subs.forEach(w => w.update())
  }
}
class Watcher {
  constructor(vm, expr, cb) {
    this.vm = vm
    this.expr = expr
    this.cb = cb
    this.oldValue = this.getOldValue()
  }
  getOldValue() {
    Dep.target = this
    console.log(this, 'this')
    const value = getVal(this.expr , this.vm)
    Dep.target = null
    return value
  }
  update() {
    const newValue = getVal(this.expr , this.vm)
    console.log(newValue, this.oldValue)
    if (newValue !== this.oldValue) {
      this.cb(newValue)
    }
  }
}

class Observer {
  constructor(data) {
    this.observe(data)
  }
  observe (data) {
    if (typeof data === 'object') {
      Object.keys(data).forEach(key => {
        this.definceReactive(data, key, data[key])
      })
    }
  }
  definceReactive(data, key, value) {
    const dep = new Dep()
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get: () => {
        console.log(1111)
        Dep.target && dep.add(Dep.target)
        return value
      },
      set: (newValue) => {
        this.observe(newValue)
        if (value !== newValue) {
          value = newValue
        }
        console.log(dep, 'depdep')
        dep.notify()
      }
    })
  }
}
