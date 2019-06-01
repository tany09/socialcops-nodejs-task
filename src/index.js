const express = require('express');
const app = express();
require('./db/mongoose');
const router = require('./router/user');

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(router);



app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});