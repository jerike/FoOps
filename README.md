# FoOps
>Bundle command
react-native bundle --entry-file index.js --platform android --dev false --bundle-output ./android/app/src/main/assets/index.android.bundle --assets-dest ./android/app/src/main/res/

>生成簽名秘鑰 keytool -genkey -v -keystore foops.keystore -alias foops -keyalg RSA -deststoretype pkcs12 -keysize 2048 -validity 10000
keytool -importkeystore -srckeystore foops.keystore -destkeystore foops.keystore -deststoretype pkcs12

>Keystore 放入 android/app/

>配置gradle全局變量
MYAPP_RELEASE_STORE_FILE=foops.keystore
MYAPP_RELEASE_KEY_ALIAS=foops
MYAPP_RELEASE_STORE_PASSWORD=********
MYAPP_RELEASE_KEY_PASSWORD=********


>進入安卓
cd android

> 清除緩存
gradlew clean 

>打包正式版
gradlew assembleRelease