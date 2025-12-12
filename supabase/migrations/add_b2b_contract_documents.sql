-- Migration for B2B Contract Management (B2B.8)
-- Adds contract documents table for storing PDFs and documents

-- Table for contract documents
CREATE TABLE IF NOT EXISTS b2b_contract_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  b2b_account_id UUID REFERENCES b2b_accounts(id) ON DELETE CASCADE NOT NULL,
  document_type VARCHAR(50) DEFAULT 'contract' CHECK (document_type IN ('contract', 'amendment', 'terms', 'nda', 'other')),
  document_name VARCHAR(200) NOT NULL,
  document_url TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  mime_type VARCHAR(100),
  version VARCHAR(20),
  signed_date DATE,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_b2b_contract_documents_account ON b2b_contract_documents(b2b_account_id);
CREATE INDEX IF NOT EXISTS idx_b2b_contract_documents_type ON b2b_contract_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_b2b_contract_documents_active ON b2b_contract_documents(is_active);

-- RLS Policies for contract documents
ALTER TABLE b2b_contract_documents ENABLE ROW LEVEL SECURITY;

-- Account owners can view their contract documents
CREATE POLICY "Account owners can view contract documents"
  ON b2b_contract_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM b2b_accounts
      WHERE b2b_accounts.id = b2b_contract_documents.b2b_account_id
      AND b2b_accounts.user_id = auth.uid()
    )
  );

-- Admins can manage all contract documents
CREATE POLICY "Admins can manage contract documents"
  ON b2b_contract_documents FOR ALL
  USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_b2b_contract_documents_updated_at
  BEFORE UPDATE ON b2b_contract_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_b2b_updated_at();
