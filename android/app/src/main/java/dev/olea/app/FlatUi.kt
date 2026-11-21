package dev.olea.app

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.*
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

internal val LocalFlat = staticCompositionLocalOf { lightColors }

@Composable internal fun Label(text: String, modifier: Modifier = Modifier, size: Int = 14, muted: Boolean = false, bold: Boolean = false, color: Color? = null, mono: Boolean = false, maxLines: Int = Int.MAX_VALUE, textAlign: androidx.compose.ui.text.style.TextAlign = androidx.compose.ui.text.style.TextAlign.Unspecified) {
    val colors = LocalFlat.current
    BasicText(text, modifier, style = TextStyle(color = color ?: if (muted) colors.muted else colors.ink,
        fontSize = size.sp, lineHeight = (size * if (mono) 1.8 else 1.6).sp, textAlign = textAlign,
        fontWeight = if (bold) FontWeight.SemiBold else FontWeight.Normal,
        fontFamily = if (mono) FontFamily.Monospace else FontFamily.SansSerif), maxLines = maxLines, overflow = TextOverflow.Ellipsis)
}

@Composable internal fun Action(text: String, modifier: Modifier = Modifier, primary: Boolean = false, enabled: Boolean = true, description: String = text, compact: Boolean = false, onClick: () -> Unit) {
    val colors = LocalFlat.current
    Box(modifier.then(if (primary) Modifier.fillMaxWidth() else Modifier).defaultMinSize(minWidth = 48.dp, minHeight = 48.dp).clip(RoundedCornerShape(14.dp))
        .background(if (primary) if (enabled) colors.accent else colors.soft else Color.Transparent)
        .clickable(enabled = enabled, role = Role.Button, onClick = onClick)
        .semantics { contentDescription = description }
        .padding(horizontal = if (compact) 4.dp else 16.dp, vertical = 11.dp), contentAlignment = Alignment.Center) {
        Label(text, size = 13, color = if (!enabled) colors.muted else if (primary) colors.surface else colors.accent, bold = primary)
    }
}

/** Small drawn icons avoid font-dependent symbol shapes and add no font dependency. */
@Composable internal fun SoftIcon(name: String, modifier: Modifier = Modifier, color: Color = LocalFlat.current.ink) {
    Canvas(modifier.size(21.dp)) {
        val scale = size.width / 24f
        fun line(x1: Float, y1: Float, x2: Float, y2: Float) = drawLine(color, Offset(x1 * scale, y1 * scale), Offset(x2 * scale, y2 * scale), 1.7f * scale, androidx.compose.ui.graphics.StrokeCap.Round)
        fun path(vararg points: Pair<Float, Float>, close: Boolean = false) {
            val p = Path().apply { moveTo(points[0].first * scale, points[0].second * scale); points.drop(1).forEach { lineTo(it.first * scale, it.second * scale) }; if (close) close() }
            drawPath(p, color, style = Stroke(1.7f * scale))
        }
        when (name) {
            "☰" -> { line(4f, 7f, 20f, 7f); line(4f, 12f, 20f, 12f); line(4f, 17f, 20f, 17f) }
            "＋" -> { line(12f, 4f, 12f, 20f); line(4f, 12f, 20f, 12f) }
            "‹" -> path(15f to 5f, 8f to 12f, 15f to 19f)
            "×" -> { line(6f, 6f, 18f, 18f); line(18f, 6f, 6f, 18f) }
            "↑" -> { line(12f, 19f, 12f, 5f); path(6f to 11f, 12f to 5f, 18f to 11f) }
            "chat" -> path(4f to 4f, 20f to 4f, 20f to 16f, 9f to 16f, 4f to 20f, 4f to 4f)
            "folder" -> path(3f to 6f, 10f to 6f, 12f to 9f, 21f to 9f, 21f to 20f, 3f to 20f, 3f to 6f)
            "⋯" -> listOf(5f, 12f, 19f).forEach { drawCircle(color, 1.2f * scale, Offset(it * scale, 12 * scale)) }
            else -> { line(5f, 7f, 10f, 12f); line(10f, 12f, 5f, 17f); line(13f, 17f, 20f, 17f) }
        }
    }
}

@Composable internal fun Glyph(text: String, description: String, onClick: () -> Unit) {
    Box(Modifier.size(48.dp).clip(CircleShape).clickable(role = Role.Button, onClick = onClick).semantics { contentDescription = description }, contentAlignment = Alignment.Center) {
        SoftIcon(text)
    }
}

@Composable internal fun Choice(title: String, detail: String = "", status: String = "", selected: Boolean? = null, onClick: () -> Unit) {
    val colors = LocalFlat.current
    val selection = if (selected != null) Modifier.selectable(selected, role = Role.RadioButton, onClick = onClick) else Modifier.clickable(role = Role.Button, onClick = onClick)
    Column(Modifier.fillMaxWidth()) {
        Row(Modifier.fillMaxWidth().defaultMinSize(minHeight = 64.dp).clip(RoundedCornerShape(12.dp))
            .background(if (selected == true) colors.soft else Color.Transparent).then(selection)
            .padding(horizontal = if (selected == true) 12.dp else 0.dp, vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Column(Modifier.weight(1f)) { Label(title, bold = true); if (detail.isNotBlank()) Label(detail, Modifier.padding(top = 4.dp), size = 11, muted = true) }
            if (selected != null) Label(if (selected) "✓" else "○", size = 17, color = colors.accent)
            else if (status.isNotBlank()) Chip(status) else Label("›", size = 19, muted = true)
        }
        Divider()
    }
}

@Composable internal fun PreferenceChoice(title: String, selected: Boolean, onClick: () -> Unit) {
    Column {
        Row(Modifier.fillMaxWidth().heightIn(min = 48.dp).selectable(selected, role = Role.RadioButton, onClick = onClick).padding(vertical = 14.dp), verticalAlignment = Alignment.CenterVertically) {
            Label(title, Modifier.weight(1f), bold = true)
            if (selected) Label("✓", color = LocalFlat.current.accent)
        }
        Divider()
    }
}

@Composable internal fun SoftCard(modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    Column(modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(LocalFlat.current.paper).padding(17.dp), verticalArrangement = Arrangement.spacedBy(10.dp), content = content)
}

@Composable internal fun SectionLabel(text: String) { Label(text, Modifier.padding(top = 12.dp), size = 12, muted = true, bold = true) }

@Composable internal fun Chip(text: String) {
    val colors = LocalFlat.current
    val error = text.equals("Error", true) || text.equals("Failed", true)
    val needs = text.equals("Needs you", true)
    Label(text, Modifier.clip(RoundedCornerShape(14.dp)).background(if (error) colors.error else if (needs) colors.warm else colors.soft)
        .padding(horizontal = 8.dp, vertical = 5.dp), size = 10, color = if (error) colors.errorInk else colors.accent)
}

@Composable internal fun Notice(text: String, error: Boolean = false) {
    val colors = LocalFlat.current
    Label(text, Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(if (error) colors.error else colors.soft).padding(16.dp)
        .semantics { liveRegion = LiveRegionMode.Polite }, size = 13, color = if (error) colors.errorInk else colors.ink)
}

@Composable internal fun Field(label: String, value: String, onChange: (String) -> Unit, placeholder: String = "", secret: Boolean = false, multiline: Boolean = false, modifier: Modifier = Modifier) {
    val colors = LocalFlat.current
    Column(modifier, verticalArrangement = Arrangement.spacedBy(9.dp)) {
        Label(label, size = 12, bold = true)
        BasicTextField(value, onChange, Modifier.fillMaxWidth().defaultMinSize(minHeight = 48.dp).clip(RoundedCornerShape(12.dp))
            .background(colors.paper).padding(13.dp).semantics { contentDescription = label },
            textStyle = TextStyle(color = colors.ink, fontSize = 13.sp, lineHeight = 20.sp), cursorBrush = SolidColor(colors.accent),
            singleLine = !multiline, maxLines = if (multiline) 6 else 1,
            visualTransformation = if (secret) PasswordVisualTransformation() else VisualTransformation.None,
            keyboardOptions = KeyboardOptions(keyboardType = if (secret || label == "API key") KeyboardType.Password else KeyboardType.Text, autoCorrectEnabled = !secret && label != "API key"),
            decorationBox = { inner -> Box { if (value.isEmpty()) Label(placeholder, size = 13, muted = true); inner() } })
    }
}

@Composable internal fun PaletteChoices(selected: String, choose: (String) -> Unit) {
    val colors = LocalFlat.current
    Column(Modifier.selectableGroup(), verticalArrangement = Arrangement.spacedBy(9.dp)) {
        softPalettes.chunked(2).forEach { pair ->
            Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                pair.forEach { palette ->
                    val active = softPalette(selected).id == palette.id
                    Row(Modifier.weight(1f).heightIn(min = 83.dp).clip(RoundedCornerShape(16.dp))
                        .background(if (active) colors.soft else colors.paper)
                        .then(if (active) Modifier.border(1.dp, colors.accent, RoundedCornerShape(16.dp)) else Modifier)
                        .selectable(active, role = Role.RadioButton, onClick = { choose(palette.id) })
                        .semantics(mergeDescendants = true) { contentDescription = palette.name }
                        .padding(horizontal = 10.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Box(Modifier.size(21.dp).clip(CircleShape).background(palette.swatch))
                        Column(Modifier.weight(1f)) { Label(palette.name, size = 12, bold = true); Label(palette.description, size = 9, muted = true) }
                        if (active) Label("✓", color = colors.accent)
                    }
                }
            }
        }
    }
}

@Composable internal fun Destination(text: String, icon: String, selected: Boolean, modifier: Modifier = Modifier, onClick: () -> Unit) {
    val colors = LocalFlat.current
    Box(modifier.heightIn(min = 53.dp).clickable(role = Role.Button, onClick = onClick).semantics { this.selected = selected }, contentAlignment = Alignment.Center) {
        Row(Modifier.clip(RoundedCornerShape(20.dp)).background(if (selected) colors.soft else Color.Transparent).padding(horizontal = 13.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            SoftIcon(icon, Modifier.size(17.dp), if (selected) colors.accent else colors.muted)
            Label(text, size = 11, color = if (selected) colors.accent else colors.muted, bold = selected)
        }
    }
}

@Composable internal fun Divider() { Box(Modifier.fillMaxWidth().height(1.dp).background(LocalFlat.current.line)) }
