const express = require("express");
const router = express.Router();
const redeemController = require("../controllers/redeemController");

router.post("/apply-redeem", redeemController.applyRedeem);

module.exports = router;
