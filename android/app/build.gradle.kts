plugins { id("com.android.application") }
android {
    namespace = "dev.olea.app"
    compileSdk = 36
    defaultConfig {
        applicationId = "dev.olea.app"
        minSdk = 26
        targetSdk = 36
        versionCode = 6
        versionName = "0.2-base"
        testInstrumentationRunner = "dev.olea.app.CoreInstrumentation"
        ndk { abiFilters += "x86_64" }
    }
    androidResources { noCompress += "bin" }
    packaging { jniLibs { useLegacyPackaging = true; keepDebugSymbols += "**/*.so" } }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
