# Recording Troubleshooting Guide

## Quick Fixes for Expo Go Users

### 1. **Close Other Audio Apps**
- Close any music apps (Spotify, Apple Music, etc.)
- End any phone calls
- Close video apps that might use audio
- Restart Expo Go app

### 2. **Check Permissions**
- Go to iOS Settings > Privacy & Security > Microphone
- Make sure your app has microphone permission
- If denied, enable it and restart the app

### 3. **Restart Expo Go**
- Force close Expo Go completely
- Reopen and scan the QR code again
- This clears any audio session conflicts

## Current Implementation Status ✅

The following fixes are **already implemented** in your code:

### Audio Session Management
- ✅ Audio session reset before recording
- ✅ Proper audio mode configuration
- ✅ Delays to ensure session stability

### Error Handling
- ✅ Specific error messages for different issues
- ✅ Retry mechanism with visual feedback
- ✅ Permission error detection
- ✅ Audio session error detection

### Recording Options
- ✅ Conservative settings for better compatibility
- ✅ Medium quality settings to avoid conflicts
- ✅ Mono recording for stability

## Testing Steps

1. **Test Basic Recording**
   - Open the recording screen
   - Tap the microphone button
   - Check console logs for detailed information
   - If error occurs, try the retry button

2. **Check Console Logs**
   - Open Expo DevTools or check terminal
   - Look for logs starting with "=== Starting Recording Process ==="
   - Identify where the process fails

3. **Test with Different Settings**
   - Try different recording templates
   - Test with different quality settings
   - Check if the issue is template-specific

## Debug Information

### Expected Console Output
```
=== Starting Recording Process ===
✅ Permissions granted
🔄 Resetting audio session...
✅ Audio session reset complete
🎤 Configuring audio mode for recording...
✅ Audio mode configured
📱 Creating recording instance...
📋 Recording options: {...}
⚙️ Preparing recording...
✅ Recording prepared
▶️ Starting recording...
🎉 Recording started successfully
```

### Common Error Patterns
- **Permission Error**: "Microphone permission denied"
- **Audio Session Error**: "NSOSStatusErrorDomain" or "Audio session error"
- **Preparation Error**: "Failed to prepare recording"

## If Issues Persist

1. **Try on Physical Device**
   - Expo Go on simulator has limited audio support
   - Test on actual iOS device if possible

2. **Check Expo SDK Version**
   - Ensure you're using the latest expo-av version
   - Update if necessary: `expo install expo-av`

3. **Alternative Recording Options**
   - Try different audio formats (MP3, WAV)
   - Test with lower sample rates
   - Use mono recording instead of stereo

## Contact Support

If the issue persists after trying all steps:
1. Note the exact error message
2. Check console logs for the full error trace
3. Try on a different device if possible
4. Report the issue with device model and iOS version 