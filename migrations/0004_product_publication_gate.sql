-- Fail-closed publication state. Existing rows remain private until reviewed.
ALTER TABLE products ADD COLUMN workflow_status TEXT NOT NULL DEFAULT 'NEEDS_REVIEW'
  CHECK (workflow_status IN ('DRAFT', 'NEEDS_REVIEW', 'PUBLISHED', 'ARCHIVED'));
ALTER TABLE products ADD COLUMN qa_status TEXT NOT NULL DEFAULT 'PENDING'
  CHECK (qa_status IN ('PENDING', 'PASS', 'FAIL'));
CREATE INDEX IF NOT EXISTS idx_products_publication_gate
  ON products(is_active, is_visible, workflow_status, qa_status);
