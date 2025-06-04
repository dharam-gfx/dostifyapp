# NookChat Encryption System Documentation

## Overview

NookChat employs an end-to-end encryption system to ensure that all messages and images shared between users remain private and secure. This document provides a comprehensive explanation of the encryption architecture, implementation details, and security considerations used throughout the application.

## Table of Contents

1. [Encryption Technology](#encryption-technology)
2. [Key Management](#key-management)
3. [Message Encryption](#message-encryption)
4. [Image Encryption](#image-encryption)
5. [Security Considerations](#security-considerations)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)
8. [Future Enhancements](#future-enhancements)

## Encryption Technology

NookChat utilizes the Advanced Encryption Standard (AES-256) implemented through the CryptoJS library. This provides a robust, industry-standard level of security:

- **Algorithm**: AES (Advanced Encryption Standard)
- **Key Size**: 256 bits
- **Mode**: CBC (Cipher Block Chaining)
- **Library**: CryptoJS
- **Implementation Location**: `src/utils/encryptionUtils.ts`

AES-256 is widely recognized as a secure encryption standard and is used by governments and security-focused organizations worldwide.

## Key Management

NookChat employs a multi-tiered approach to encryption key management:

### Key Generation

When needed, secure random keys are generated using:

```typescript
const generateSecureKey = (): string => {
    return CryptoJS.lib.WordArray.random(256 / 8).toString();
};
```

This creates a cryptographically strong random key with sufficient entropy for AES-256 encryption.

### Key Storage Hierarchy

Keys are stored with the following priority:

1. **Environment Variable**: The primary source is the `NEXT_PUBLIC_ENCRYPTION_KEY` environment variable
2. **Session Storage**: If the environment variable is not available, the key is retrieved from session storage
3. **Fallback Generation**: If neither source has a key, a new one is generated and stored in session storage

```typescript
const getEncryptionKey = () => {
    // Check for environment variable first
    if (process.env.NEXT_PUBLIC_ENCRYPTION_KEY) {
        return process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
    }

    // Then check session storage
    if (typeof window !== 'undefined') {
        const sessionKey = sessionStorage.getItem('chatEncryptionKey');
        if (sessionKey) {
            return sessionKey;
        }
    }

    // Generate new key as last resort
    const newKey = generateSecureKey();
    
    // Save to session storage if available
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('chatEncryptionKey', newKey);
    }
    
    return newKey;
};
```

### Key Initialization

The system initializes the encryption key in session storage on application startup:

```typescript
if (typeof window !== 'undefined' && !sessionStorage.getItem('chatEncryptionKey')) {
    sessionStorage.setItem('chatEncryptionKey', getEncryptionKey());
}
```

### Security Considerations

- Using `NEXT_PUBLIC_` prefix makes the key accessible in client-side code, which is a necessary trade-off for client-side encryption
- Session storage (rather than local storage) is used to limit the key's persistence
- The key is never transmitted to the server or stored in cookies

## Message Encryption

### Encryption Process

Messages are encrypted using the following process in `encryptMessage()`:

1. Retrieve the encryption key using the hierarchy described above
2. Use CryptoJS.AES to encrypt the plaintext message with the key
3. Return the encrypted message as a string

```typescript
export const encryptMessage = (message: string): string => {
    try {
        console.log('🔒 Starting message encryption...');
        const key = getEncryptionKey();
        const encrypted = CryptoJS.AES.encrypt(message, key).toString();
        console.log('✅ Message encrypted successfully');
        return encrypted;
    } catch (error) {
        console.error('❌ Encryption failed:', error);
        return message; // Fallback to unencrypted message in case of error
    }
};
```

### Decryption Process

Received messages are decrypted using the following process in `decryptMessage()`:

1. Retrieve the same encryption key
2. Use CryptoJS.AES to decrypt the encrypted message
3. Convert the decrypted bytes to a UTF-8 string
4. Return the original plaintext message

```typescript
export const decryptMessage = (encryptedMessage: string): string => {
    try {
        console.log('🔓 Starting message decryption...');
        const key = getEncryptionKey();
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        
        if (!decrypted) {
            console.warn('⚠️ Decryption produced empty result');
            return encryptedMessage;
        }
        
        console.log('✅ Message decrypted successfully');
        return decrypted;
    } catch (error) {
        console.error('❌ Decryption failed:', error);
        return encryptedMessage; // Return encrypted text if decryption fails
    }
};
```

## Image Encryption

NookChat includes comprehensive image encryption capabilities for secure image sharing.

### Image Optimization Before Encryption

To improve performance, images are optimized before encryption:

1. Images are loaded into an HTML5 Canvas element
2. Resized if they exceed maximum dimensions (1600px by default)
3. Compressed with configurable quality (0.85 by default)
4. Converted to a more efficient JPEG format

```typescript
const optimizeImageBeforeEncryption = async (file, maxWidth = 1600, quality = 0.85) => {
    // Implementation using HTML5 Canvas for resizing and optimizing
    // Reduces file size while maintaining acceptable quality
};
```

### Image Encryption Process

The image encryption pipeline involves:

1. **Optimization**: Resize and compress the image
2. **Conversion**: Convert the optimized image to a Base64 string
3. **Encryption**: Encrypt the Base64 string using the same AES-256 encryption used for messages
4. **Packaging**: Create a new file with the encrypted content

```typescript
const encryptImageFile = async (file) => {
    try {
        // Check if the file is an image
        if (!file.type.startsWith('image/')) {
            return file; // Non-image files are passed through as-is
        }
        
        // Step 1: Optimize image before encryption
        const optimizedBlob = await optimizeImageBeforeEncryption(file);
        
        // Step 2: Read as ArrayBuffer and convert to WordArray
        const arrayBuffer = await optimizedBlob.arrayBuffer();
        const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(arrayBuffer));
        
        // Step 3: Create Base64 string and encrypt
        const base64 = CryptoJS.enc.Base64.stringify(wordArray);
        const encrypted = encryptMessage(base64);
        
        // Step 4: Create new file with encrypted content
        const encryptedBlob = new Blob([encrypted], { type: 'application/encrypted' });
        return new File([encryptedBlob], `${file.name}.encrypted`, {
            type: 'application/encrypted',
            lastModified: Date.now()
        });
    } catch (error) {
        console.error('Failed to encrypt image:', error);
        return file; // Fall back to original file if encryption fails
    }
};
```

### Image Decryption Process

When displaying images, the `EncryptedImage` component:

1. Fetches the encrypted image content
2. Decrypts the content using the encryption key
3. Converts the decrypted Base64 content to a data URL
4. Renders the image using the data URL

```typescript
const decryptImageUrl = async (url) => {
    try {
        // Generate unique ID for logging
        const decryptId = Math.random().toString(36).substring(2, 8);
        
        // Fetch the encrypted image data
        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
        
        // Get the encrypted text content
        const encryptedText = await response.text();
        
        // Decrypt the content
        const decryptedBase64 = decryptMessage(encryptedText);
        
        // Get the original file type
        const fileType = await getOriginalFileType(url);
        
        // Create and return data URL
        return `data:${fileType};base64,${decryptedBase64}`;
    } catch (error) {
        console.error('Image decryption failed:', error);
        return url; // Fall back to original URL if decryption fails
    }
};
```

### Error Handling and Fallbacks

The `EncryptedImage` component implements several fallback strategies:

1. Retries failed decryption attempts up to 2 times
2. Displays placeholder images during loading
3. Shows user-friendly error states with retry options
4. Falls back to the original encrypted image if decryption fails

## Security Considerations

### Strengths

1. **Client-Side Encryption**: Messages and images are encrypted before leaving the user's browser
2. **Strong Algorithm**: AES-256 is a robust, industry-standard encryption algorithm
3. **End-to-End Approach**: Content is only decrypted on the recipient's device
4. **Ephemeral Keys**: Session-based keys improve security in case of compromise

### Limitations

1. **Browser-Based**: As a web application, NookChat is subject to browser security limitations
2. **Key Management**: Client-side key management has inherent security challenges
3. **Performance Trade-offs**: Encryption/decryption adds processing overhead
4. **Environment Variable Exposure**: Using NEXT_PUBLIC_ prefix exposes the key in client-side code

## Error Handling

NookChat employs comprehensive error handling strategies:

1. **Graceful Degradation**: Falls back to less secure options rather than stopping functionality
2. **Detailed Logging**: Console logs provide visibility into encryption/decryption processes
3. **User Feedback**: Shows appropriate UI elements during encryption/decryption processes
4. **Automatic Recovery**: Implements automatic retries for transient failures
5. **Manual Recovery**: Provides retry options for persistent failures

## Best Practices

The encryption system follows several security best practices:

1. **Secure Key Generation**: Uses cryptographically secure random number generation
2. **Minimal Key Storage**: Avoids unnecessary persistence of encryption keys
3. **Error Isolation**: Encryption failures don't cascade to application failures
4. **Fallback Mechanisms**: Gracefully handles encryption/decryption failures
5. **Testing**: Includes verification of encryption/decryption pipeline

## Future Enhancements

Potential improvements to consider:

1. **Per-Chat Keys**: Implement unique encryption keys for each chat room
2. **Key Rotation**: Regularly update encryption keys for improved security
3. **Web Crypto API**: Consider migrating to the native Web Crypto API
4. **Encryption Verification**: Add features to verify encryption integrity
5. **Perfect Forward Secrecy**: Implement mechanisms to protect past communications

---
