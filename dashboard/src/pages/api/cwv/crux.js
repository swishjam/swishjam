import { Validator } from '@/lib/queryValidator';
import WebVitalsData from '@/lib/data/webVitals';

export default async (req, res) => {
  const { url, formFactor } = req.query;

  const body = {
    url,
    formFactor,
    metrics: [
      "first_contentful_paint",
      "first_input_delay",
      "largest_contentful_paint",
      "cumulative_layout_shift",
      "experimental_time_to_first_byte",
      "experimental_interaction_to_next_paint"
    ]
  }

  const data = await fetch("https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord?key=" + process.env.CRUX_API_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  res.status(200).json(await data.json());
};