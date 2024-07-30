const commands = [
  { command: 'start', description: 'Запустить бота' },
  { command: 'help', description: 'Получить помощь' },
  { command: 'menu', description: 'Открыть меню' },
  { command: 'book', description: 'Забронировать место' },
  { command: 'book_taxi', description: 'Забронировать место в такси' },
  { command: 'my_reservations', description: 'Показать мои брони' },
  { command: 'cancel_reservation', description: 'Отменить бронь' },
  { command: 'cancel_book_taxi', description: 'Отменить бронь в такси' },
  { command: 'update_profile', description: 'Обновить данные профиля' },
  { command: 'show_profile', description: 'Посмотреть профиль' },
  { command: 'show_drivers', description: 'Показать водителей' },
  { command: 'show_my_passengers', description: 'Показать моих пассажиров' },
  {
    command: 'show_my_companions',
    description: 'Показать моих попутчиков',
  },
  {
    command: 'show_my_companions_as_passenger',
    description: 'Показать мои попутчиков',
  },
  {
    command: 'show_my_taxi',
    description: 'Показать мои активные запросы такси',
  },
  { command: 'ride_in_a_taxi', description: 'Подбросить на такси' },
  { command: 'close_taxi_request', description: 'Закрыть запрос на такси' },
];

export { commands };
