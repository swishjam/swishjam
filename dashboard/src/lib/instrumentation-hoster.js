import { S3, CloudFront } from 'aws-sdk';
import fs from 'fs';
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

export class InstrumentationHoster {
  constructor({ projectKey, reportingUrl = 'https://api.swishjam.com/events', sampleRate = 1.0 }) {
    if (!projectKey) throw new Error('projectKey is required');
    this.projectKey = projectKey;
    this.reportingUrl = reportingUrl;
    this.sampleRate = sampleRate;

    this.initialDirectory = `${process.cwd()}/swishjam-instrumentation-template`;
    this.localDesintationDir = `${process.cwd()}/swishjam-instrumentation-template/${this.projectKey}`;
    this.localDesintationFilename = 'swishjam-instrumentation.js';
    this.s3Filename = 'instrumentation.js';
  }

  async hostInstrumentation() {
    this._writeProjectSpecificContentToFile();
    await this._uploadInstrumentationToS3();
    await this._purgeCloudfrontCache();
    fs.rmdirSync(this.localDesintationDir, { recursive: true });
    return `https://${process.env.NEXT_PUBLIC_JS_CDN_HOST_NAME}/${this.projectKey}/instrumentation.js`;
  }

  async _purgeCloudfrontCache() {
    const cloudfront = new CloudFront();
    const params = {
      DistributionId: process.env.JS_CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: `${Date.now()}-${this.projectKey}`,
        Paths: {
          Quantity: 1,
          Items: [
            `/${this.projectKey}/${this.s3Filename}`
          ]
        }
      }
    };
    await cloudfront.createInvalidation(params, (err, data) => {
      if (err) {
        console.error(err);
        throw new Error(err);
      } else {
        console.log(data);
      }
    }).promise();
  }

  async _uploadInstrumentationToS3() {
    const s3 = new S3();
    const params = {
      Bucket: process.env.JS_S3_BUCKET_NAME,
      Key: `${this.projectKey}/${this.s3Filename}`,
      Body: fs.readFileSync(`${this.localDesintationDir}/${this.localDesintationFilename}`, 'utf8'),
      ContentType: 'application/javascript',
      ACL: 'public-read'
    }
    await s3.putObject(params, (err, data) => {
      if (err) {
        console.error(err);
        throw new Error(err);
      } else {
        console.log(data);
      }
    }).promise();
  }

  _writeProjectSpecificContentToFile() {
    if (!fs.existsSync(this.localDesintationDir)) fs.mkdirSync(this.localDesintationDir);
    const templateContent = fs.readFileSync(`${this.initialDirectory}/template.js`, 'utf8');
    const projectSpecificJsContent = templateContent.replace(/{{SWISHJAM_REPLACE_PUBLIC_API_KEY}}/g, this.projectKey)
                                                      .replace(/{{SWISHJAM_REPLACE_REPORTING_URL}}/g, this.reportingUrl)
                                                      .replace(/"{{SWISHJAM_REPLACE_SAMPLE_RATE}}"/g, parseFloat(this.sampleRate));
    fs.writeFileSync(`${this.localDesintationDir}/${this.localDesintationFilename}`, projectSpecificJsContent);
  }
}