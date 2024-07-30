import { Driver } from '../../db/Driver/index.js';

const createDriver = async (driverData) => {
  const driver = new Driver(driverData);
  return await driver.save();
};

const getDriverById = async (driverId) => {
  return await Driver.findByIt(driverId);
};

const updateDriver = async (driverId, driverData) => {
  return await Driver.findAndUpdate(driverId, driverData, { new: true });
};

const deleteDriver = async (driverId) => {
  return await Driver.findByIdAndDelete(driverId);
};

export { createDriver, getDriverById, updateDriver, deleteDriver };
