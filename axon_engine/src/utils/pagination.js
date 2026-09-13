function parsePagination(query = {}, defaults = {}) {
  const maxLimit = defaults.maxLimit || 100;
  const defaultLimit = defaults.defaultLimit || 20;

  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (Number.isNaN(page) || page < 1) page = 1;
  if (Number.isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

function paginatedResponse(data, total, page, limit) {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    },
  };
}

module.exports = { parsePagination, paginatedResponse };
