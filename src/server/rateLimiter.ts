import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
   windowMs: 30 * 1000,
   max: 150,
   legacyHeaders: false,
   standardHeaders: 'draft-7',
   handler: function (req, res, next) {
      if (req.method == 'POST') return res.status(429).json({ error: 'You are being rate limited.' });
      next();
   },
});
export default rateLimiter;
