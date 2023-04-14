import { formattedMsOrSeconds } from "@/lib/utils"
import { AreaChart } from "@tremor/react";

const filledInFilmstrip = filmstrip => {
  const filmstripObject = {};
  filmstrip.forEach(({ time, image, VisuallyComplete }) => filmstripObject[parseFloat(time)] = { image, VisuallyComplete } );
  
  const sortedFilmstripTimestamps = Object.keys(filmstripObject).map(ts => parseFloat(ts)).sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
  const maxTs = sortedFilmstripTimestamps[sortedFilmstripTimestamps.length - 1];
  for (let i = 0; i <= maxTs; i += 500) {
    if (!filmstripObject[i]) {
      const closestTs = sortedFilmstripTimestamps.find((ts, j) => i >= ts && i < sortedFilmstripTimestamps[j + 1]);
      filmstripObject[i] = filmstripObject[closestTs];
    }
  }
  return filmstripObject;
}

export default function FilmstripSection({ filmstrip }) {
  const formattedFilmstrip = filledInFilmstrip(filmstrip);

  return (
    <>
      <div className='max-w-full overflow-x-scroll whitespace-nowrap'>
        {Object.keys(formattedFilmstrip).map(ts => (
          <>
            <div className='text-center w-1/5 inline-block m-1' key={ts}>
              <span className='block text-sm text-gray-900'>{formattedMsOrSeconds(ts)}</span>
              <div className='h-42 border border-gray-200 w-full'>
                <img src={formattedFilmstrip[ts].image} className='w-full h-full' />
              </div>
              <span className='block text-sm text-gray-900' >{formattedFilmstrip[ts].VisuallyComplete}% visually complete</span>
            </div>
          </>
        ))}
      </div>
      <div className='mt-4'>
        <AreaChart
          data={filmstrip.map(({ time, VisuallyComplete }) => ({ ts: formattedMsOrSeconds(time), visualCompleteness: VisuallyComplete }))}
          dataKey="ts"
          categories={['visualCompleteness']}
          showLegend={true}
          startEndOnly={false}
          valueFormatter={val => `${val}%`}
          height="h-72"
          marginTop="mt-10"
        />
      </div>
    </>
  )
}