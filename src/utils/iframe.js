class Iframe {
  constructor({ el, sandboxAttributes = [] }) {
    if (!el) {
      throw new Error('Expect "el" to mount iframe to!')
    }
    this.$el = el
    this.sandboxAttributes = sandboxAttributes
  }

  setHTML(obj) {
    let html

    if (typeof obj === 'string') {
      html = obj
    } else {
      const { head = '', body = '' } = obj
      html = `<!DOCTYPE html><html><head>${head}<script src="https://cdnjs.cloudflare.com/ajax/libs/axe-core/3.3.2/axe.min.js" type="text/javascript"></script></head><body>${body}</body></html>`
    }

    const iframe = this.createIframe()

    if (this.$el.parentNode !== null) {
      this.$el.parentNode.replaceChild(iframe, this.$el)
    }

    iframe.contentWindow.document.open()
    iframe.contentWindow.document.write(html)
    iframe.contentWindow.document.close()

    this.$el = iframe
  }

  createIframe() {
    const iframe = document.createElement('iframe')
    iframe.setAttribute('sandbox', this.sandboxAttributes.join(' '))
    iframe.setAttribute('scrolling', 'yes')
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.border = '0'
    return iframe
  }
}

export default (...args) => new Iframe(...args)
