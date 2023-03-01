export const GetData = async (data) => {
  try {
    const queryParams = new URLSearchParams(data); 
    return await (await fetch(`/api/cwv/average?${queryParams}`, {})).json()
  } catch(e) {
    console.log(e.message)
  }
}

export const GetTimeSeriesData = async params => {
  try {
    const queryParams = new URLSearchParams(params);
    const data = await (await fetch(`/api/cwv/timeseries?${queryParams}`, {})).json();
    const formatted = data.results.map(result => {
      return {
        timestamp: `${new Date(result.hour).getMonth() + 1}/${new Date(result.hour).getDate()} ${new Date(result.hour).getHours()}:00`,
        Good: parseFloat(result.percent_good_records),
        "Needs Improvement": parseFloat(result.percent_medium_records),
        Poor: parseFloat(result.percent_bad_records)
      }
    });
    return formatted;
  } catch (e) {
    console.error(e.message)
  }
}