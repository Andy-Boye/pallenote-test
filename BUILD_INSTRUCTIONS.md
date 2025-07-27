# Development Build Instructions

## Why Development Build?

The `NSOSStatusErrorDomain Code=1718449215` error you're experiencing is a **known limitation of Expo Go** on iOS. Expo Go runs in a sandboxed environment that has restrictions on audio session management.

## Solution: Create a Development Build

### Step 1: Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Configure EAS Build
```bash
eas build:configure
```

### Step 4: Create Development Build for iOS
```bash
eas build --platform ios --profile development
```

### Step 5: Install on Your Device
1. Download the `.ipa` file from the build link
2. Install using Xcode or TestFlight
3. Or use the QR code to install directly

## Alternative: Local Development Build

If you prefer to build locally:

### Prerequisites
- macOS with Xcode installed
- iOS device or simulator

### Build Locally
```bash
npx expo run:ios
```

## Benefits of Development Build

✅ **Full microphone access** - No sandbox restrictions  
✅ **Proper audio session management** - Native iOS audio handling  
✅ **Better performance** - Native code execution  
✅ **All native features** - Full access to iOS APIs  

## Testing After Build

1. Install the development build on your device
2. Open the app
3. Try the microphone recording
4. It should work without the `NSOSStatusErrorDomain` error

## Troubleshooting

### If build fails:
1. Check your Apple Developer account
2. Ensure you have proper certificates
3. Verify your bundle identifier

### If recording still doesn't work:
1. Check microphone permissions in iOS Settings
2. Close other audio apps
3. Restart your device

## Next Steps

Once you have a development build working:
1. Remove the `MicrophoneTest` component
2. Test the main recording functionality
3. The microphone should work perfectly

---

**Note**: Development builds are the recommended approach for apps that need full native functionality like microphone recording. 