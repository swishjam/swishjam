// Scoring Curves from https://github.com/paulirish/lh-scorecalc/blob/master/script/metrics.js
//Mobile Speed Index only for synethic  SI: {weight: 0.10, median: 5800, p10: 3387},
//Mobile Total blocking time for Snythetics TBT: {weight: 0.30, median: 600,  p10: 200},
//Desktop SI: {weight: 0.10, median: 2300, p10: 1311},
//desktop TBT: {weight: 0.30, median: 350, p10: 150},

const scoringCurves = {
  mobile: {
    FCP: {weight: 0.15, median: 3_000, p10: 1_800, displayUnits: 's' },
    LCP: {weight: 0.35, median: 4_000, p10: 2_500, displayUnits: 's' },
    CLS: {weight: 0.25, median: 0.25, p10: 0.1, displayUnits: null },
    FID: {weight: 0.25, median: 300, p10: 100, displayUnits: 's' },
    INP: {weight: 0, median: 500, p10: 200, displayUnits: 's' },
    TTFB: {weight: 0, median: 1_800, p10: 800, displayUnits: 's' },
  },
  desktop: {
    FCP: {weight: 0.15, median: 1_600, p10: 934, displayUnits: 's' },
    LCP: {weight: 0.35, median: 2_400, p10: 1_200, displayUnits: 's' },
    CLS: {weight: 0.25, median: 0.25, p10: 0.1, displayUnits: null },
    FID: {weight: 0.25, median: 280, p10: 60, displayUnits: 's' },
    INP: {weight: 0, median: 500, p10: 200, displayUnits: 's' },
    TTFB: {weight: 0, median: 1_800, p10: 800, displayUnits: 's' },
  }
}

export const calcCwvPercent = (val, good, medium) => {
  const smallestGap = Math.min(good, medium - good);   
  const total = medium + smallestGap;

  return {
   percent: Math.min(val/total * 100, 99),
   bounds: [ (good/total*100), ((medium-good)/total*100), (smallestGap/total*100) ]
  }
}

export const cwvMetricBounds = {
  FCP: { good: 1_800, medium: 3_000 },
  LCP: { good: 2_500, medium: 4_000, },
  CLS: { good: 0.1, medium: 0.25 },
  FID: { good: 100, medium: 300 },
  TTFB: { good: 800, medium: 1_800 },
  INP: { good: 200, medium: 500 }
};

function calculateRating(score) {
	const RATINGS = {
		PASS: {label: 'pass', minScore: 90},
		AVERAGE: {label: 'average', minScore: 50},
		FAIL: {label: 'fail'},
	};

  let rating = RATINGS.FAIL.label;
  if (score >= RATINGS.PASS.minScore) {
    rating = RATINGS.PASS.label;
  } else if (score >= RATINGS.AVERAGE.minScore) {
    rating = RATINGS.AVERAGE.label;
  }
  return rating;
}

function internalErfInv_(x) {
  // erfinv(-x) = -erfinv(x);
  var sign = x < 0 ? -1 : 1;
  var a = 0.147;

  var log1x = Math.log(1 - x*x);
  var p1 = 2 / (Math.PI * a) + log1x / 2;
  var sqrtP1Log = Math.sqrt(p1 * p1 - (log1x / a));
  return sign * Math.sqrt(sqrtP1Log - p1);
}

function internalErf_(x) {
  // erf(-x) = -erf(x);
  var sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  var a1 = 0.254829592;
  var a2 = -0.284496736;
  var a3 = 1.421413741;
  var a4 = -1.453152027;
  var a5 = 1.061405429;
  var p = 0.3275911;
  var t = 1 / (1 + p * x);
  var y = t * (a1 + t * (a2 + t * (a3 + t * (a4 + t * a5))));
  return sign * (1 - y * Math.exp(-x * x));
}

function derivePodrFromP10(median, p10) {
  // Borrowed from LH ScoreCalc by Paul Irish & Co 
  const u = Math.log(median);
  const shape = Math.abs(Math.log(p10) - u) / (Math.SQRT2 * 0.9061938024368232);
  const inner1 = -3 * shape - Math.sqrt(4 + shape * shape);
  const podr = Math.exp(u + shape/2 * inner1)
  return podr;
}

function QUANTILE_AT_VALUE({median, podr, p10}, value) {
  // Borrowed from LH ScoreCalc by Paul Irish & Co 
  if (!podr) {
    podr = derivePodrFromP10(median, p10);
  }

  var location = Math.log(median);
  // The "podr" value specified the location of the smaller of the positive
  // roots of the third derivative of the log-normal CDF. Calculate the shape
  // parameter in terms of that value and the median.
  // See https://www.desmos.com/calculator/2t1ugwykrl
  var logRatio = Math.log(podr / median);
  var shape = Math.sqrt(1 - 3 * logRatio - Math.sqrt((logRatio - 3) * (logRatio - 3) - 8)) / 2;

  var standardizedX = (Math.log(value) - location) / (Math.SQRT2 * shape);
  return (1 - internalErf_(standardizedX)) / 2;
}

function VALUE_AT_QUANTILE({median, podr, p10}, quantile) {
  if (!podr) {
    podr = derivePodrFromP10(median, p10);
  }
  var location = Math.log(median);
  var logRatio = Math.log(podr / median);
  var shape = Math.sqrt(1 - 3 * logRatio - Math.sqrt((logRatio - 3) * (logRatio - 3) - 8)) / 2;
  return Math.exp(location + shape * Math.SQRT2 * internalErfInv_(1 - 2 * quantile));
}

function determineMinMax(metricScoring) {
  const valueAtScore100 = VALUE_AT_QUANTILE(metricScoring, 0.995);
  const valueAtScore5 = VALUE_AT_QUANTILE(metricScoring, 0.05);

  let min = Math.floor(valueAtScore100 / 1000) * 1000;
  let max = Math.ceil(valueAtScore5 / 1000) * 1000;
  let step = 10;

  // Special handling for CLS
  if (metricScoring.units === 'unitless') {
    min = 0;
    max = Math.ceil(valueAtScore5 * 100) / 100;
    step = 0.01;
  }

  return {
    min,
    max,
    step,
  };
}

export const calcCwvMetric = (value, key, curve = 'desktop') => {
  
  // curve potentionally can be 'mobile' or 'desktop' 
  const scoring = scoringCurves[curve];
  const metricScoring = scoring[key];
  // Protects against crazy values
  const { min, max, step } = determineMinMax(metricScoring);
  const computedValue = Math.ceil(QUANTILE_AT_VALUE(metricScoring, value) * 100)
  const score = Math.max(Math.min(computedValue, max), min);

  return {
    key,
    metricScoring,
    rating: calculateRating(score),
    value: value,
    score: score,
    weightedScore: score*metricScoring.weight
  };
}