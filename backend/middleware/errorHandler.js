const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

const errorHandler = (err, req, res, next) => {
  console.error(err.message);
  const isInvalidJson = err.type === 'entity.parse.failed';

  res.status(err.statusCode || 500).json({
    success: false,
    message: isInvalidJson
      ? 'Please send valid report data.'
      : err.statusCode
        ? err.message
        : 'Something went wrong on the server.'
  });
};

export { notFound, errorHandler };