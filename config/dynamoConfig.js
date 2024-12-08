import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import awsCredentials from './awsCredentials.js';

const dynamoClient = new DynamoDBClient(awsCredentials);

export default dynamoClient;
