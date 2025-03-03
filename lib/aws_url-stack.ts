import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'; // ✅ Correct Import
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from 'path'; // ✅ Fix "Cannot find name 'path'"

export class AwsUrlStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a DynamoDB table
    const urlTable = new dynamodb.Table(this, 'UrlShortenerTable', {
      partitionKey: { name: 'shortSlug', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Create a Lambda function using NodejsFunction
    const urlShortenerLambda = new NodejsFunction(this, 'UrlShortenerLambda', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X, // ✅ Ensure correct reference
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/index.js'), // ✅ Fixed path issue
      environment: {
        TABLE_NAME: urlTable.tableName,
      },
    });

    // Grant Lambda read/write permissions to DynamoDB
    urlTable.grantReadWriteData(urlShortenerLambda);

    // Create an API Gateway REST API
    const api = new apigateway.RestApi(this, 'UrlShortenerAPI', {
      restApiName: 'UrlShortenerService',
      description: 'API for shortening and redirecting URLs',
    });

    // Define a POST /shorten endpoint
    const shortenResource = api.root.addResource('shorten');
    shortenResource.addMethod('POST', new apigateway.LambdaIntegration(urlShortenerLambda));

    // Define a GET /{shortSlug} endpoint for URL redirection
    const redirectResource = api.root.addResource('{shortSlug}');
    redirectResource.addMethod('GET', new apigateway.LambdaIntegration(urlShortenerLambda));

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
    });
  }
}

