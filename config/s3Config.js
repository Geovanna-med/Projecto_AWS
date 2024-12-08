import { S3Client } from '@aws-sdk/client-s3';
import awsCredentials from './awsCredentials.js';

const s3Client = new S3Client(awsCredentials);

export default s3Client;
