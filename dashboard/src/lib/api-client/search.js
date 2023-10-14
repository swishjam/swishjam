import Base from "./base"

export class Search extends Base {
  static async search(q) {
    return await this._get('/api/v1/search', { q })
  }
}

Object.assign(Search, Base)
export default Search;