import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const sendNotification = async (message, subject = "FitPulse Alert") => {
  try {
    const params = {
      TopicArn: process.env.SNS_TOPIC_ARN,
      Message: message,
      Subject: subject,
    };

    const command = new PublishCommand(params);
    await sns.send(command);

    console.log("SNS Notification Sent ✅");
  } catch (error) {
    console.error("SNS Error:", error);
  }
};