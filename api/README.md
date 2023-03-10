# Site Performance API Handler 

This project contains source code and supporting files for a serverless application that handles performance data from the instrumentation component. 

## Technology Used & Required (Currently)
- Amazon AWS Account
- Amazon API Gateway
- Amazon SQS
- Amazon Lambda Functions

The application uses several AWS resources, including Lambda functions and an API Gateway API. These resources are defined in the `template.yaml` file in this project. You can update the template to add AWS resources through the same deployment process that updates your application code.

## Deploy the sample application

The Serverless Application Model Command Line Interface (SAM CLI) is an extension of the AWS CLI that adds functionality for building and testing Lambda applications. It uses Docker to run your functions in an Amazon Linux environment that matches Lambda. It can also emulate your application's build environment and API.

To use the SAM CLI, you need the following tools.

<!-- * Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community) -->
* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

You may need the following for local testing.

* Node.js - [Install Node.js 16](https://nodejs.org/en/), including the NPM package management tool.

To build and deploy your application for the first time, run the following in your shell:

```bash
sam build
sam deploy --guided --capabilities 'CAPABILITY_NAMED_IAM'
```

The first command will build a docker image from a Dockerfile and then the source of your application inside the Docker image. The second command will package and deploy your application to AWS, with a series of prompts:

* **Stack Name**: The name of the stack to deploy to CloudFormation. This should be unique to your account and region, and a good starting point would be something matching your project name. The default value is `swishjam-ingestion`.
* **AWS Region**: The AWS region you want to deploy your app to. The default value is `us-east-1`.
* **Confirm changes before deploy**: If set to yes, any change sets will be shown to you before execution for manual review. If set to no, the AWS SAM CLI will automatically deploy application changes.
* **Parameter DatabaseName**: The name of your Postgres database performance data should be written to.
* **Parameter DatabaseUsername**: The username to access your Postgres database.
* **Parameter DatabasePassword**: The password to access your Postgres database.
* **Parameter DatabaseHostname**: The hostname (URL) to access your Postgres database.
* **Parameter DatabasePort**: The port your Postgres database is accessible at. Default is `5432`.
* **Parameter RestApiName**: The name to create/update your AWS API Gateway under. The default is `swishjam-event-data-endpoint`.
* **Parameter SqsQueueName**: The name to create/update your AWS SQS Queue under. The default is `swishjam-event-data-message-queue`.
* **Parameter EventConsumerLambdaFunctionName**: The name to create/update your AWS Lambda function under. The default is `swishjam-event-data-sqs-message-consumer`.
* **Allow SAM CLI IAM role creation**: Many AWS SAM templates, including this example, create AWS IAM roles required for the AWS Lambda function(s) included to access AWS services. By default, these are scoped down to minimum required permissions. To deploy an AWS CloudFormation stack which creates or modifies IAM roles, the `CAPABILITY_IAM` value for `capabilities` must be provided. If permission isn't provided through this prompt, to deploy this example you must explicitly pass `--capabilities CAPABILITY_IAM` to the `sam deploy` command.
* **Save arguments to samconfig.toml**: If set to yes, your choices will be saved to a configuration file inside the project, so that in the future you can just re-run `sam deploy` without parameters to deploy changes to your application.

You can find your API Gateway Endpoint URL in the output values displayed after deployment.

## Use the SAM CLI to build and test locally

Build your application with the `sam build` command.

```bash
sam build
```

The SAM CLI builds a docker image from a Dockerfile and then installs dependencies defined in `hello-world/package.json` inside the docker image. The processed template file is saved in the `.aws-sam/build` folder.
* **Note**: The Dockerfile included in this sample application uses `npm install` by default. If you are building your code for production, you can modify it to use `npm ci` instead.

Test a single function by invoking it directly with a test event. An event is a JSON document that represents the input that the function receives from the event source. Test events are included in the `events` folder in this project.

Run functions locally and invoke them with the `sam local invoke` command.

```bash
sam local invoke EventDataMessageConsumer --event events/event.json
```

The SAM CLI can also emulate your application's API. Use the `sam local start-api` to run the API locally on port 3000.

```bash
sam local start-api
curl http://localhost:3000/
```

The SAM CLI reads the application template to determine the API's routes and the functions that they invoke. The `Events` property on each function's definition includes the route and method for each path.

```yaml
      Events:
        HelloWorld:
          Type: Api
          Properties:
            Path: /hello
            Method: get
```

## Add a resource to your application
The application template uses AWS Serverless Application Model (AWS SAM) to define application resources. AWS SAM is an extension of AWS CloudFormation with a simpler syntax for configuring common serverless application resources such as functions, triggers, and APIs. For resources not included in [the SAM specification](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md), you can use standard [AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html) resource types.

## Fetch, tail, and filter Lambda function logs

To simplify troubleshooting, SAM CLI has a command called `sam logs`. `sam logs` lets you fetch logs generated by your deployed Lambda function from the command line. In addition to printing the logs on the terminal, this command has several nifty features to help you quickly find the bug.

`NOTE`: This command works for all AWS Lambda functions; not just the ones you deploy using SAM.

```bash
performance-instrumentation-api$ sam logs -n HelloWorldFunction --stack-name performance-instrumentation-api --tail
```

You can find more information and examples about filtering Lambda function logs in the [SAM CLI Documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-logging.html).

## Unit tests

Tests are defined in the `hello-world/tests` folder in this project. Use NPM to install the [Mocha test framework](https://mochajs.org/) and run unit tests from your local machine.

```bash
cd api
npm install
npm run test
```
