import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import uploadRoutes  from '../modules/upload/upload.routes.js';
import mediaRoutes  from '../modules/media/media.routes.js';
import recipesRoutes from '../modules/recipes/recipe.routes.js';
import userRoutes from '../modules/user/user.routes.js';
import deviceRoutes from '../modules/device/device.routes.js';

const api = Router();

api.get('/health', (req, res) => {
  res.json({ ok: true, requestId: req.id, now: new Date().toISOString() });
});

api.use('/auth',authRoutes);
api.use('/upload',uploadRoutes);
api.use('/media',mediaRoutes);
api.use('/recipes', recipesRoutes);
api.use('/user', userRoutes);
api.use('/devices', deviceRoutes);

export default api;
