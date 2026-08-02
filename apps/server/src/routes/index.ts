import { Router } from 'express';
import { aiPracticeRouter } from './aiPractice.js';
import { sgBuddyRouter } from './sgBuddy.js';

export const apiRouter = Router();

apiRouter.use('/ai-practice', aiPracticeRouter);
apiRouter.use('/sg-buddy', sgBuddyRouter);

// Next integration? Add a router file under routes/ and mount it here, e.g.:
// apiRouter.use('/some-other-integration', someOtherRouter);
