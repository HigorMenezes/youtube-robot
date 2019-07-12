const routes = app => {
  app.get('/', (req, res) =>
    res.send({
      code: 200,
      message: 'ok',
      content: { message: 'server is running' },
    }),
  );
};

module.exports = routes;
