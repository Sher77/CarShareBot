import { UserReservation } from '../../db/UserReservation/index.js';

const createUserReservation = async (userReservationData) => {
  const userReservation = new UserReservation(userReservationData);
  return await userReservation.save();
};

const getUserReservationById = async (userReservationId) => {
  return await UserReservation.findByIt(userReservationId);
};

const updateUserReservation = async (
  userReservationId,
  userReservationData
) => {
  return await UserReservation.findAndUpdate(
    userReservationId,
    userReservationData,
    {
      new: true,
    }
  );
};

const deleteUserReservation = async (userReservationId) => {
  return await UserReservation.findByIdAndDelete(userReservationId);
};

export {
  createUserReservation,
  getUserReservationById,
  updateUserReservation,
  deleteUserReservation,
};
