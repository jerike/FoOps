# FoOps
## Bundle command
react-native bundle --entry-file index.js --platform android --dev false --bundle-output ./android/app/src/main/assets/index.android.bundle --assets-dest ./android/app/src/main/res/

## 生成簽名秘鑰
keytool -genkey -v -keystore foops.keystore -alias foops -keyalg RSA -deststoretype pkcs12 -keysize 2048 -validity 10000  
keytool -importkeystore -srckeystore foops.keystore -destkeystore foops.keystore -deststoretype pkcs12  

>Keystore 放入 android/app/

## 配置gradle全局變量
> android > gradle.properties  
MYAPP_RELEASE_STORE_FILE=foops.keystore  
MYAPP_RELEASE_KEY_ALIAS=foops  
MYAPP_RELEASE_STORE_PASSWORD=********  
MYAPP_RELEASE_KEY_PASSWORD=********  


## 清除緩存
cd android && ./gradlew clean 

## 打包正式版
cd android && ./gradlew clean  && ./gradlew assembleRelease


## React Native live reload
React-native run-android  
adb shell input keyevent 8

## **Fix compiler issue **
> Task :app:installDebug FAILED  
>>adb uninstall "com.foops"
  
> Task :app:mergeReleaseResources FAILED  
>> build/generated/res/react/release
>>> remove {drawable} folder


## If useAndroidX , need compiler element
1. npm install --save-dev jetifier  
2. npx jetify  
3. npx react-native run-android


## ADB from platform-tools 28.0.2 can now be safely used with the emulator.
If you are experiencing issues with "unauthorized" emulators:  
1. Exit all emulators  
2. Delete ~/.android/adbkey and ~/.android/adbkey.pub  
3. adb kill-server  
4. adb devices Wipe data of AVD  
5. Relaunch emulator
