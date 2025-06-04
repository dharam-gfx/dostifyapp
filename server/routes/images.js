import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';
import { SERVER_URL } from '../index.js';
import {
  UPLOADS_BASE_DIR,
  SESSION_IMAGES_DIR,
  MAX_FILE_SIZE,
  MAX_FILES,
  ensureDirectoriesExist,
  ensureSessionDirectory,
  generateFileUrl
} from '../utils/imageUtils/index.js';

// Create a router
const router = express.Router();

// Ensure directories exist
ensureDirectoriesExist();

// Setup storage engine with session-based subdirectories
const storage = multer.diskStorage( {
  destination: function ( req, file, cb ) {
    const sessionId = req.params.sessionId || 'default';
    const sessionDir = ensureSessionDirectory( sessionId );
    cb( null, sessionDir );
  },
  filename: function ( req, file, cb ) {
    // Create a unique filename with original extension
    const uniqueId = nanoid( 10 );
    const fileExtension = path.extname( file.originalname );
    const timestamp = Date.now();
    cb( null, `${timestamp}-${uniqueId}${fileExtension}` );
  }
} );

// Configure upload with file filtering
const upload = multer( {
  storage: storage, limits: {
    fileSize: MAX_FILE_SIZE, // From constants
    files: MAX_FILES // From constants
  },
  fileFilter: function ( req, file, cb ) {
    // Accept only image files
    if ( file.mimetype.startsWith( 'image/' ) ) {
      cb( null, true );
    } else {
      cb( new Error( 'Only image files are allowed!' ), false );
    }
  }
} );

// Route to upload images to a specific session
router.post( '/upload/:sessionId', upload.array( 'files', MAX_FILES ), ( req, res ) => {
  try {
    if ( !req.files || req.files.length === 0 ) {
      return res.status( 400 ).json( { message: 'No files uploaded' } );
    }    // Generate URLs for the uploaded files
    const sessionId = req.params.sessionId; const fileUrls = req.files.map( file => {
      return {
        url: generateFileUrl( SERVER_URL, sessionId, file.filename ),
        name: file.originalname,
        size: file.size,
        type: file.mimetype
      };
    } );

    res.status( 200 ).json( {
      message: 'Files uploaded successfully',
      fileUrls
    } );
  } catch ( error ) {
    console.error( 'Error uploading files:', error );
    res.status( 500 ).json( { message: 'Error uploading files' } );
  }
} );

// Route to get all images for a specific session
router.get( '/list/:sessionId', ( req, res ) => {
  try {
    const sessionId = req.params.sessionId;
    const sessionDir = path.join( SESSION_IMAGES_DIR, sessionId );

    if ( !fs.existsSync( sessionDir ) ) {
      return res.status( 404 ).json( { message: 'Session not found or no images' } );
    } const files = fs.readdirSync( sessionDir ); const fileUrls = files.map( filename => {
      return {
        url: generateFileUrl( SERVER_URL, sessionId, filename ),
        name: filename
      };
    } );

    res.status( 200 ).json( { files: fileUrls } );
  } catch ( error ) {
    console.error( 'Error listing files:', error );
    res.status( 500 ).json( { message: 'Error listing files' } );
  }
} );

// Route to delete all images for a specific session (cleanup)
router.delete( '/cleanup/:sessionId', async ( req, res ) => {
  try {
    const sessionId = req.params.sessionId;
    const { cleanupSessionImages } = await import( '../utils/imageUtils/index.js' );

    const success = await cleanupSessionImages( sessionId );

    if ( success ) {
      return res.status( 200 ).json( { message: `All images for session ${sessionId} deleted successfully` } );
    } else {
      return res.status( 500 ).json( { message: 'Error cleaning up files' } );
    }
  } catch ( error ) {
    console.error( 'Error cleaning up files:', error );
    res.status( 500 ).json( { message: 'Error cleaning up files' } );
  }
} );

export default router;
