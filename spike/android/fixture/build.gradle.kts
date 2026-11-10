plugins { id("com.android.application") }
android {
    namespace = "dev.olea.fixture"
    compileSdk = 36
    defaultConfig { applicationId = "dev.olea.fixture"; minSdk = 26; targetSdk = 36; versionCode = 1; versionName = "0.1" }
    flavorDimensions += "runtime"
    productFlavors {
        create("baseline") { dimension = "runtime" }
        create("modern") { dimension = "runtime"; applicationId = "dev.olea.m2.fixture"; versionName = "0.2-m2" }
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
