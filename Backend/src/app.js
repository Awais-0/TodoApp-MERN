import cookieParser from "cookie-parser";
import express from "express";
import cors from 'cors';

export const App = express();

App.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
App.use(express.json({limit: '16kb'}));
App.use(express.urlencoded({extended: true, limit: '16kb'}));
App.use(express.static('public'));
App.use(cookieParser());

import {userRouter} from './routes/routerProvider.js'
App.use('/api/users', userRouter);

App.use((err, req, res, next) => {
  console.error('🔥 Global Error Handler:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
    data: null
  });
});