const e = require("express");

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || err.status || 500;
    // chaun bi response loi
    const response = {
        statusCode: statusCode,
        message: err.message || 'an unexpected error occurred',
        data: err.data || null,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === 'development' ? err.stack : null,
    }
    // log loi ra console o phia server de kiem tra
    console.error(err);
    // gui response ve client
    res.status(statusCode).json(response);
};

module.exports = errorHandler;