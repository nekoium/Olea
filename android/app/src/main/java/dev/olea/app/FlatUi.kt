package dev.olea.app

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.*
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

internal data class FlatColors(val surface: Color, val panel: Color, val ink: Color, val muted: Color, val accent: Color, val line: Color, val tool: Color, val error: Color, val errorInk: Color)
internal val LocalFlat = staticCompositionLocalOf { lightColors }
internal val lightColors = FlatColors(Color(0xfffafbf8), Color(0xffe6e9df), Color(0xff242c22), Color(0xff58634f), Color(0xff415739), Color(0xffcbd2c2), Color(0xfff0f2eb), Color(0xfff4e9e5), Color(0xff795b54))
internal val darkColors = FlatColors(Color(0xff202620), Color(0xff2b332a), Color(0xffe4e9df), Color(0xffafbbaa), Color(0xffafc69f), Color(0xff465142), Color(0xff262e25), Color(0xff392b29), Color(0xffe1c0b8))

@Composable internal fun Label(text: String, modifier: Modifier = Modifier, size: Int = 15, muted: Boolean = false, bold: Boolean = false, color: Color? = null, mono: Boolean = false, maxLines: Int = Int.MAX_VALUE) {
    val colors = LocalFlat.current
    BasicText(text, modifier, style = TextStyle(color = color ?: if (muted) colors.muted else colors.ink, fontSize = size.sp, lineHeight = (size * 1.45).sp, fontWeight = if (bold) FontWeight.SemiBold else FontWeight.Normal, fontFamily = if (mono) FontFamily.Monospace else FontFamily.SansSerif), maxLines = maxLines, overflow = TextOverflow.Ellipsis)
}
@Composable internal fun Action(text: String, modifier: Modifier = Modifier, primary: Boolean = false, enabled: Boolean = true, description: String = text, compact: Boolean = false, onClick: () -> Unit) {
    val colors = LocalFlat.current
    val shape = RoundedCornerShape(10.dp)
    Box(modifier.defaultMinSize(minWidth = 48.dp, minHeight = 48.dp).clip(shape)
        .background(if (primary) colors.accent.copy(alpha = if (enabled) 1f else .35f) else Color.Transparent)
        .then(if (!primary) Modifier.border(1.dp, colors.line, shape) else Modifier)
        .clickable(enabled = enabled, role = Role.Button, onClick = onClick)
        .semantics { contentDescription = description }
        .padding(horizontal = if (compact) 4.dp else 14.dp, vertical = 11.dp), contentAlignment = Alignment.Center) {
        Label(text, size = 14, color = if (!enabled) colors.muted else if (primary) colors.surface else colors.ink, bold = primary)
    }
}
@Composable internal fun Glyph(text: String, description: String, onClick: () -> Unit) {
    Box(Modifier.size(48.dp).clip(RoundedCornerShape(10.dp)).clickable(role = Role.Button, onClick = onClick).semantics { contentDescription = description }, contentAlignment = Alignment.Center) { Label(text, size = 24) }
}
@Composable internal fun Choice(title: String, detail: String = "", status: String = "", selected: Boolean = false, onClick: () -> Unit) {
    val colors = LocalFlat.current
    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(if (selected) colors.tool else colors.surface)
        .border(1.dp, if (selected) colors.accent else colors.line, RoundedCornerShape(12.dp))
        .clickable(role = Role.Button, onClick = onClick).semantics { this.selected = selected }.padding(14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Column(Modifier.weight(1f)) { Label(title, bold = true); if (detail.isNotBlank()) Label(detail, size = 12, muted = true) }
        if (status.isNotBlank()) Chip(status) else Label("›", size = 22, muted = true)
    }
}
@Composable internal fun Chip(text: String) {
    val colors = LocalFlat.current
    val error = text.equals("Error", true) || text.equals("Failed", true)
    Label(text, Modifier.clip(RoundedCornerShape(20.dp)).background(if (error) colors.error else colors.panel).padding(horizontal = 9.dp, vertical = 4.dp), size = 11, color = if (error) colors.errorInk else colors.muted)
}
@Composable internal fun Notice(text: String, error: Boolean = false) {
    val colors = LocalFlat.current
    Label(text, Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(if (error) colors.error else colors.panel).padding(14.dp).semantics { liveRegion = LiveRegionMode.Polite }, size = 14, color = if (error) colors.errorInk else colors.ink)
}
@Composable internal fun Field(label: String, value: String, onChange: (String) -> Unit, placeholder: String = "", secret: Boolean = false, multiline: Boolean = false, modifier: Modifier = Modifier) {
    val colors = LocalFlat.current
    Column(modifier, verticalArrangement = Arrangement.spacedBy(5.dp)) {
        Label(label, size = 12, muted = true)
        BasicTextField(value, onChange, Modifier.fillMaxWidth().defaultMinSize(minHeight = 48.dp)
            .border(1.dp, colors.line, RoundedCornerShape(10.dp)).padding(12.dp).semantics { contentDescription = label },
            textStyle = TextStyle(color = colors.ink, fontSize = 15.sp, lineHeight = 22.sp), cursorBrush = SolidColor(colors.accent),
            singleLine = !multiline, maxLines = if (multiline) 6 else 1,
            visualTransformation = if (secret) PasswordVisualTransformation() else VisualTransformation.None,
            keyboardOptions = KeyboardOptions(keyboardType = if (secret || label == "API key") KeyboardType.Password else KeyboardType.Text, autoCorrectEnabled = !secret && label != "API key"),
            decorationBox = { inner -> Box { if (value.isEmpty()) Label(placeholder, muted = true); inner() } })
    }
}
@Composable internal fun Divider() { Box(Modifier.fillMaxWidth().height(1.dp).background(LocalFlat.current.line)) }
