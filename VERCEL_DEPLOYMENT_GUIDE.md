# Deploying DostifyApp to Vercel

This guide provides step-by-step instructions for deploying both the client (Next.js) and server (Express/Socket.IO) components of your DostifyApp to Vercel.

## Prerequisites

1. A Vercel account (create one at [vercel.com](https://vercel.com) if you don't have one)
2. Vercel CLI installed globally: `npm install -g vercel`
3. Logged in to Vercel CLI: `vercel login`

## Deployment Options

You have two options for deployment:

1. **Automated Script**: Use the provided PowerShell script (`deploy-to-vercel.ps1`) for a guided deployment
2. **Manual Process**: Follow the step-by-step instructions below

## Option 1: Using the Automated Deployment Script

1. Open PowerShell in the root directory of your project
2. Run the deployment script:
   ```powershell
   .\deploy-to-vercel.ps1
   ```
3. Follow the prompts during the deployment process

## Option 2: Manual Deployment Process

### Step 1: Deploy the Server

1. Navigate to the server directory:

   ```powershell
   cd server
   ```

2. Deploy to Vercel:
   ```powershell
   vercel --prod
   ```
3. During deployment, you'll be asked a few questions:

   - Set up and deploy? **Yes**
   - Link to existing project? **No**
   - Project name? **dostifyapp-server** (or your preferred name)
   - Directory? **./** (default)
   - Override settings? **No**

4. Note the deployment URL (e.g., `https://dostifyapp-server.vercel.app`)

### Step 2: Deploy the Client

1. Navigate to the client directory:

   ```powershell
   cd ../client
   ```

2. Update the environment variables in `.env.production`:

   ```
   NEXT_PUBLIC_SERVER_URL=https://dostifyapp-server.vercel.app
   NEXT_PUBLIC_API_URL=https://dostifyapp-server.vercel.app
   ```

3. Deploy to Vercel:

   ```powershell
   vercel --prod
   ```

4. During deployment, you'll be asked similar questions as before:
   - Set up and deploy? **Yes**
   - Link to existing project? **No**
   - Project name? **dostifyapp-client** (or your preferred name)
   - Directory? **./** (default)
   - Override settings? **No**

### Step 3: Configure Environment Variables in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your client project
3. Go to **Settings** > **Environment Variables**
4. Add the following:
   - `NEXT_PUBLIC_SERVER_URL`: Your server URL (e.g., `https://dostifyapp-server.vercel.app`)
   - `NEXT_PUBLIC_API_URL`: Your server URL (e.g., `https://dostifyapp-server.vercel.app`)
5. Click **Save**
6. Go to **Deployments** and trigger a new deployment to apply the environment variables

## Verifying Your Deployment

1. Visit your client URL (e.g., `https://dostifyapp-client.vercel.app`)
2. Create a new chat room and verify communication works
3. Test all features to make sure they work as expected

## Troubleshooting

### Connection Issues

If you're experiencing WebSocket connection issues:

1. Verify CORS settings in `cors-config.js` include your Vercel domains
2. Check the server logs in Vercel dashboard for any errors
3. Make sure the environment variables are correctly set

### Deployment Failures

If deployment fails:

1. Check the deployment logs in Vercel dashboard
2. Verify your project structure matches Vercel's requirements
3. Ensure all dependencies are correctly listed in your package.json files

### Other Issues

For issues with Socket.IO behind serverless functions:

1. Consider using Socket.IO's sticky-session adapter
2. Vercel functions have a maximum execution time, which may affect long-lived WebSocket connections
3. For production applications with heavy WebSocket usage, consider dedicated hosting like Digital Ocean, AWS EC2, or Render.com

## Maintaining Both Vercel and Render Deployments

If you want to maintain deployments on both platforms:

1. Make sure your CORS configuration includes both Vercel and Render domains
2. Use environment variables to dynamically set connections based on the deployment environment
3. Keep both configuration files (render.yaml and vercel.json) updated when making changes

## Updates and Maintenance

To update your deployed application:

1. Make changes to your code locally
2. Commit the changes to your version control system
3. Push to Vercel with `vercel --prod` or set up automatic deployments from your repository
