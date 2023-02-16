const { constructDataForSqs, sendMessage } = require('./utils/sqs');

module.exports.lambdaHandler = async (event, _context) => {
  let response;
  try {
    const params = constructDataForSqs(event.body, { queueUrl: process.env.SQS_URL })
    const sqsResponse = await sendMessage(params);
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Sucessfully added data to sqs',
        response: sqsResponse.response
      })
    }
  } catch (err) {
    console.log(err);
    response = {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Unable to add data to SQS queue',
        error: err
      })
    }
    return err;
  }

  return response
};
