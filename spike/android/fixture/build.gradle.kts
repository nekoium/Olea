plugins { id("com.android.application") }
android {
    namespace = "dev.olea.fixture"
    compileSdk = 36
    defaultConfig { applicationId = "dev.olea.fixture"; minSdk = 26; targetSdk = 36; versionCode = 1; versionName = "0.1" }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
