const Router = require('../index.js');

const router = new Router(3000);
router.SETTINGS.CLEAR_CACHE_TIMING = 0; // seconds

router.variable = {
    name: 'this will be changed' // referenced in "script.js"(line:2) and "home.html" (line:18)
};

router.start();

router.on('get', (req, res) => {
    router.variable.name = 'SS-Router'
});