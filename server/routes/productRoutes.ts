import { Router } from 'express';
import { getProducts, createProduct, getProductById, updateProduct, deleteProduct } from '../controllers/productController';

const productRouter = Router();

productRouter.route('/')
  .get(getProducts)
  .post(createProduct);

// FIX: Add the route for fetching a single product by its ID
productRouter.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);


export default productRouter;