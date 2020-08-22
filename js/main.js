const $ = s => document.querySelector(s)
const $$ = s => document.querySelectorAll(s)

const isMain = str => (/^#{1,2}(?!#)/).test(str)
const isBranch = str => (/^#{3}(?!#)/).test(str)

const convert = raw => {
    const handledArray = raw.split(/\n(?=\s*#{1,3}[^#])/).filter(r => r !== '').map(r => r.trim())
    let html = ''
    for (let i = 0; i < handledArray.length; i++) {
        if (handledArray[i + 1] !== undefined) {
            if (isMain(handledArray[i]) && isMain(handledArray[i + 1])) { // 当前和下一项都是主要页面
                html += `
                        <section data-markdown>
                            <textarea data-template>
                                ${handledArray[i]}
                            </textarea>
                        </section>
                    `
            } else if (isMain(handledArray[i]) && isBranch(handledArray[i + 1])) { //当前项是主要页面，下一项是分页
                html += `
                        <section>
                            <section data-markdown>
                                <textarea data-template>
                                    ${handledArray[i]}
                                </textarea>
                            </section>
                    `
            } else if (isBranch(handledArray[i]) && isBranch(handledArray[i + 1])) { //当前和下一项都是分页
                html += `
                        <section data-markdown>
                            <textarea data-template>
                                ${handledArray[i]}
                            </textarea>
                        </section>
                    `
            } else if (isBranch(handledArray[i]) && isMain(handledArray[i + 1])) {  //当前项是分页，下一项是主要页面
                html += `
                            <section data-markdown>
                                <textarea data-template>
                                    ${handledArray[i]}
                                </textarea>
                            </section>
                        </section>
                    `
            }
        } else {
            if (isMain(handledArray[i])) {
                html += `
                        <section data-markdown>
                            <textarea data-template>
                                ${handledArray[i]}
                            </textarea>
                        </section>
                    `
            } else if (isBranch(handledArray[i])) {
                html += `
                            <section data-markdown>
                                <textarea data-template>
                                    ${handledArray[i]}
                                </textarea>
                            </section>
                        </section>
                    `
            }
        }
    }
    return html
}


const Menu = {
    init() {
        console.log('Menu init...')
        this.$settingIcon = $('.control .icon-setting')
        this.$menu = $('.menu')
        this.$closeIcon = $('.menu .icon-close')
        this.$$tabs = $$('.menu .tab')
        this.$$content = $$('.menu .content')
        this.bind()
    },
    bind() {
        this.$settingIcon.onclick = () => {
            this.$menu.classList.add('open')
        }
        this.$closeIcon.onclick = () => {
            this.$menu.classList.remove('open')
        }
        this.$$tabs.forEach(tab => tab.onclick = () => {
            this.$$tabs.forEach(node => node.classList.remove('active'))
            tab.classList.add('active')
            let index = [...this.$$tabs].indexOf(tab)
            this.$$content.forEach(node => node.classList.remove('active'))
            this.$$content[index].classList.add('active')
        })
    }
}

const ImgUploador = {
    init(){
        this.$fileInput = $('#img-uploador')
        this.$textarea = $('.editor textarea')

        AV.init({
            appId: "JteeDlO2w9XUck9puq91cKFr-gzGzoHsz",
            appKey: "sEQXrUBSxYuETJsinBeaONV9",
            serverURLs: "https://jteedlo2.lc-cn-n1-shared.com"
        })

        this.bind()
    },
    bind(){
        const self = this
        this.$fileInput.onchange = function () {
            if (this.files.length > 0) {
                let localFile = this.files[0]
                console.log(localFile)
                if(localFile.size/1048576 > 2) {
                    alert('文件不能超过2M')
                    return
                }
                self.insertText(`![上传中，进度0%]()`)
                let  avFile = new AV.File(encodeURI(localFile.name), localFile)
                avFile.save({
                    keepFileName: true,
                    onprogress(progress) {
                        self.insertText(`![上传中，进度${progress.percent}%]()`)
                    }
                }).then(file => {
                    console.log('文件保存完成')
                    console.log(file)
                    let text = `![${file.attributes.name}](${file.attributes.url}?imageView2/0/w/800/h/400)`
                    self.insertText(text)
                }).catch(err => console.log(err))
            }
        }
    },
    insertText(text = '') {
        let $textarea = this.$textarea
        let start = $textarea.selectionStart
        let end = $textarea.selectionEnd
        let oldText = $textarea.value

        $textarea.value = `${oldText.substring(0, start)}${text} ${oldText.substring(end)}`
        $textarea.focus()
        $textarea.setSelectionRange(start, start + text.length)
    }
}

const Editor = {
    init() {
        console.log('Editor init...')
        this.$editInput = $('.editor textarea')
        this.saveButton = $('.editor .button-save')
        this.$slideContainer = $('.slides')
        this.markdown = localStorage.markdown || `# 简易幻灯片
让工作更专注于效率
> 鼠标浮到左上角点击打开设置
            `

        this.bind()
        this.start()
    },
    bind() {
        this.saveButton.onclick = () => {
            localStorage.markdown = this.$editInput.value
            location.reload()
        }
    },
    start() {
        this.$editInput.value = this.markdown
        this.$slideContainer.innerHTML = convert(this.markdown)
        Reveal.initialize({
            controls: true,
            progress: true,
            center: localStorage.align !== 'left-top',
            hash: true,
            transition: localStorage.transition || 'slide', // none/fade/slide/convex/concave/zoom
            // Learn about plugins: https://revealjs.com/plugins/
            plugins: [RevealZoom, RevealNotes, RevealSearch, RevealMarkdown, RevealHighlight]
        });
    }
}

const Theme = {
    init() {
        this.$$figures = $$('.themes figure')
        this.$transition = $('.theme .transition')
        this.$align = $('.theme .align')
        this.$reveal = $('.reveal')


        this.bind()
        this.loadTheme()
    },
    bind() {
        this.$$figures.forEach(figure => figure.onclick = () => {
            this.$$figures.forEach(item => item.classList.remove('select'))
            figure.classList.add('select')
            this.setTheme(figure.dataset.theme)
        })

        this.$transition.onchange = function () {
            localStorage.transition = this.value
            location.reload()
        }
        this.$align.onchange = function () {
            localStorage.align = this.value
            location.reload()
        }
    },
    setTheme(theme) {
        localStorage.theme = theme
        location.reload()
    },
    loadTheme() {
        let theme = localStorage.theme || 'league'
        let $link = document.createElement('link')
        $link.rel = 'stylesheet'
        $link.href = `dist/theme/${theme}.css`
        document.head.appendChild($link)
        Array.from(this.$$figures).find(item => item.dataset.theme === theme).classList.add('select')

        this.$transition.value = localStorage.transition || 'slide'
        this.$align.value = localStorage.align || 'center'
        this.$reveal.classList.add(this.$align.value)
    }
}

const Print = {
    init() {
        this.$download = $('.download')
        this.bind()
        this.start()
    },
    bind() {
        this.$download.addEventListener('click', () => {
            let $link = document.createElement('a')
            $link.setAttribute('target', '_blank')
            $link.setAttribute('href', location.href.replace(/#\/.*/, '?print-pdf'))
            console.log($link.href)
            $link.click()
        })
        window.onafterprint = () => window.close()
    },
    start() {
        let link = document.createElement('link')
        link.rel = 'stylesheet'
        link.type = 'text/css'
        if (window.location.search.match(/print-pdf/gi)) {
            link.href = 'css/print/pdf.css'
            window.print()
        } else {
            link.href = 'css/print/paper.css'
        }
        document.head.appendChild(link)
    }
}

const App = {
    init() {
        [...arguments].forEach(Module => Module.init())
    }
}

App.init(Menu, Editor, Theme, Print,ImgUploador)