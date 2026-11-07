#!/bin/bash
set -e
export JAVA_HOME=$HOME/.cache/jdk17
export PATH=$JAVA_HOME/bin:$PATH
SDK=$HOME/.cache/android/sdk
BT=$SDK/build-tools/34.0.0
AJ=$SDK/platforms/android-34/android.jar
cd "$(dirname "$0")"
ROOT="$(cd ../.. && pwd)"

rm -rf build gen obj
mkdir -p build gen obj

echo "== aapt2 compile =="
$BT/aapt2 compile --dir res -o build/res.zip

echo "== aapt2 link =="
$BT/aapt2 link -o build/base.apk \
  -I "$AJ" \
  --manifest AndroidManifest.xml \
  -R build/res.zip \
  -A assets \
  --java gen \
  --min-sdk-version 23 --target-sdk-version 34 \
  --auto-add-overlay

echo "== javac =="
find gen -name "*.java" > build/sources.txt
find src -name "*.java" >> build/sources.txt
javac -source 8 -target 8 -bootclasspath "$AJ" -classpath "$AJ" -d obj @build/sources.txt 2>&1 | grep -v "warning:" || true

echo "== d8 =="
find obj -name "*.class" > build/classes.txt
$BT/d8 --lib "$AJ" --min-api 23 --output build $(cat build/classes.txt)

echo "== add classes.dex =="
cd build
zip -q base.apk classes.dex
cd ..

echo "== zipalign =="
$BT/zipalign -f -p 4 build/base.apk build/aligned.apk

echo "== keystore =="
if [ ! -f debug.keystore ]; then
  keytool -genkeypair -v -keystore debug.keystore -storepass android -keypass android \
    -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US" >/dev/null 2>&1
fi

echo "== sign =="
$BT/apksigner sign --ks debug.keystore --ks-pass pass:android --key-pass pass:android \
  --out "$ROOT/1c-profi.apk" build/aligned.apk

echo "== verify =="
$BT/apksigner verify --print-certs "$ROOT/1c-profi.apk" | head -5
ls -la "$ROOT/1c-profi.apk"
