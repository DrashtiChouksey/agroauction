const getDateRange = (from, to) => {
  const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = to ? new Date(to) : new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const getGroupByPeriod = (period = 'day') => {
  switch (period) {
    case 'week':
      return { $isoWeek: '$createdAt' };
    case 'month':
      return { $month: '$createdAt' };
    case 'year':
      return { $year: '$createdAt' };
    default:
      return { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  }
};

const getDateGroupFormat = (period = 'day') => {
  switch (period) {
    case 'week':
      return {
        year: { $year: '$createdAt' },
        week: { $isoWeek: '$createdAt' },
      };
    case 'month':
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      };
    default:
      return {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      };
  }
};

const getDaysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};

const minutesBetween = (date1, date2) => {
  return Math.abs(new Date(date1) - new Date(date2)) / 60000;
};

module.exports = { getDateRange, getGroupByPeriod, getDateGroupFormat, getDaysAgo, formatDate, minutesBetween };
