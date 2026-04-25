import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim(),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim(),
  },
});

export const sendToQueue = async (data) => {
  try {
    console.log("🚀 Sending message to SQS...");
    console.log("Queue URL:", process.env.SQS_QUEUE_URL);
    console.log("Payload:", data);

    const command = new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: JSON.stringify(data),
    });

    const response = await sqs.send(command);

    console.log("✅ Message sent to SQS:", response);

    return response;
  } catch (error) {
    console.error("❌ SQS SEND ERROR:", error);
    throw error;
  }
};