const commands = [
  { command: 'start', description: 'Запустить бота' },
  { command: 'help', description: 'Получить помощь' },
  // { command: 'book', description: 'Забронировать место' },
  // { command: 'cancel_reservation', description: 'Отменить бронь' },
  // { command: 'show_profile', description: 'Посмотреть профиль' },
  // { command: 'show_drivers', description: 'Показать водителей' },
  // { command: 'show_my_passengers', description: 'Показать моих пассажиров' },
  // { command: 'my_reservations', description: 'Показать мои брони' },
];

const commandsForDrivers = [
  { command: 'start', description: 'Запустить бота' },
  { command: 'help', description: 'Получить помощь' },
  { command: 'show_profile', description: 'Посмотреть профиль' },
  { command: 'show_my_passengers', description: 'Показать моих пассажиров' },
];

const commandsForPassengers = [
  { command: 'start', description: 'Запустить бота' },
  { command: 'help', description: 'Получить помощь' },
  { command: 'book', description: 'Забронировать место' },
  { command: 'cancel_reservation', description: 'Отменить бронь' },
  { command: 'show_profile', description: 'Посмотреть профиль' },
  { command: 'show_drivers', description: 'Показать водителей' },
  { command: 'my_reservations', description: 'Показать мои брони' },
];

module.exports = { commands, commandsForDrivers, commandsForPassengers };
