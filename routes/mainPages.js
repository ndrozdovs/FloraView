const express = require("express");
const router = express.Router();
const mainPages = require("../controllers/mainPages");

router.get("/", mainPages.renderHome);

router.get("/company", mainPages.renderCompany);

router.get("/pricing", mainPages.renderPricing);

router.get("/product", mainPages.renderProduct);

router.get("/useCases", mainPages.renderUserCases);

module.exports = router;
