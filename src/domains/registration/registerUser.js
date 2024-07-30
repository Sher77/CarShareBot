import {
  validateAge,
  validateCar,
  validateName,
  validatePhoneNumber,
} from '../../middlewares/index.js';

const handlePassengerRegistration = async (ctx) => {
  const currentStep = ctx.session.registrationStep;

  if (currentStep === 'ask_name') {
    await validateName(ctx);
  } else if (currentStep === 'ask_phone_number') {
    await validatePhoneNumber(ctx);
  }
};

const handleDriverRegistration = async (ctx) => {
  const currentStep = ctx.session.registrationStep;

  if (currentStep === 'ask_name') {
    await validateName(ctx);
  } else if (currentStep === 'ask_phone_number') {
    await validatePhoneNumber(ctx);
  } else if (currentStep === 'ask_car') {
    await validateCar(ctx);
  } else if (currentStep === 'ask_age') {
    await validateAge(ctx);
  }
};

export { handlePassengerRegistration, handleDriverRegistration };
