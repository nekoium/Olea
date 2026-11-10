plugins { id("com.android.application") }
android {
    namespace = "dev.olea.spike"
    compileSdk = 36
    defaultConfig {
        applicationId = "dev.olea.spike"
        minSdk = 26
        targetSdk = 28
        versionCode = 1
        versionName = "0.1-feasibility"
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
