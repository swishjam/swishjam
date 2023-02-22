const AWS = require("aws-sdk");
const S3 = new AWS.S3();
const lambda = new AWS.Lambda();

module.exports.uploadToS3AndInvokeFunction = async (request, _context) => {
  const payload = JSON.parse(request.isBase64Encoded ? Buffer.from(request.body, 'base64').toString('utf-8') : request.body);
  console.log(JSON.stringify(payload));
  if (!process.env.EVENT_CONSUMER_LAMBDA_FUNCTION_NAME) throw new Error("EVENT_CONSUMER_LAMBDA_FUNCTION_NAME ENV is not set");
  if (!process.env.S3_BUCKET_NAME) throw new Error("S3_BUCKET ENV is not set");
  if (!payload.siteId) throw new Error("siteId is not provided in payload");

  const Key = `${payload.siteId}/${Date.now()}-${parseInt(Math.random() * 1_000_000_000)}.json`;
  const Bucket = process.env.S3_BUCKET_NAME;

  console.log(`Uploading data to S3: ${Bucket}/${Key}`);
  await S3.putObject({ Bucket, Key, Body: JSON.stringify(payload), ContentType: 'application/json; charset=utf-8' }).promise();

  const resp = await lambda.invoke({
    FunctionName: process.env.EVENT_CONSUMER_LAMBDA_FUNCTION_NAME,
    InvocationType: 'Event',
    Payload: JSON.stringify({ s3Bucket: Bucket, s3Key: Key })
  }).promise();

  return { statusCode: 200, req: resp };
}