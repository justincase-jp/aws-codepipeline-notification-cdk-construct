import {
  App,
  SecretValue,
  Stack,
} from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { GitHubSourceAction, S3DeployAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { PipelineNotification } from '../src';

test('PipelineNotification', () => {
  const app = new App();
  const stack = new Stack(app, 'test-stack');

  const webhookUrl = 'xxxxx';
  const messenger = 'xxxxx';

  const artifact = new Artifact();
  const pipeline = new Pipeline(stack, 'pipeline', {
    stages: [
      {
        stageName: 'first',
        actions: [
          new GitHubSourceAction({
            actionName: 'test',
            owner: 'justincase-jp',
            repo: 'test-repository',
            oauthToken: SecretValue.plainText('credential'),
            output: artifact,
          }),
        ],
      },
      {
        stageName: 'last',
        actions: [
          new S3DeployAction({
            actionName: 'test',
            input: artifact,
            bucket: new Bucket(stack, 'bucket'),
          }),
        ],
      },
    ],
  });

  new PipelineNotification(stack, 'test', {
    webhookUrl: webhookUrl,
    messenger: messenger,
    pipeline,
  });

  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::Events::Rule', 1);
  template.resourceCountIs('AWS::Lambda::Function', 2);

});
