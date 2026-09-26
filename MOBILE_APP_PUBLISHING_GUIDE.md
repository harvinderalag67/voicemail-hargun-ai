# VoiceFlow AI — Mobile App Publishing Guide

This guide details all available strategies to package, publish, and distribute **VoiceFlow AI** as a mobile app on **iOS (Apple App Store)**, **Android (Google Play Store)**, and **Instant Mobile Web (Progressive Web App)**.

---

## Strategy Comparison Matrix

| Strategy | Target Platform | Development Effort | App Store Review? | 30% In-App Fee? | Offline Audio Support |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Progressive Web App (PWA)** | iOS & Android | **Immediate (Already done!)** | No (Instant deployment) | No (0% fee) | Yes (Service Worker + LocalStorage) |
| **2. Capacitor (Ionic)** | Apple App Store & Google Play | Low (~1–2 hours) | Yes (Standard review) | Yes (if IAP used) | Yes (Native audio plugins) |
| **3. PWABuilder / TWA** | Google Play Store | Low (~30 minutes) | Yes (Fast-tracked) | Optional | Yes (Runs native Chrome engine) |
| **4. React Native / Flutter** | iOS & Android | High (Full rewrite) | Yes | Yes | High |

---

## Path 1: Instant Mobile Web App (PWA) — *Live Right Now*

VoiceFlow AI is pre-configured with a Web App Manifest (`/manifest.webmanifest`), Service Worker (`/sw.js`), and iOS Touch Icons (`/apple-touch-icon.png`).

### How to use on Mobile:
1. **On iPhone / iPad (Safari)**:
   - Open the web app URL in Safari.
   - Tap the **Share** button in the bottom navigation toolbar.
   - Scroll down and tap **"Add to Home Screen"**.
   - Tap **Add**. The app now launches with no browser URL bar or bottom navigation, exactly like an App Store app!
2. **On Android (Chrome / Edge)**:
   - Open the web app URL.
   - Tap the in-app **"Install Mobile App"** button, or tap Chrome's three dots (`⋮`) -> **"Install App"**.
   - Android will generate a native WebAPK with full home screen integration.

---

## Path 2: Publish to Apple App Store & Google Play via Capacitor

[Capacitor](https://capacitorjs.com/) (by Ionic) turns any modern web application into an official Xcode project (iOS) and Android Studio project (Android).

### Step 1: Install Capacitor CLI & Core
Run these commands in your project root:
```bash
npm install @capacitor/core @capacitor/cli
```

### Step 2: Initialize Capacitor
A `capacitor.config.json` has already been generated in your repository:
```bash
npx cap init "VoiceFlow AI" "com.voiceflow.ai" --web-dir .
```

### Step 3: Add Native iOS and Android Platforms
```bash
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

### Step 4: Add Native Audio & Microphone Plugins (Recommended)
For background voice recording and native haptic feedback:
```bash
npm install @capacitor-community/speech-recognition @capacitor/haptics
npx cap sync
```

### Step 5: iOS Setup (Xcode)
1. Open the project in Xcode:
   ```bash
   npx cap open ios
   ```
2. In Xcode, select `App` in the project navigator -> **Signing & Capabilities** -> Select your Apple Developer Team.
3. Open `Info.plist` and add the Microphone & Speech Recognition privacy permissions:
   ```xml
   <key>NSMicrophoneUsageDescription</key>
   <string>VoiceFlow requires microphone access to transcribe your spoken thoughts into structured tasks.</string>
   <key>NSSpeechRecognitionUsageDescription</key>
   <string>VoiceFlow uses speech recognition to extract action items from your voice memos.</string>
   ```
4. Connect an iPhone or select an iOS Simulator -> Click **Run (⌘R)**.
5. In Xcode, choose **Product > Archive** to build the `.ipa` and upload to TestFlight / App Store Connect.

### Step 6: Android Setup (Android Studio)
1. Open the project in Android Studio:
   ```bash
   npx cap open android
   ```
2. Verify `AndroidManifest.xml` includes microphone permissions:
   ```xml
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
   ```
3. In Android Studio, go to **Build > Generate Signed Bundle / APK** -> Select **Android App Bundle (.aab)**.
4. Upload the generated `.aab` to your [Google Play Console](https://play.google.com/console).

---

## Path 3: Fast-Track to Google Play Store via PWABuilder (TWA)

If you want an official Google Play Store listing with zero Android Studio setup:
1. Deploy VoiceFlow to Vercel, Netlify, or Cloud Run.
2. Go to [PWABuilder.com](https://www.pwabuilder.com).
3. Paste your live deployment URL and click **Start**.
4. PWABuilder verifies your Manifest and Service Worker (VoiceFlow scores 100/100).
5. Click **Package for Store** -> select **Android**.
6. Download the signed `.aab` (Android App Bundle).
7. Upload the `.aab` to Google Play Console. Google Play will handle signing and distribution automatically!

---

## Recommended Recommendation for VoiceFlow AI

1. **Phase 1 (Today)**: Launch as a **Progressive Web App (PWA)**. Users can immediately bookmark and install it to their iPhone and Android home screens without waiting days for App Store review.
2. **Phase 2 (Next 1–2 Weeks)**: Wrap with **Capacitor** to submit to the **Apple App Store** ($99/year Apple Developer program) and **Google Play** ($25 one-time fee) for organic search visibility.
