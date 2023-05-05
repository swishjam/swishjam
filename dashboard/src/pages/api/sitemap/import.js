import { Validator } from '@/lib/queryValidator';
import { SitemapParser } from '@/lib/sitemap-parser';

const MAXIMUM_SITEMAP_IMPORT_URL_ENTRIES = parseInt(process.env.MAXIMUM_SITEMAP_IMPORT_URL_ENTRIES || 1_000);

export default async (req, res) => {
  const { projectKey, url, sitemapUrl } = req.query;
  return Validator.runQueryIfUserHasAccess({ req, res, projectKey }, async ({ supabaseClient, currentProject }) => {
    try {

      const rootURL = await getRootURL(url);
      const parser = new SitemapParser({ url, sitemapUrl });
      const urls = await parser.parse();
      urls.splice(MAXIMUM_SITEMAP_IMPORT_URL_ENTRIES);
      const formattedProjectPageUrls = ([rootURL, ...urls]).map(url => ({ 
        project_id: currentProject.id, 
        url_uniqueness_key: `${currentProject.id}-${url}`,
        full_url: url,
        url_host: new URL(url).hostname,
        url_path: new URL(url).pathname,
        lab_test_cadence: null,
        lab_tests_enabled: false
      }));
      const resp = await supabaseClient.from('project_page_urls').upsert(formattedProjectPageUrls, { ignoreDuplicates: true, onConflict: 'url_uniqueness_key' });
      if (resp.error) {
        console.error('Failed to import sitemap');
        console.error(resp.error);
        return res.status(500).json({ error: `Unable to capture URLs from ${url}` });
      } else {
        return res.status(200).json({ success: true, numCreated: urls.length, numFound: urls.length });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
};

const getRootURL = async url => {
  const formattedURL = decodeURIComponent(url).startsWith('http') ? decodeURIComponent(url) : `https://${decodeURIComponent(url)}`;
  const parsedURL = new URL(formattedURL);
  const resp = await fetch(`https://${parsedURL.hostname}`);
  return resp.url;
}