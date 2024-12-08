import { SNSClient } from "@aws-sdk/client-sns";
import awsCredentials from './awsCredentials.js';

const snsClient = new SNSClient(awsCredentials);

export default snsClient;
