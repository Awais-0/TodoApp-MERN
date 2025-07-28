import { User } from "../models/user.model.js";
import ApiErrorHandler from "../utilities/apiErrorHandler.utility.js";
import asyncHandler from "../utilities/asyncHandler.utility.js";
import jwt from 'jsonwebtoken'

export const verifyJWT = asyncHandler( async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
        // console.log(token)
        if(!token) {
            throw new ApiErrorHandler(403, "Unauthorized");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user) {
            throw new ApiErrorHandler(401, 'Invalid token');
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiErrorHandler(401, error)
    }
})