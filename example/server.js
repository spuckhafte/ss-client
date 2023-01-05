const Router = require('../index.js');

const router = new Router(3000);
router.SETTINGS.CLEAR_CACHE_TIMING = 20; // seconds

router.start({
    name: 'hey there' // referenced in "script.js"(line:2) and "home.html" (line:18)
});