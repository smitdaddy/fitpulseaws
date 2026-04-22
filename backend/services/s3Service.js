import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
// 🔥 Debug logs (remove later)
console.log("AWS KEY:", process.env.AWS_ACCESS_KEY_ID);
console.log("AWS SECRET:", process.env.AWS_SECRET_ACCESS_KEY);
console.log("AWS REGION:", process.env.AWS_REGION);

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim(),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim(),
  },
});

export const uploadToS3 = async (file) => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    const fileStream = fs.createReadStream(file.path);

    const key = `food-images/${Date.now()}-${file.originalname}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: fileStream,
      ContentType: file.mimetype,
      // ❌ REMOVE ACL (new AWS blocks this sometimes)
    };

    const result = await s3.send(new PutObjectCommand(uploadParams));

    // delete local file after upload
    fs.unlinkSync(file.path);

    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw error;
  }
};
