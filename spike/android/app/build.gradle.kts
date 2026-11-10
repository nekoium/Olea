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
    buildFeatures { buildConfig = true }
    flavorDimensions += "runtime"
    productFlavors {
        create("baseline") { dimension = "runtime"; buildConfigField("int", "BRIDGE_PORT", "8766"); buildConfigField("String", "FIXTURE_PACKAGE", "\"dev.olea.fixture\"") }
        create("modern") {
            dimension = "runtime"
            applicationId = "dev.olea.m2.runtime"
            targetSdk = 36
            versionName = "0.2-m2-modern"
            buildConfigField("int", "BRIDGE_PORT", "8768")
            buildConfigField("String", "FIXTURE_PACKAGE", "\"dev.olea.m2.fixture\"")
        }
    }
    packaging { jniLibs { useLegacyPackaging = true; keepDebugSymbols += "**/*.so" } }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
