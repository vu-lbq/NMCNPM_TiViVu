const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const mainRouter = require('./routes/mainRouter');

// cau hinh CORS cho phep client từ các nguon khác truy cap API
app.use(cors());

// cau hinh morgan de log cac yeu cau HTTP request
app.use(morgan('dev'));

// cau hinh express de phan tich body cua yeu cau dang JSON
// Increase body size limit to handle base64 audio uploads (e.g., ~10MB)
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.URLENCODED_BODY_LIMIT || '10mb' }));
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/', mainRouter);

// xu ly loi toan cuc
// loi request not found 404
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});
// xy ly tat ca cac loi khac    

app.use(require('./middlewares/errorHandler'));

module.exports = app;