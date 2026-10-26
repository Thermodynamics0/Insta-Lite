const parsePagination = (query) => {
  const { page, limit } = query;

  const isValidPositiveInteger = (val) => {
    return typeof val === "string" && /^\d+$/.test(val) && Number(val) > 0;
  };

  if (
    (page !== undefined && !isValidPositiveInteger(page)) ||
    (limit !== undefined && !isValidPositiveInteger(limit))
  ) {
    return {
      error: "page and limit must be positive integers",
    };
  }

  const pageNum = page !== undefined ? Number(page) : 1;
  const limitNum = limit !== undefined ? Math.min(Number(limit), 50) : 10;
  const skip = (pageNum - 1) * limitNum;
  const take = limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
    take,
  };
};

const formatPaginationMeta = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
};

module.exports = {
  parsePagination,
  formatPaginationMeta,
};
