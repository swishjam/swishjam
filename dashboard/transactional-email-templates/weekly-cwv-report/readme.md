### Weekly Core Web Vitals Report Email Template

#### Example JSON for email
```
{
  siteUrl: 'swishjam.com',
  status: 'Passed',
  statusImg: 'https://swishjam.com/passed.png', 
  lcp: '<span style="color:green;font-size:1.5em;font-weight:bold;">2.61s</span>',
  lcpChange: '<p style="font-size:1.25em;"><span style="color:red;">+10%</span> slower than last week</p>',
  cls: '<span style="color:green;font-size:1.5em;font-weight:bold;">2.62s</span>',
  clsChange: '<p style="font-size:1.25em;"><span style="color:red;">+11%</span> slower than last week</p>',
  inp: '<span style="color:green;font-size:1.5em;font-weight:bold;">2.63s</span>',
  inpChange: '<p style="font-size:1.25em;"><span style="color:red;">+12%</span> slower than last week</p>',
  fcp: '<span style="color:green;font-size:1.5em;font-weight:bold;">2.64s</span>',
  fcpChange: '<p style="font-size:1.25em;"><span style="color:red;">+13%</span> slower than last week</p>',
  ttfb: '<span style="color:green;font-size:1.5em;font-weight:bold;">2.65s</span>',
  ttfbChange: '<p style="font-size:1.25em;"><span style="color:red;">+14%</span> slower than last week</p>',
  fid: '<span style="color:green;font-size:1.5em;font-weight:bold;">2.66s</span>',
  fidChange: '<p style="font-size:1.25em;"><span style="color:red;">+15%</span> slower than last week</p>',
}
```

#### Variables
- siteUrl
  - the website's URL
  - Example: swishjam.com

- status
  - potential values: 'Passed', 'Needs Improvement', 'Failing'

- statusImg
  - One of the following 
  - Passed: https://swishjam.com/passed.png 
  - Needs Improvement:  https://swishjam.com/needs-improvement.png 
  - Failing: https://swishjam.com/failing.png 

- lcp
  - The score for the current LCP average for the week
  - format: `<span style="color:green;font-size:1.5em;font-weight:bold;">2.68s</span>`
- lcpChange
  - The score for the current LCP change WoW 
  - format: `<span style="color:red;">+10%</span> slower than last week`

- cls 
  - The score for the current CLS average for the week
  - format: 900ms — 2.83s
- clsChange
  - The score for the current CLS change WoW 
  - format: 900ms — 2.83s

- inp 
  - The score for the current INP average for the week
  - format: 900ms — 2.83s
- inpChange
  - The score for the current INP change WoW 
  - format: 900ms — 2.83s

- fcp
  - The score for the current FCP average for the week
  - format: 900ms — 2.83s
- fcpChange
  - The score for the current FCP change WoW 
  - format: 900ms — 2.83s

- fid 
  - The score for the current FID average for the week
  - format: 900ms — 2.83s
- fidChange
  - The score for the current FID change WoW 
  - format: 900ms — 2.83s

- ttfb
  - The score for the current TTFB average for the week
  - format: 900ms — 2.83s
- ttfbChange
  - The score for the current TTFB change WoW 
  - format: 900ms — 2.83s