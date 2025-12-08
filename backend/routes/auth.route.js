const express = require('express');
const router = express.Router();

//test route
// router.get('/test', (req, res) => {
//     res.send('Auth route is working!'); 
// });

//auth routes will be added here in the future
router.post('/register', (req, res) => {
    // Registration logic will go here
    res.send('User registration endpoint');
});

router.post('/login', (req, res) => {
    // Login logic will go here
    res.send('User login endpoint');
}); 


module.exports = router;