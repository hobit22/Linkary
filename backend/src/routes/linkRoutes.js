import express from 'express';
import {
  getLinks,
  getLink,
  createLink,
  updateLink,
  deleteLink,
  getGraphData,
} from '../controllers/linkController.js';

const router = express.Router();

// Graph data route (must be before /:id route)
router.get('/graph', getGraphData);

// CRUD routes
router.route('/')
  .get(getLinks)
  .post(createLink);

router.route('/:id')
  .get(getLink)
  .put(updateLink)
  .delete(deleteLink);

export default router;
