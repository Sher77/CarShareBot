import { User } from '../../db/User/index.js';

const createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

const getUserById = async (userId) => {
  return await User.findByIt(userId);
};

const updateUser = async (userId, userData) => {
  return await User.findAndUpdate(userId, userData, {
    new: true,
  });
};

const deleteUser = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

export { createUser, getUserById, updateUser, deleteUser };
