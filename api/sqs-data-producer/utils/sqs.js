const AWS = require('aws-sdk');
const sqs = new AWS.SQS({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  apiVersion: process.env.AWS_SQS_API_VERSION,
  region: process.env.REGION
});

module.exports.constructDataForSqs = (body, options = {}) => {

  if (!options.queueUrl) {
    throw new Error('QueueUrl not given');
  }
  if (!body) {
    throw new Error('body not given');
  }

  let MessageAttributes = {};
  if (options.messageAttributes) {
    for (const key of Object.keys(options.messageAttributes)) {
      MessageAttributes[key] = {
        DataType: options.messageAttributes[key].dataType,
        StringValue: options.messageAttributes[key].stringValue
      }
    }
  }
  const params = {
    MessageAttributes,
    MessageBody: JSON.stringify(body),
    QueueUrl: options.queueUrl
  };
  return params;
}

module.exports.sendMessage = async params => {
  try {
    const data = await sqs.sendMessage(params).promise();
    console.log("Success", data.MessageId);
    return { success: true, response: data }
  } catch (err) {
    console.log('Error in sqs-util sendMessage', err);
    throw err;
  }
}