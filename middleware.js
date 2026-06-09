const express = require('express');
const app = express();


app.use(express.json());

function logger(req, res, next) {
    req.timestamp = new Date().toISOString();
    console.log(`[${req.timestamp}] ${req.method} ${req.url}`);
    next(); 
}
app.use(logger);


app.get('/', (req, res) => {
    res.send('Home page');
});

app.post('/notes', (req, res) => {   
    const { title, description } = req.body;
    res.json({
        message: 'Note created successfully', 
        data: { 
            title, 
            description, 
            timestamp: req.timestamp 
        } 
    });
});


app.listen(4000, () => {
    console.log('Server is running on port 4000');
});