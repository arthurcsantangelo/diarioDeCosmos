const {
  getApod,
  getRecentApods: getRecentApodsFromService
} = require('../services/nasaApodService');

const EARLIEST_APOD_DATE = '1995-06-16';

function isCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

async function getApodForDate(request, response) {
  const { date } = request.query;

  if (date !== undefined) {
    const today = new Date().toISOString().slice(0, 10);

    if (
      typeof date !== 'string' ||
      !isCalendarDate(date) ||
      date < EARLIEST_APOD_DATE ||
      date > today
    ) {
      const error = new Error(`Informe uma data válida entre ${EARLIEST_APOD_DATE} e hoje.`);
      error.statusCode = 400;
      throw error;
    }
  }

  const apod = await getApod(date);
  response.json(apod);
}

async function getRecentApods(request, response) {
  const apods = await getRecentApodsFromService();
  response.json(apods);
}

module.exports = { getApodForDate, getRecentApods };
