package dev.olea.app

import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight

/** Unmodified OFL Cabin: real upright weights, normal width; Android supplies missing glyphs. */
@OptIn(androidx.compose.ui.text.ExperimentalTextApi::class)
internal val SoftFontFamily = FontFamily(
    listOf(FontWeight.Normal, FontWeight.Medium, FontWeight.SemiBold, FontWeight.Bold).map { weight ->
        Font(R.font.cabin_variable, weight = weight,
            variationSettings = FontVariation.Settings(FontVariation.weight(weight.weight), FontVariation.width(100f)))
    }
)
