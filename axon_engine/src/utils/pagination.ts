interface PaginationDefaults {
  maxLimit?: number;
  defaultLimit?: number;
}

interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  count?: string | number;
}

function parsePagination(query: PaginationQuery = {}, defaults: PaginationDefaults = {}) {
  const maxLimit = defaults.maxLimit || 100;
  const defaultLimit = defaults.defaultLimit || 20;

  let page = parseInt(String(query.page), 10);
  // Accept both `limit` (Express) and `count` (Laravel/CMS) query params.
  const rawLimit = query.limit ?? query.count;
  let limit = parseInt(String(rawLimit), 10);

  if (Number.isNaN(page) || page < 1) page = 1;
  if (Number.isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

function paginatedResponse<T>(data: T, total: number, page: number, limit: number) {
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

export { parsePagination, paginatedResponse };
