package dev.olea.app

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import org.json.JSONObject

/** Exact Soft contract roles; palette and appearance are separate preferences. */
internal data class FlatColors(
    val surface: Color, val paper: Color, val ink: Color, val muted: Color,
    val line: Color, val accent: Color, val soft: Color, val keyboard: Color,
    val terminalBg: Color, val terminalInk: Color, val terminalAccent: Color,
    val terminalMuted: Color, val terminalKeys: Color, val terminalNotice: Color,
    val error: Color, val errorInk: Color, val warm: Color
) {
    fun terminalTheme(): String = JSONObject().apply {
        fun hex(color: Color) = "#%06x".format(color.toArgb() and 0xffffff)
        put("background", hex(terminalBg)); put("foreground", hex(terminalInk))
        put("cursor", hex(terminalAccent)); put("selectionBackground", hex(terminalNotice))
        put("black", hex(terminalBg)); put("white", hex(terminalInk))
        put("green", hex(terminalAccent)); put("brightGreen", hex(terminalAccent))
        put("brightBlack", hex(terminalMuted))
    }.toString()
}

internal data class SoftPalette(val id: String, val name: String, val description: String, val swatch: Color, val light: FlatColors, val dark: FlatColors)
private fun roles(values: String, dark: Boolean): FlatColors {
    val c = values.split(' ').map { Color(0xff000000 or it.toLong(16)) }
    return FlatColors(c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8], c[9], c[10], c[11], c[12], c[13],
        Color(if (dark) 0xff44313d else 0xfff5e9ec), Color(if (dark) 0xffe9b9c8 else 0xff865567), Color(if (dark) 0xff443c30 else 0xfff3eddf))
}
internal val softPalettes = listOf(
    SoftPalette("green", "Olea green", "Default · Leaf green", Color(0xff4f653b),
        roles("f8faf5 fffffc 30382b 626c59 e1e7d8 4f653b e9efdd dfe6d5 283220 eaf0de bed29b afbc9e 34422a 3e4d32", false),
        roles("272e23 313a2b eef2e5 b8c4a7 46533a bed29b 3d4a30 35432c 232d1d eaf0de bed29b afbc9e 303e26 3e4d32", true)),
    SoftPalette("purple", "Soft purple", "Quiet lavender", Color(0xff66518a),
        roles("faf9fc ffffff 302d3d 6a6476 e7e2ed 66518a eee9f5 e7e3ed 292532 e9e3f0 c4b0df a69ab6 342e3e 393142", false),
        roles("26232e 302c3b f0edf6 b5acc4 494153 ccbaea 3c334e 3c3548 25212e e9e3f0 c4b0df a69ab6 342e3e 393142", true)),
    SoftPalette("blue", "Dusty blue", "Soft cornflower", Color(0xff50668c),
        roles("f8f9fc ffffff 2d3441 5e697c e1e5ee 50668c e8edf7 e0e6f0 252d3b e5ecf6 b3c7eb a1afc5 303b4d 39455b", false),
        roles("232a36 2d3645 edf1f8 afbdd3 424f64 b3c7eb 374761 344158 202733 e5ecf6 b3c7eb a1afc5 303b4d 39455b", true)),
    SoftPalette("rose", "Rosewood", "Muted rose & plum", Color(0xff88566b),
        roles("fcf8f9 fffdfd 402f37 75616b eddee4 88566b f4e7ed ecdee5 34272e f2e4eb e0b4c6 bda4af 44323c 503b46", false),
        roles("30252b 3b2e35 f7edf1 ceb2be 59414c e0b4c6 503744 49333e 2c2127 f2e4eb e0b4c6 bda4af 44323c 503b46", true)),
    SoftPalette("ochre", "Ochre", "Old gold & parchment", Color(0xff80612c),
        roles("fcfaf5 fffef9 403629 72654f eae2d2 80612c f2ebd9 e9e1ce 332c20 f1eada d9c08b b9ac93 433a29 4e432f", false),
        roles("2e291f 393225 f5efe1 c6b99b 544831 dfc68f 4b3e29 453b28 29241a f1eada d9c08b b9ac93 433a29 4e432f", true)),
    SoftPalette("graphite", "Graphite", "Warm stone & charcoal", Color(0xff64615c),
        roles("faf9f7 fffefd 373531 6b6760 e6e2dc 64615c eeebe6 e4e0d9 2c2b28 edeae3 ccc6bb b0aba1 3b3935 46423d", false),
        roles("292825 34322e f2efe8 bfb9ad 4e4a43 d0cabe 46413a 3e3a34 252421 edeae3 ccc6bb b0aba1 3b3935 46423d", true))
)
internal fun softPalette(id: String?) = softPalettes.firstOrNull { it.id == id } ?: softPalettes.first()
internal val lightColors get() = softPalettes.first().light
internal val darkColors get() = softPalettes.first().dark
