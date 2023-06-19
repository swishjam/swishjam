import WebPageTestCapturer from '@/lib/web-page-test/web-page-test-capturer';

export default async (req, res) => {
  const start = Date.now();
  const { success, error, testId } = await WebPageTestCapturer.capture(req.query.id);

  if (success) {
    console.log(`Successfully captured lab test result for ${testId}.`);
    return res.status(200).json({ message: `Updated lab test ${testId} in ${(Date.now() - start) / 1_000} seconds.` });
  } else {
    console.error('Cannot capture lab test result.')
    console.error(error);
    return res.status(500).json({ error });
  }
}