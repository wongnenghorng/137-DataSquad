const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    return res.json({
        message: 'Donation Smart Contract'
    });
});

router.use('/contract', require(`${__dirname}/controllers/contract`));

module.exports = router;