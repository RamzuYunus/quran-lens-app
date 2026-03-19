import { Router, type IRouter } from "express";
import healthRouter from "./health";
import quranRouter from "./quran";
import lensesRouter from "./lenses";
import translationsRouter from "./translations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(quranRouter);
router.use(lensesRouter);
router.use(translationsRouter);

export default router;
