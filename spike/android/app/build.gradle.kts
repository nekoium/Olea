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
        testInstrumentationRunner = "dev.olea.spike.SupervisionInstrumentation"
    }
    buildFeatures { buildConfig = true }
    flavorDimensions += "runtime"
    productFlavors {
        create("baseline") { dimension = "runtime"; buildConfigField("int", "BRIDGE_PORT", "8766"); buildConfigField("String", "FIXTURE_PACKAGE", "\"dev.olea.fixture\"") }
        create("modern") {
            dimension = "runtime"
            applicationId = providers.gradleProperty("m2Package").orElse("dev.olea.m2.runtime").get()
            targetSdk = 36
            versionName = "0.2-m2-modern"
            val bridgePort = providers.gradleProperty("m2BridgePort").orElse("8768").get().toInt()
            require(bridgePort in 1024..65535)
            buildConfigField("int", "BRIDGE_PORT", bridgePort.toString())
            buildConfigField("String", "FIXTURE_PACKAGE", "\"dev.olea.m2.fixture\"")
        }
    }
    packaging { jniLibs { useLegacyPackaging = true; keepDebugSymbols += "**/*.so" } }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
