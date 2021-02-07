# Memories
A Serverless app to keep your memories.

The app allows you to create an account, and create, retrieve, update and delete memories.

The backend is a Serverless app built using:
1. Serverless Framework 
2. AWS Lambda 
3. AWS Cognito for user authentication
4. S3 for storing user images   
5. DynamoDB

The frontend is a React/Redux app.

Take a look to the [screenshots](./screenshots) folder for images of the app.

## How to run the application
### Backend
You can deploy the app to AWS by doing:
1. Change the CognitoUserPoolDomain domain in [serverless.yml](backend/serverless.yml). Either choose one available url, or remove it 
   completely and AWS will create one for you
2. Run `npm install`
3. Run `sls deploy`

This will use your default AWS credentials. If you want to use different profile then run `AWS_PROFILE=my-aws-profile sls deploy`.
### Frontend
1. Edit [config](./frontend/src/config) with the backend details
2. Run `npm install`
3. Run `npm start`

## Improvements
Some nice to have improvements:
1. Automatically deploy frontend to AWS S3 / CloudFront
2. Serve images with CloudFront
3. Add pagination when fetching user memories
4. Update Cognito UI to match website

