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

const Editor = {
    init() {
        console.log('Editor init...')
        this.$editInput = $('.editor textarea')
        this.saveButton = $('.editor .button-save')
        this.$slideContainer = $('.slides')
        this.markdown = localStorage.markdown || `# 简易幻灯片
让工作更专注于效率
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
    init(){
        this.$$figures = $$('.themes figure')
        this.$transition = $('.theme .transition')
        this.$align = $('.theme .align')
        this.$reveal = $('.reveal')


        this.bind()
        this.loadTheme()
    },
    bind(){
       this.$$figures.forEach(figure => figure.onclick = ()=>{
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
    setTheme(theme){
        localStorage.theme = theme
        location.reload()
    },
    loadTheme(){
        let theme = localStorage.theme || 'beige'
        let $link = document.createElement('link')
        $link.rel = 'stylesheet'
        $link.href = `dist/theme/${theme}.css`
        document.head.appendChild($link)
        Array.from(this.$$figures).find(item=>item.dataset.theme === theme).classList.add('select')

        this.$transition.value = localStorage.transition || 'slide'
        this.$align.value = localStorage.align || 'center'
        this.$reveal.classList.add(this.$align.value)
    }
}

const App = {
    init() {
        [...arguments].forEach(Module => Module.init())
    }
}

App.init(Menu, Editor,Theme)