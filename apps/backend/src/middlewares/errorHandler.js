const e = require("express");

const errorHandler = (err, req, res, next) => {
    // xác định mã trạng thái lỗi, mặc định là 500, nếu không có thì lấy từ err.statusCode hoặc err.status
    const statusCode = err.statusCode || err.status || 500;
    // chaun bi response loi
    const response = {
        statusCode: statusCode,
        message: err.message || 'an unexpected error occurred',
        data: err.data || null,
        errors: err.errors || [],
        // chi tiet, nếu trong môi trường phát triển (development)
        stack: process.env.NODE_ENV === 'development' ? err.stack : null,
    }
    // log loi ra console o phia server de kiem tra
    console.error(err);
    // gui response ve client
    res.status(statusCode).json(response);
};

module.exports = errorHandler;