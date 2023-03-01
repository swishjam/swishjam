export const GetData = async (data) => {
  try {
    const queryParams = new URLSearchParams(data); 
    return await (await fetch(`/api/cwv/average?${queryParams}`, {})).json()
  } catch(e) {
    console.log(e.message)
  }
}

export const GetTimeSeriesData = async data => {
  try {
    const queryParams = new URLSearchParams(data);
    return await (await fetch(`/api/cwv/timeseries?${queryParams}`, {})).json();
  } catch (e) {
    console.error(e.message)
  }
}