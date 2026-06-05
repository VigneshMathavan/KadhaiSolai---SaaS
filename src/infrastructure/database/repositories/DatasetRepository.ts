import { IDatasetRepository } from '@/domain/dataset/interfaces/IDatasetRepository';
import { TrainingCorpus, DatasetVersion, DatasetExport, DatasetManifest, DatasetRegistry, DatasetQualityReport, DatasetBalanceReport, DatasetCoverageReport, TrainingSampleLineage, CorpusLineageReport, DatasetVersionDiff, TrainingUsageRecord, CorpusTrainingHistory } from '@/domain/dataset/types';
import { supabaseAdmin } from '@/lib/supabase';

export class DatasetRepository implements IDatasetRepository {
  async saveCorpus(corpus: TrainingCorpus): Promise<void> {
    const { error: cErr } = await supabaseAdmin().from('training_corpora').insert({
       id: corpus.id,
       book_id: corpus.bookId,
       version_id: corpus.versionId,
       total_samples: corpus.totalSamples,
       quality_score: corpus.qualityScore
    });
    if (cErr) throw new Error(`Corpus insert failed: ${cErr.message}`);

    if (corpus.samples.length > 0) {
       const rows = corpus.samples.map(s => ({
          id: s.id,
          corpus_id: corpus.id,
          sample_id: s.sampleId,
          text: s.text,
          speaker: s.speaker,
          emotion: s.emotion,
          emotion_intensity: s.emotionIntensity,
          emotion_persistence: s.emotionPersistence,
          pacing: s.pacing,
          pauses: s.pauses,
          emphasis: s.emphasis,
          narrative_arc: s.narrativeArc,
          directorial_intent: s.directorialIntent,
          voice_archetype: s.voiceArchetype,
          metadata: s.metadata
       }));
       const { error: sErr } = await supabaseAdmin().from('training_samples').insert(rows);
       if (sErr) throw new Error(`Samples insert failed: ${sErr.message}`);
    }
  }

  async saveVersion(version: DatasetVersion): Promise<void> {
    const { error } = await supabaseAdmin().from('dataset_versions').insert({
       id: version.id,
       book_id: version.bookId,
       version_tag: version.versionTag,
       diff_metadata: version.diffMetadata
    });
    if (error) throw new Error(`Version insert failed: ${error.message}`);
  }

  async saveExports(exportsData: DatasetExport[]): Promise<void> {
    if (exportsData.length === 0) return;
    const rows = exportsData.map(e => ({
       id: e.id,
       corpus_id: e.corpusId,
       export_format: e.exportFormat,
       export_profile: e.exportProfile,
       path: e.path
    }));
    const { error } = await supabaseAdmin().from('dataset_exports').insert(rows);
    if (error) throw new Error(`Exports insert failed: ${error.message}`);
  }

  async saveManifest(manifest: DatasetManifest): Promise<void> {
    const { error } = await supabaseAdmin().from('dataset_manifests').insert({
       id: manifest.id,
       version_id: manifest.versionId,
       manifest_data: manifest.manifestData
    });
    if (error) throw new Error(`Manifest insert failed: ${error.message}`);
  }

  async saveRegistry(registry: DatasetRegistry): Promise<void> {
    const { error } = await supabaseAdmin().from('dataset_registry').insert({
       id: registry.id,
       book_id: registry.bookId,
       registry_snapshot: registry.registrySnapshot
    });
    if (error) throw new Error(`Registry insert failed: ${error.message}`);
  }

  async saveQualityReport(report: DatasetQualityReport): Promise<void> {
    const { error } = await supabaseAdmin().from('dataset_quality_reports').insert({
       id: report.id,
       corpus_id: report.corpusId,
       quality_score: report.qualityScore,
       reasoning: report.reasoning
    });
    if (error) throw new Error(`Quality report insert failed: ${error.message}`);
  }

  async saveBalanceReport(report: DatasetBalanceReport): Promise<void> {
    const { error } = await supabaseAdmin().from('dataset_balance_reports').insert({
       id: report.id,
       corpus_id: report.corpusId,
       balance_score: report.balanceScore,
       recommendations: report.recommendations
    });
    if (error) throw new Error(`Balance report insert failed: ${error.message}`);
  }

  async saveCoverageReport(report: DatasetCoverageReport): Promise<void> {
    const { error } = await supabaseAdmin().from('dataset_coverage_reports').insert({
       id: report.id,
       corpus_id: report.corpusId,
       coverage_score: report.coverageScore,
       gaps: report.gaps
    });
    if (error) throw new Error(`Coverage report insert failed: ${error.message}`);
  }

  async saveLineageData(lineages: TrainingSampleLineage[]): Promise<void> {
    if (lineages.length === 0) return;
    const rows = lineages.map(l => ({
       id: l.id,
       sample_id: l.sampleId,
       book_id: l.bookId,
       chapter_id: l.chapterId,
       scene_id: l.sceneId,
       dialogue_id: l.dialogueId,
       character_id: l.characterId,
       emotion_id: l.emotionId,
       narration_id: l.narrationId,
       director_decision_id: l.directorDecisionId,
       dataset_version_id: l.datasetVersionId,
       corpus_version_id: l.corpusVersionId,
       trace_id: l.traceId
    }));
    const { error } = await supabaseAdmin().from('dataset_lineage').insert(rows);
    if (error) throw new Error(`Lineage insert failed: ${error.message}`);
  }

  async saveCorpusLineageReport(report: CorpusLineageReport): Promise<void> {
    const { error } = await supabaseAdmin().from('corpus_lineage_reports').insert({
       id: report.id,
       corpus_id: report.corpusId,
       lineage_coverage: report.lineageCoverage,
       missing_links: report.missingLinks,
       broken_references: report.brokenReferences,
       orphan_samples: report.orphanSamples
    });
    if (error) throw new Error(`Corpus lineage report insert failed: ${error.message}`);
  }

  async saveVersionDiff(diff: DatasetVersionDiff): Promise<void> {
    const { error } = await supabaseAdmin().from('version_diffs').insert({
       id: diff.id,
       previous_version_id: diff.previousVersionId,
       current_version_id: diff.currentVersionId,
       diff_data: diff
    });
    if (error) throw new Error(`Version diff insert failed: ${error.message}`);
  }

  async saveTrainingUsage(usage: TrainingUsageRecord): Promise<void> {
    const { error } = await supabaseAdmin().from('training_usage').insert({
       id: usage.id,
       corpus_id: usage.corpusId,
       model_id: usage.modelId,
       usage_type: usage.usageType
    });
    if (error) throw new Error(`Training usage insert failed: ${error.message}`);
  }

  async saveTrainingHistory(history: CorpusTrainingHistory): Promise<void> {
    const { error } = await supabaseAdmin().from('training_history').insert({
       id: history.id,
       model_id: history.modelId,
       history_metadata: history.historyMetadata
    });
    if (error) throw new Error(`Training history insert failed: ${error.message}`);
  }
}
