export const GetData = async (data) => {
  try {
    const queryParams = new URLSearchParams(data); 
    let res = await (await fetch(`/api/cwv/average?${queryParams}`, {})).json()
    return res
  } catch(e) {
    console.log(e.message)
  }
}