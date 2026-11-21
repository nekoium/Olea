package dev.olea.app

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

internal fun displayConversationState(state: String) = when (state) {
    "needs_you" -> "Needs you"; "opening" -> "Opening"; "working" -> "Working"
    "done" -> "Done"; "stopped" -> "Stopped"; "error" -> "Error"; "ready" -> "Ready"; else -> "Saved"
}

@Composable internal fun ConversationRow(title: String, identity: String, preview: String, state: String, open: () -> Unit) {
    Column(Modifier.fillMaxWidth().clickable(role = Role.Button, onClick = open).padding(vertical = 17.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Label(title, Modifier.weight(1f), bold = true, maxLines = 2)
            Chip(state)
        }
        if (preview.isNotBlank()) Label(preview, size = 12, muted = true, maxLines = 2)
        Label(identity, size = 10, muted = true)
    }
    Divider()
}

@Composable internal fun DraftChoice(label: String, value: String, modifier: Modifier, choose: () -> Unit) {
    Column(modifier.heightIn(min = 48.dp).clip(RoundedCornerShape(12.dp)).clickable(role = Role.Button, onClick = choose)
        .semantics { contentDescription = "Choose ${label.lowercase()}" }, verticalArrangement = Arrangement.Center) {
        Label(label, size = 9, muted = true)
        Label("$value ⌄", size = 12, color = LocalFlat.current.accent, maxLines = 2)
    }
}

internal data class ReplyBlock(val text: String, val code: Boolean = false, val heading: Boolean = false)
/** Bounded presentation parser; unsupported Markdown remains readable literal text. */
internal fun replyBlocks(text: String): List<ReplyBlock> {
    val blocks = mutableListOf<ReplyBlock>()
    var code = false
    val pending = StringBuilder()
    fun flush() { if (pending.isNotEmpty()) { blocks.add(ReplyBlock(pending.toString().trimEnd('\n'), code)); pending.clear() } }
    text.lineSequence().forEach { line ->
        when {
            line.startsWith("```") -> { flush(); code = !code }
            code -> pending.append(line).append('\n')
            line.isBlank() -> flush()
            Regex("^#{1,6} .+").matches(line) -> { flush(); blocks.add(ReplyBlock(line.substringAfter(' '), heading = true)) }
            else -> pending.append(line).append('\n')
        }
    }
    flush()
    return blocks
}

@Composable internal fun ReplyBody(text: String) {
    val colors = LocalFlat.current
    val blocks = remember(text) { replyBlocks(text) }
    Column(verticalArrangement = Arrangement.spacedBy(15.dp)) {
        blocks.forEach { block ->
            if (block.code) Label(block.text, Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(colors.paper).padding(16.dp), size = 12, mono = true)
            else {
                val rich = buildAnnotatedString {
                    val tokens = Regex("\\*\\*(.+?)\\*\\*|`([^`]+)`").findAll(block.text)
                    var last = 0
                    for (token in tokens) {
                        append(block.text.substring(last, token.range.first))
                        val start = length
                        val bold = token.groupValues[1].isNotEmpty()
                        append(if (bold) token.groupValues[1] else token.groupValues[2])
                        addStyle(if (bold) SpanStyle(fontWeight = FontWeight.SemiBold) else SpanStyle(fontFamily = FontFamily.Monospace, color = colors.accent, background = colors.soft), start, length)
                        last = token.range.last + 1
                    }
                    append(block.text.substring(last))
                }
                BasicText(rich, style = TextStyle(color = colors.ink, fontFamily = FontFamily.SansSerif, fontSize = if (block.heading) 19.sp else 14.sp,
                    lineHeight = if (block.heading) 27.sp else 25.2.sp, fontWeight = if (block.heading) FontWeight.SemiBold else FontWeight.Normal))
            }
        }
    }
}
