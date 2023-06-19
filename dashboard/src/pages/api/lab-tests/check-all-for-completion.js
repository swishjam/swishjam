import db from '@lib/db';
import WebPageTestCapturer from '@/lib/web-page-test/web-page-test-capturer';
const MAX_NUM_TESTS_TO_FETCH = parseInt(process.env.MAX_NUM_WPT_TO_UPDATE_PER_JOB || 100);

export default async (_req, res) => {
  const { rows: pendingLabTests } = await db.query(`
    SELECT uuid
    FROM synthetic_runs
    WHERE completed_at IS NULL
    ORDER BY created_at ASC
    LIMIT ${MAX_NUM_TESTS_TO_FETCH}
  `);

  const pendingLabTestIds = pendingLabTests.map(({ uuid }) => uuid);
  const dbResults = await Promise.all(pendingLabTestIds.map(WebPageTestCapturer.capture));
  
  const results = {
    numberOfPendingLabTests: pendingLabTestIds.length,
    numberOfDbAttempts: dbResults.length,
    numberOfDbAttemptsThatFailed: dbResults.filter(({ success }) => !success).length,
  };

  console.log(results);
  return res.status(200).json(results);
}