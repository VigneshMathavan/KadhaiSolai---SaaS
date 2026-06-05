$Queries = @(
"EXPLAIN ANALYZE SELECT d.id FROM books b JOIN chapters c ON c.book_id = b.id JOIN dialogues d ON d.chapter_id = c.id WHERE b.id = '00000000-0000-0000-0000-000000000000';",
"EXPLAIN ANALYZE SELECT dl.id FROM books b JOIN training_corpora tc ON tc.book_id = b.id JOIN training_samples ts ON ts.corpus_id = tc.id JOIN dataset_lineage dl ON dl.sample_id = ts.id WHERE b.id = '00000000-0000-0000-0000-000000000000';",
"EXPLAIN ANALYZE SELECT r.id FROM characters c JOIN character_mentions cm ON cm.character_id = c.id JOIN character_relationships r ON r.character_a_id = c.id WHERE c.id = '00000000-0000-0000-0000-000000000000';"
)

foreach ($q in $Queries) {
    Write-Host "Running: $q"
    docker exec supabase_db_kadhaisolai-saas psql -U postgres -d postgres -c "$q"
    Write-Host "---------------------------------"
}
