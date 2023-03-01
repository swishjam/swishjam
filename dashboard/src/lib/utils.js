export const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const fetcher = (url) => fetch(url).then((res) => res.json());

export const msToSeconds = (ms) => (ms / 1000).toFixed(2);

export const calcCwvPercent = (val, good, medium) => {
  const smallestGap = Math.min(good, medium-good);   
  const total = medium + smallestGap;

  return {
   percent: val/total * 100,
   bounds: [ (good/total*100), ((medium-good)/total*100), (smallestGap/total*100) ]
  }
}

export const cwvMetricBounds = {
  FCP: {
    good: 1_800,
    medium: 3_000,
  },
  LCP: {
    good: 2_500,
    medium: 4_000
  },
  CLS: {
    good: 0.1,
    medium: 0.25
  },
  FID: {
    good: 100,
    medium: 300
  },
  TTFB: {
    good: 800,
    medium: 1_800
  },
  INP: {
    good: 200,
    medium: 500
  }
};