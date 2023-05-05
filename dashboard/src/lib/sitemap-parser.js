import { XMLParser } from "fast-xml-parser";
const parser = new XMLParser();

export class SitemapParser {
  constructor({ url, sitemapUrl }) {
    this.url = url;
    this.sitemapUrl = sitemapUrl;
    this.urls = [];
  }

  async parse(url) {
    const { urls, sitemaps } = await this._parseSitemap(url || this._derivedSitemapURL());
    this.urls = [...this.urls, ...urls];
    await Promise.all(sitemaps.map(sitemapURL => this.parse(sitemapURL)));
    return this.urls;
  }

  async _parseSitemap(sitemapURL) {
    const response = await fetch(sitemapURL);
    const xml = parser.parse(await response.text());
    return {
      urls: this._getURLsFromSitemapXML(xml),
      sitemaps: this._getSitemapURLsFromSitemapXML(xml)
    }
  }

  _derivedSitemapURL() {
    return decodeURIComponent(
      this.sitemapUrl ||
      `https://${new URL(decodeURIComponent(this.url.startsWith('http') ? this.url : `https://${this.url}`)).hostname}/sitemap.xml`
    );
  }

  _getURLsFromSitemapXML(sitemapXML) {
    if (sitemapXML.urlset?.url) {
      if (Array.isArray(sitemapXML.urlset.url)) {
        return sitemapXML.urlset.url.map(url => url.loc);
      } else {
        return sitemapXML.urlset.url.loc;
      }
    } else {
      return []
    }
  }

  _getSitemapURLsFromSitemapXML(sitemapXML) {
    return (sitemapXML.sitemapindex?.sitemap || []).map(sitemap => sitemap.loc);
  }
}