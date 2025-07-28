import {Router} from 'express'
import { addTodo, checkAuth, deleteTodo, getCurrentUser, getUserAllTodos, loginUser, logoutUser, passwordResetEmail, refreshAccessToken, registerUser, toggleCompleteTodo, updateUserAvatar, updateUserData, updateUserPassword } from '../controllers/user.controller.js'
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';

const userRouter = Router();

userRouter.route('/register').post(upload.single('avatar'), registerUser);
userRouter.route('/login').post(loginUser);
userRouter.route('/logout').post(verifyJWT, logoutUser);
userRouter.route('/check-auth').get(verifyJWT, checkAuth);
userRouter.route('/refresh-token').post(refreshAccessToken);
userRouter.route('/get-current-user').get(verifyJWT, getCurrentUser);
userRouter.route('/update-password').post(verifyJWT, updateUserPassword);
userRouter.route('/update-data').patch(verifyJWT, updateUserData);
userRouter.route('/update-avatar').put(verifyJWT, upload.single('avatar'), updateUserAvatar);
userRouter.route('/password-reset-link').post(passwordResetEmail);

userRouter.route('/add-todo').post(verifyJWT, addTodo);
userRouter.route('/delete-todo/:id').get(verifyJWT, deleteTodo);
userRouter.route('/get-user-todos').get(verifyJWT, getUserAllTodos);
userRouter.route('/toggle-isCompleteTodo/:id').patch(verifyJWT, toggleCompleteTodo);

export default userRouter