plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.plugin.compose")
}
val runtimeAbi = providers.gradleProperty("oleaAbi").getOrElse("x86_64")
require(runtimeAbi in setOf("x86_64", "arm64-v8a")) { "Unsupported oleaAbi: $runtimeAbi" }
val releaseStore = providers.environmentVariable("OLEA_SIGNING_STORE_FILE").orNull
android {
    buildFeatures { buildConfig = true; compose = true }
    namespace = "dev.olea.app"
    compileSdk = 36
    defaultConfig {
        applicationId = "dev.olea.app"
        minSdk = 26
        targetSdk = 36
        versionCode = 6
        versionName = "0.2-base"
        testInstrumentationRunner = "dev.olea.app.CoreInstrumentation"
        buildConfigField("String", "RUNTIME_ABI", "\"$runtimeAbi\"")
        ndk { abiFilters += runtimeAbi }
    }
    signingConfigs {
        create("oleaRelease") {
            storeFile = releaseStore?.let { file(it) }
            storePassword = providers.environmentVariable("OLEA_SIGNING_STORE_PASSWORD").orNull
            keyAlias = providers.environmentVariable("OLEA_SIGNING_KEY_ALIAS").orNull
            keyPassword = providers.environmentVariable("OLEA_SIGNING_KEY_PASSWORD").orNull
            storeType = "PKCS12"
        }
    }
    buildTypes { getByName("release") { signingConfig = signingConfigs.getByName("oleaRelease") } }
    androidResources { noCompress += "bin" }
    packaging { jniLibs { useLegacyPackaging = true; keepDebugSymbols += "**/*.so" } }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
dependencies {
    implementation(platform("androidx.compose:compose-bom:2025.08.01"))
    implementation("androidx.activity:activity-compose:1.11.0")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    debugImplementation("androidx.compose.ui:ui-tooling")
}

tasks.named("preBuild") {
    doFirst {
        val packagedAbi = file("src/main/assets/runtime-abi.txt")
        check(packagedAbi.isFile && packagedAbi.readText().trim() == runtimeAbi) {
            "Runtime assets do not match $runtimeAbi. Run runtime/build.sh with OLEA_ABI=$runtimeAbi."
        }
    }
}
