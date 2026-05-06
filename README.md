🚀 FitPulse – AI-Based Health & Nutrition Management System
===========================================================

FitPulse is an AI-powered health-tech application designed to help users manage lifestyle diseases such as **diabetes, PCOD, and thyroid disorders** through intelligent food tracking, personalized diet planning, and real-time health analytics.

Instead of a locally trained ML model, FitPulse leverages the **Gemini API** for food recognition and analysis, enabling accurate and scalable AI-powered insights.

🌟 Features
-----------

*   📸 **AI Food Scanner (Gemini API)**Upload food images and get instant predictions with nutritional insights
    
*   🥗 **Personalized Diet Plans**Region-based Indian diet recommendations tailored to user health conditions
    
*   📊 **Health Analytics Dashboard**Track calories, protein intake, and overall health trends
    
*   💊 **Medication Tracker**Manage prescriptions and adherence
    
*   📱 **Responsive UI**Optimized for both web and mobile devices
    

☁️ AWS Integration
------------------

FitPulse uses AWS services for scalability and performance:

*   **Amazon S3** – Stores uploaded food images
    
*   **AWS IAM** – Secure access management
    
*   **Amazon CloudFront** – Fast frontend delivery (CDN)
    
*   **Amazon SQS** – Handles async processing tasks
    
*   **AWS Lambda** – Serverless backend execution
    

🧠 Tech Stack
-------------

*   **Frontend:** React (Vite)
    
*   **Backend:** Node.js / Express
    
*   **AI Integration:** Gemini API (Google AI)
    
*   **Database:** MongoDB
    
*   **Cloud:** AWS
    

📂 Project Structure
--------------------

   FitPulse/│── backend/│   ├── config/│   ├── controllers/│   ├── middleware/│   ├── models/│   ├── routes/│   ├── services/        # Gemini + AWS logic│   ├── uploads/         # temp image storage│   ├── server.js│   └── .env││── frontend/│   ├── src/│   ├── dist/│   ├── index.html│   └── vite.config.js││── README.md   `

⚙️ System Workflow
------------------

   User uploads food image        ↓Image stored in AWS S3        ↓Backend sends image to Gemini API        ↓Gemini returns food prediction        ↓Backend maps to nutrition dataset        ↓Results displayed on dashboard   `

🛠️ Setup Instructions
----------------------

### 1️⃣ Clone the Repository

   git clone https://github.com/your-username/fitpulse.gitcd fitpulse   `

### 2️⃣ Backend Setup

   cd backendnpm install   `

Create .env file:

   PORT=5000MONGO_URI=your_mongodb_uri
   AWS_ACCESS_KEY=your_keyAWS_SECRET_KEY=your_secretS3_BUCKET_NAME=your_bucketGEMINI_API_KEY=your_gemini_api_key   `

Run backend:
`   npm start   `

### 3️⃣ Frontend Setup

   cd frontendnpm installnpm run dev   `

### 4️⃣ AWS Setup

*   Create S3 bucket for image uploads
    
*   Configure IAM roles
    
*   Setup Lambda (if used)
    
*   Configure SQS queue
    
*   Deploy frontend via CloudFront
    

▶️ Usage
--------

1.  Open the app
    
2.  Upload or scan food image
    
3.  Gemini API processes image
    
4.  Nutritional details displayed instantly
    

🎯 Future Improvements
----------------------

*   Improve AI accuracy with hybrid models
    
*   Add portion size estimation
    
*   Real-time health recommendations
    
*   Integration with wearables
    

👨‍💻 Contributors
------------------

*   Smit Patil
    
*   Mohammad Umer Mir
    
*   Adrian Johnson
    
*   Khizer Ansari
