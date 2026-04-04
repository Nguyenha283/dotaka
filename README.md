# AI Molding Visualizer

AI Molding Visualizer is a web application that allows users to upload a photo of a room and select molding designs. It uses AI (via KIE.AI) to realistically render the selected moldings into the room, helping users visualize interior renovations.

## Features
- **Upload Room Image:** Users can capture or upload an image of their target room.
- **Select Molding Designs:** A library of crown moldings is available to choose from. Users can also add custom moldings.
- **AI Generation:** Leverages the Flux-2 Image-to-Image model via KIE API to seamlessly blend the molding into the room.
- **Customizable Output:** Users can select the desired aspect ratio and resolution.
- **Dark Mode:** Modern UI supporting dark mode.

## Prerequisites
- [Node.js](https://nodejs.org/en/download/) (v18 or higher recommended)
- KIE API Key (for the backend to communicate with the model)

## Setup Instructions

1. **Install Dependencies:**
   Run the following command in the root folder of the project to install all required packages:
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Rename the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and insert your valid API keys:
   ```env
   KIE_API_KEY=your_kie_api_key_here
   ```

3. **Run the Application:**
   To start both the backend server and the frontend application in development mode, run:
   ```bash
   npm run dev
   ```
   The application will be available at: http://localhost:3000

## Building for Production
To build the application for production deployment, run:
```bash
npm run build
```
This generates the optimized build in the `dist` folder. You can then serve the application using `npm run start` in a production environment.
