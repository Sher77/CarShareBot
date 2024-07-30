import { TaxiRequest } from '../../db/TaxiRequest/index.js';

const createTaxiRequest = async (taxiRequestData) => {
  const taxiRequest = new TaxiRequest(taxiRequestData);
  return await taxiRequest.save();
};

const getTaxiRequestById = async (taxiRequestId) => {
  return await TaxiRequest.findByIt(taxiRequestId);
};

const updateTaxiRequest = async (taxiRequestId, taxiRequestData) => {
  return await TaxiRequest.findAndUpdate(taxiRequestId, taxiRequestData, {
    new: true,
  });
};

const deleteTaxiRequest = async (taxiRequestId) => {
  return await TaxiRequest.findByIdAndDelete(taxiRequestId);
};

export {
  createTaxiRequest,
  getTaxiRequestById,
  updateTaxiRequest,
  deleteTaxiRequest,
};
