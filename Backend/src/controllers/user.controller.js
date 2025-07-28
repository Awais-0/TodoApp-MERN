import asyncHandler from '../utilities/asyncHandler.utility.js'
import ApiResponseHandler from '../utilities/apiResponseHandler.utility.js'
import ApiErrorHandler from '../utilities/apiErrorHandler.utility.js'
import {uploadOnCloudinary} from '../utilities/cloudinary.utility.js'
import {User} from '../models/user.model.js'
import nodemailer from 'nodemailer'
import { Todo } from '../models/todo.model.js'

export const registerUser = asyncHandler(async (req, res) => {
    const {username, fullname, email, password} = req.body;
    if([username, fullname, email, password].some(element => !element || element.trim() === '')) throw new ApiErrorHandler(401, 'Bad request: All fields are required!');

    const existingUser = await User.findOne({
        $or: [{username}, {email}]
    });
    // console.log(existingUser)
    if (existingUser) {
        throw new ApiErrorHandler(400, "Username or email already exists");
    };
    
    const avatarPath = req.file?.path
    if(!avatarPath) throw new ApiErrorHandler(400, 'Bad Request: avatar file is missing');

    const avatar = await uploadOnCloudinary(avatarPath);
    if(!avatar) throw new ApiErrorHandler(501, 'Failed to upload avatar on cloud');

    const user = await User.create({
        username: username.toLowerCase(),
        fullname,
        email,
        password,
        avatar: avatar.url
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiErrorHandler(500, "Something went wrong while registring User");    
    }
    res.status(200).json(new ApiResponseHandler(200, 'User registered successfully', createdUser));
});

export const checkAuth = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    if (!user) {
        throw new ApiErrorHandler(401, 'Not authorized');
    }

    res.status(200).json(
        new ApiResponseHandler(200, 'User is authenticated', user)
    );
});

export const loginUser = asyncHandler(async (req, res) => {
    const {username, password} = req.body;
    let accessToken = ''
    let refreshToken = ''

    if ([username, password].some(item => item.trim() === '')) {
        throw new ApiErrorHandler(400, 'All fields are required');
    }

    const existingUser = await User.findOne({username});
    if (!existingUser) {
        throw new ApiErrorHandler(404, 'User not found');
    }

    const check = await existingUser.isPasswordCorrect(password)
    if (check) {
        try {
            accessToken = existingUser.generateAccessToken()
            refreshToken = existingUser.generateRefreshToken()
            existingUser.refreshToken = refreshToken;
            await existingUser.save({validateBeforeSave: false})
        } catch (error) {
            console.log('Error occured: ', error)
            throw new ApiErrorHandler(500, "Failed to create tokens")
        }
    } else {
        throw new ApiErrorHandler(400, "Incorrect password")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponseHandler(200,'user logged in successfully', {
            accessToken, refreshToken
        })
    )
});

export const logoutUser = asyncHandler(async (req, res) => {
    // console.log("Logging out user:", req.user);

    const result = await User.updateOne({ _id: req.user._id }, { $unset: { refreshToken: "" } });
    // console.log("DB Update result:", result);

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json({
            statusCode: 200,
            message: 'User logged out',
            data: {}
        });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    let accessToken
    let newrefreshToken 
    const incomingToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!incomingToken) {
        throw new ApiErrorHandler(401, 'Unauthorized request')
    }

    const decodedToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_KEY)
    const user = await User.findById(decodedToken?._id)
    if(!user) {
        throw new ApiErrorHandler(401, 'Invalid Token');
    }

    if(user.refreshToken !== incomingToken) {
        throw new ApiErrorHandler(401, 'Refresh token expired or used');
    }
    const options = {
        httpOnly: true,
        secure: true
    }
    try {
        accessToken = await user.generateAccessToken()
        newrefreshToken = await user.generateRefreshToken()
        user.refreshToken = newrefreshToken;
        await user.save({ validateBeforeSave: false });
    } catch (error) {
        console.log('Error occured: ', error)
        throw new ApiErrorHandler(500, "Failed to create access token")
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newrefreshToken, options).
    json( new ApiResponseHandler(200,"AccessToken refreshed", {'refreshToken': newrefreshToken}))
});

export const updateUserPassword = asyncHandler(async (req, res) => {
    console.log(req.body)
    const {oldpassword, newpassword} = req.body;
    const user = await User.findById(req.user?._id);
    
    const isPasswordCorrect = await user.isPasswordCorrect(oldpassword)
    if(!isPasswordCorrect) {
        throw new ApiErrorHandler(400, 'Invalid Password')
    }

    user.password = newpassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(
        new ApiResponseHandler(200, "Password Updated Successfully", {})
    )
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponseHandler(200, "User found", req.user));
});

export const updateUserData = asyncHandler(async (req, res) => {
    const {username, fullname, email} = req.body;
    if(!username && !fullname && !email) {
        throw  new ApiErrorHandler(400, 'All fields are required')
    }
    
    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            username,
            fullname,
            email
        }
    }, {new: true}).select("-password -refreshToken");

    if(!user) {
        throw new ApiErrorHandler(400, "Unauthorized request")
    }

    return res.status(200).json(new ApiResponseHandler(200, "User data updated", user));
});

export const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarpath = req.file?.path
    // console.log(req.files)

    const avatar = await uploadOnCloudinary(avatarpath)
    if(!avatar) throw new ApiErrorHandler(500, 'Failed to upload avatar');

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            avatar: avatar.url
        }
    }, {new: true}).select("-password -refreshToken");
    if(!user) {
        throw new ApiErrorHandler(400, "Unauthorized request")
    }

    return res.status(200).json(new ApiResponseHandler(200, "Avatar successfully updated", user));
});

export const passwordResetEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiErrorHandler(404, "Email not registered");
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER, // e.g., "virtucomm1@gmail.com"
      pass: process.env.EMAIL_PASS, // stored securely in .env
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email, // <-- send to the requesting user's email
    subject: "Password Reset Request",
    text: `Hi ${user.fullname},\n\nYou requested a password reset.\n\n(You can add a reset link here)\n\n- VirtuComm Team`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return res
      .status(200)
      .json(new ApiResponseHandler(200, "Email sent successfully", { email }));
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ApiErrorHandler(500, "Failed to send reset email");
  }
});

export const addTodo = asyncHandler( async (req, res) => {
    const {title} = req.body;
    if(title.trim() === '') throw new ApiErrorHandler(401, 'Bad request: Title required');

    const todo = await Todo.create({
        title: title,
        owner: req.user?._id
    });
    if(!todo) throw new ApiErrorHandler(501, 'Failed to create todo');

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $push: {todos: todo._id}
    }, {new: true}).select("-password -refreshToken");
    if(!user) throw new ApiErrorHandler(404, 'User not registered!');

    return  res.status(200).json(new ApiResponseHandler(200, 'Todo added successfully', todo));
});

export const getUserAllTodos = asyncHandler( async (req, res) => {
    const todos = await Todo.find({owner: req.user?._id})
    if(todos.length === 0) throw new ApiErrorHandler(404, 'No todo found');

    return res.status(200).json(new ApiResponseHandler(200, 'Todos found successfull', todos));
});

export const toggleCompleteTodo = asyncHandler( async (req, res) => {
    const {id} = req.params
    const todo = await Todo.findOne({_id: id});
    if(!todo) throw new ApiErrorHandler(404, "Todo not found", id);


    const newTodo = await Todo.findByIdAndUpdate(id, {
        $set: {
            isCompleted: !todo.isCompleted
        }
    }, {new: true});

    if(!newTodo) throw new ApiErrorHandler(500, "Failed to updated todo isComplete");

    return res.status(200).json(new ApiResponseHandler(200, "Todo is complete toggled successfully", newTodo));

});

export const deleteTodo = asyncHandler( async (req, res) => {
    const {id} = req.params;
    const deletedTodo = await Todo.findByIdAndDelete(id)
    if(!deletedTodo) throw new ApiErrorHandler(404, "Todo not found");

    await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { todos: id } },
        { new: true }
    );
    
    return res.status(200).json(new ApiResponseHandler(200, "Todo deleted successfully", deletedTodo));
});