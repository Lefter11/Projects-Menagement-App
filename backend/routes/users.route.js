const express = require("express");
const { authenticate } = require("../middleware/auth");
const { getMe, updateMe } = require("../controllers/user.controller");

const router = express.Router();

router.use(authenticate);

router.get('/me', getMe);
router.put('/me', updateMe);

module.exports = router;
