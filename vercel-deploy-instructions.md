# Deploy to Vercel

## Prerequisites

1. Make sure you have Vercel CLI installed globally:

   ```
   npm install -g vercel
   ```

2. Make sure you are logged in to Vercel:
   ```
   vercel login
   ```

## Deployment Steps

### Step 1: Deploy the Server

1. Navigate to the server directory:

   ```
   cd server
   ```

2. Deploy to Vercel:
   ```
   vercel
   ```
   - When prompted, select to link to an existing project or create a new one
   - Make note of the deployment URL (e.g., https://dostifyapp-server.vercel.app)

### Step 2: Deploy the Client

1. Navigate to the client directory:

   ```
   cd ../client
   ```

2. Create a .env.local file with the server URL:

   ```
   echo "SERVER_URL=https://dostifyapp-server.vercel.app/api" > .env.local
   ```

3. Deploy to Vercel:
   ```
   vercel
   ```
   - When prompted, select to link to an existing project or create a new one

### Step 3: Set Environment Variables in Vercel Dashboard

1. Go to the Vercel dashboard (https://vercel.com/dashboard)
2. Open your client project
3. Go to Settings > Environment Variables
4. Add the following environment variable:
   - Name: SERVER_URL
   - Value: https://dostifyapp-server.vercel.app/api
5. Click "Save"
6. Redeploy the client project if needed

## Notes

- Make sure to update all socket connection URLs in your client code to use the new server URL
- The configuration files (vercel.json) are already set up for both projects
- CORS has been configured to allow connections from your Vercel domains
