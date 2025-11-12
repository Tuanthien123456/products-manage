const productApi = require('./products.api_router');
const categoryApi = require('./category.api_router');
const userApi = require('./user.api_router');
module.exports= (app) => {
  app.use('/api/products', productApi);
  app.use('/api/categories', categoryApi);
  app.use('/api/user', userApi);
};