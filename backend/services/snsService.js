import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = () => new SNSClient({
  region: process.env.AWS_REGION,
});

export const sendNotification = async (message, subject = "FitPulse Alert") => {
  try {
    console.log("📧 Attempting to send SNS notification...");
    console.log("   Topic ARN:", process.env.SNS_TOPIC_ARN);
    console.log("   Subject:", subject);
    console.log("   Message:", message);

    const sns = snsClient();
    const params = {
      TopicArn: process.env.SNS_TOPIC_ARN,
      Message: message,
      Subject: subject,
    };

    const command = new PublishCommand(params);
    const response = await sns.send(command);

    console.log("✅ SNS Notification Sent! MessageId:", response.MessageId);
  } catch (error) {
    console.error("❌ SNS Error:", error.message);
    console.error("   Error Code:", error.code);
    console.error("   Full Error:", error);
  }
};