# Image Handling System Documentation

## Overview

This document explains the modular organization of the image handling system in the NookChat.

## Directory Structure

### Server-Side Organization

```
server/
├── routes/
│   └── images.js                  # API endpoints for image operations
├── uploads/
│   └── sessions/                  # Physical storage for uploaded images
└── utils/
    ├── imageCleanup.js            # Legacy file (now replaced by imageUtils)
    └── imageUtils/                # Modular image utilities
        ├── constants.js           # Constants and configuration
        ├── dirManager.js          # Directory management utilities
        ├── fileManager.js         # File operation utilities
        ├── cleanup.js             # Session and image cleanup utilities
        └── index.js               # Central export point
```

### Client-Side Organization

```
client/src/
├── components/
│   └── chat/
│       ├── FileUploadButton.tsx   # UI for uploading files
│       ├── MessageAttachments.tsx # UI for displaying image attachments
│       └── UploadedImagesPreview.tsx # Preview component for uploaded images
├── contexts/
│   └── UploadedFilesContext.tsx   # State management for uploaded files
└── services/
    ├── cleanupService.ts          # Legacy file (now replaced)
    ├── imageUploadService.ts      # Legacy file (now replaced)
    └── imageServices/             # Modular image services
        ├── constants.ts           # API endpoints and configuration
        ├── sessionUtils.ts        # Utilities for session management
        ├── uploadService.ts       # Service for uploading images
        ├── cleanupService.ts      # Service for cleaning up images
        └── index.ts               # Central export point
```

## Key Modules

### Server-Side

1. **constants.js**

   - Defines paths, size limits, and other configurations

2. **dirManager.js**

   - Functions for creating and managing directories
   - Session directory management

3. **fileManager.js**

   - File operations (listing, deleting)
   - URL generation for images

4. **cleanup.js**
   - Functions for cleaning up session images
   - Inactive session management

### Client-Side

1. **constants.ts**

   - API endpoints and configuration

2. **sessionUtils.ts**

   - Functions for getting and managing session IDs

3. **uploadService.ts**

   - Image upload functionality
   - Message attachment utilities

4. **cleanupService.ts**
   - Singleton service for image cleanup
   - Handles page unload and session cleanup events

## Usage Examples

### Server-Side

```javascript
// Import all utilities from a central location
import {
  cleanupSessionImages,
  ensureDirectoriesExist,
  generateFileUrl,
} from "./utils/imageUtils/index.js";

// Use utilities
ensureDirectoriesExist();
const url = generateFileUrl(SERVER_URL, sessionId, filename);
await cleanupSessionImages(sessionId);
```

### Client-Side

```typescript
// Import from central location
import { uploadImages, attachImagesToMessage } from "@/services/imageServices";
import cleanupService from "@/services/imageServices";

// Upload images
const urls = await uploadImages(files);

// Clean up on leave
await cleanupService.cleanupOnLeave();

// Register cleanup handlers
cleanupService.registerCleanupHandlers();
```
