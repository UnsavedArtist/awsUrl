#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsUrlStack } from '../lib/aws_url-stack';

const app = new cdk.App();

// Fetch account and region from environment variables
const account = process.env.AWS_ACCOUNT_ID || process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION;

new AwsUrlStack(app, 'AwsUrlStack', {
  env: { account, region },
});

