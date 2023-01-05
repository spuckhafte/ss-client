const fs = require('fs/promises');
const http = require('http');
const Events = require('events');

const regx = {
    CSS_REGX: /\/\*( +|)+\[([ a-zA-Z0-9,"]+|)]( +|)\*\//g,
    JS_REGX: /\/\/( |)+\[([ a-zA-Z0-9,"]|)+\]/g,
    URL_REGX: /(\/$)|(^\/)/g, // removes trailing and starting "/"
    EMBEDED_VARS: /(<!--+variable\.[a-z]+-->)|(\/\*variable\.[a-z]+\*\/)/g,
    EXTRACT_VAR: /([<!\-\-\/\*]+variable.)|([\-\->\*\/])/g // /*variable.name*/ => name
}

class Router extends Events {

    SETTINGS = {
        PORT: "",
        ERROR_PAGE: "",
        PAGES_DIR: "",
        STYLES_DIR: "",
        SCRIPTS_DIR: "",
        HOME_PAGE: "",
        HTML_FT: "", // file type
        DEFAULT_STYLE: "",
        DEFAULT_SCRIPT: "",
        CLEAR_CACHE_TIMING: "" // clears cache after certain time
    }

    variable = {};

    cache = {} // stores html pages


    constructor(
        port,
        settings = {
            pagesDir: 'pages',
            stylesDir: 'styles',
            scriptsDir: 'scripts',
            homePage: 'home',
            errorPage: 'notFound',
            defaultStyle: 'style.css',
            defaultScript: 'script.js',
            htmlFt: '.html',
            clearCache: 10 // seconds
        },
        variable
    ) {
        super();
        this.SETTINGS.PORT = port;
        this.SETTINGS.ERROR_PAGE = settings.errorPage;
        this.SETTINGS.PAGES_DIR = settings.pagesDir;
        this.SETTINGS.STYLES_DIR = settings.stylesDir;
        this.SETTINGS.SCRIPTS_DIR = settings.scriptsDir;
        this.SETTINGS.HOME_PAGE = settings.homePage;
        this.SETTINGS.HTML_FT = settings.htmlFt;
        this.SETTINGS.DEFAULT_STYLE = settings.defaultStyle;
        this.SETTINGS.DEFAULT_SCRIPT = settings.defaultScript;
        this.SETTINGS.CLEAR_CACHE_TIMING = settings.clearCache;
        this.variable = variable
    }

    start = () => {
        http.createServer(async (req, res) => {
            let pages = await fs.readdir(`./${this.SETTINGS.PAGES_DIR}`);
            let route = req.url == '/' ? this.SETTINGS.HOME_PAGE : req.url.replace(regx.URL_REGX, '');

            if (route == 'favicon.ico') return;
            this.emit('get', req, res);

            let subRoutes = [];
            pages = pages.map(page => {
                let subRoute = page.replace(/\+/g, '/');
                if (page.includes('+')) subRoutes.push(subRoute);
                return subRoute;
            })

            let htmlPage;
            if (!pages.includes(route + this.SETTINGS.HTML_FT)) {
                if (!pages.includes(`${this.SETTINGS.ERROR_PAGE}${this.SETTINGS.HTML_FT}`)) return;
                htmlPage = (await fs.readFile(`./${this.SETTINGS.PAGES_DIR}/${this.SETTINGS.ERROR_PAGE}${this.SETTINGS.HTML_FT}`)).toString();
            } else {
                if (Object.keys(this.cache).includes(route) && this.SETTINGS.CLEAR_CACHE_TIMING > 0) {
                    htmlPage = this.cache[route];
                } else {
                    route = subRoutes.includes(route + this.SETTINGS.HTML_FT) ? route.replace(/\//g, '+') : route;
                    htmlPage = (await fs.readFile(`./${this.SETTINGS.PAGES_DIR}/${route}${this.SETTINGS.HTML_FT}`)).toString();
                }
            }

            if (!Object.keys(this.cache).includes(route) || this.SETTINGS.CLEAR_CACHE_TIMING <= 0) {
                let css = await this.#getCSS(htmlPage);
                if (css) htmlPage = htmlPage.replace(regx.CSS_REGX, css).trim();

                let js = await this.#getScripts(htmlPage);
                if (js) htmlPage = htmlPage.replace(regx.JS_REGX, js).trim();

                if (regx.EMBEDED_VARS.test(htmlPage)) {
                    htmlPage = htmlPage.replace(regx.EMBEDED_VARS, (match, _) => {
                        let dataVar = match.replace(regx.EXTRACT_VAR, '');
                        dataVar = this.variable[dataVar];
                        if (!dataVar) return match;
                        else return dataVar;
                    });
                }

                if (this.SETTINGS.CLEAR_CACHE_TIMING > 0) {
                    this.cache[route] = htmlPage;
                    setTimeout(() => delete this.cache[route], this.SETTINGS.CLEAR_CACHE_TIMING * 1000);
                }
            }
            this.emit('page', route, htmlPage)
            res.end(htmlPage);
        }).listen(this.SETTINGS.PORT)
        console.log(`[LISTENING ON PORT: ${this.SETTINGS.PORT}]`);
    }

    #getCSS = async (html) => {
        let css = [];
        if (regx.CSS_REGX.test(html)) {
            let cssLoc = JSON.parse(html.split('<style>')[1].split('/*')[1].split('*/')[0].trim());
            if (cssLoc.length == 0) {
                css = [(await fs.readFile(`./${this.SETTINGS.STYLES_DIR}/${this.SETTINGS.DEFAULT_STYLE}`)).toString()];
            } else {
                for (let loc of cssLoc) {
                    css.push((await fs.readFile(`./${this.SETTINGS.STYLES_DIR}/${loc}.css`)).toString());
                }
            }
            return css.join('\n/*br*/\n');
        } else {
            css = ''
            return css;
        }
    }

    #getScripts = async (html) => {
        let scripts = [];
        if (regx.JS_REGX.test(html)) {
            let scriptLoc = JSON.parse(html.split('<script>')[1].split('//')[1].split('\n')[0].trim());
            if (scriptLoc.length == 0) {
                scripts = [(await fs.readFile(`./${this.SETTINGS.SCRIPTS_DIR}/${this.SETTINGS.DEFAULT_SCRIPT}`)).toString()];
            } else {
                for (let loc of scriptLoc) {
                    scripts.push((await fs.readFile(`./${this.SETTINGS.SCRIPTS_DIR}/${loc}.js`)).toString());
                }
            }
            return scripts.join(';\n//br\n')
        } else {
            scripts = [];
            return scripts;
        }
    }
}

module.exports = Router;
