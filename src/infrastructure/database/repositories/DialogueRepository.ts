import { IDialogueRepository } from '@/domain/dialogue/interfaces/IDialogueRepository';
import { Dialogue, Conversation, NarrationSegment } from '@/domain/dialogue/types';
import { supabaseAdmin } from '@/lib/supabase';

export class DialogueRepository implements IDialogueRepository {
  async saveConversations(conversations: Conversation[]): Promise<void> {
    if (!conversations.length) return;
    
    const rows = conversations.map(c => ({
      id: c.id,
      book_id: c.bookId,
      chapter_id: c.chapterId,
      start_position: c.boundary.startPosition,
      end_position: c.boundary.endPosition,
      confidence_score: c.confidenceScore
    }));

    const { error } = await supabaseAdmin().from('conversations').insert(rows);
    if (error) throw new Error(error.message);

    // Save participants
    const parts = conversations.flatMap(c => c.participants.map(p => ({
      conversation_id: c.id,
      character_id: p.characterId
    })));
    if (parts.length > 0) {
      const { error: pErr } = await supabaseAdmin().from('conversation_participants').insert(parts);
      if (pErr) throw new Error(pErr.message);
    }
    
    // Save turns
    const turns = conversations.flatMap(c => c.turns.map(t => ({
      conversation_id: c.id,
      dialogue_id: t.dialogueId,
      turn_index: t.turnIndex
    })));
    if (turns.length > 0) {
      const { error: tErr } = await supabaseAdmin().from('conversation_turns').insert(turns);
      if (tErr) throw new Error(tErr.message);
    }
  }

  async saveDialogues(dialogues: Dialogue[]): Promise<void> {
    if (!dialogues.length) return;
    
    const rows = dialogues.map(d => ({
      id: d.id,
      book_id: d.bookId,
      chapter_id: d.chapterId,
      conversation_id: d.conversationId || null,
      dialogue_text: d.dialogueText,
      start_position: d.boundary.startPosition,
      end_position: d.boundary.endPosition,
      confidence_score: d.confidenceScore
    }));

    const { error } = await supabaseAdmin().from('dialogues').insert(rows);
    if (error) throw new Error(error.message);

    // Save Speakers
    const speakers = dialogues.filter(d => d.speaker).map(d => ({
      dialogue_id: d.id,
      character_id: d.speaker!.characterId,
      confidence_score: d.speaker!.confidenceScore,
      evidence: d.speaker!.evidence.evidenceText
    }));
    if (speakers.length > 0) {
      const { error: sErr } = await supabaseAdmin().from('dialogue_speakers').insert(speakers);
      if (sErr) throw new Error(sErr.message);
    }

    // Save Listeners
    const listeners = dialogues.flatMap(d => d.listeners.map(l => ({
      dialogue_id: d.id,
      character_id: l.characterId,
      confidence_score: l.confidenceScore,
      evidence: l.evidence.evidenceText
    })));
    if (listeners.length > 0) {
      const { error: lErr } = await supabaseAdmin().from('dialogue_listeners').insert(listeners);
      if (lErr) throw new Error(lErr.message);
    }
    
    // Save Segments
    const segments = dialogues.flatMap(d => d.segments.map(s => ({
      dialogue_id: d.id,
      segment_text: s.segmentText,
      start_position: s.boundary.startPosition,
      end_position: s.boundary.endPosition
    })));
    if (segments.length > 0) {
      const { error: segErr } = await supabaseAdmin().from('dialogue_segments').insert(segments);
      if (segErr) throw new Error(segErr.message);
    }
  }

  async saveNarrationSegments(segments: NarrationSegment[]): Promise<void> {
    // Currently relying on Dialogue table for tracking everything.
    // In Phase 4 Narration, we will persist this to `narration_blocks`.
    // Skipping physical DB insert for narration right now.
  }

  async clearChapterData(chapterId: string): Promise<void> {
    const { error } = await supabaseAdmin().from('conversations').delete().eq('chapter_id', chapterId);
    if (error) throw new Error(error.message);
    
    const { error: dErr } = await supabaseAdmin().from('dialogues').delete().eq('chapter_id', chapterId);
    if (dErr) throw new Error(dErr.message);
  }
}
