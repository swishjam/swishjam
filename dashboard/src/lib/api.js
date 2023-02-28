export const GetData = async (data) => {
  try {
    const queryParams = new URLSearchParams(data); 
    let res = await (await fetch(`/api/cwv/average?${queryParams}`, {})).json()
    console.log(res)
    return res
  } catch(e) {
    console.log(e.message)
  }
}