plugins { id("com.android.application") }
val runtimeAbi = providers.gradleProperty("oleaAbi").getOrElse("x86_64")
require(runtimeAbi in setOf("x86_64", "arm64-v8a")) { "Unsupported oleaAbi: $runtimeAbi" }
android {
    buildFeatures { buildConfig = true }
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
    androidResources { noCompress += "bin" }
    packaging { jniLibs { useLegacyPackaging = true; keepDebugSymbols += "**/*.so" } }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
tasks.named("preBuild") {
    doFirst {
        val packagedAbi = file("src/main/assets/runtime-abi.txt")
        check(packagedAbi.isFile && packagedAbi.readText().trim() == runtimeAbi) {
            "Runtime assets do not match $runtimeAbi. Run runtime/build.sh with OLEA_ABI=$runtimeAbi."
        }
    }
}
