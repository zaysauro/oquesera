-- Kumo One: new CRM deals/proposals/contracts and store settings default to
-- Brazilian reals. Existing rows keep whatever currency they were created
-- with — this only changes the column default. Idempotent.
ALTER TABLE crm_deals ALTER COLUMN currency SET DEFAULT 'BRL';
ALTER TABLE crm_proposals ALTER COLUMN currency SET DEFAULT 'BRL';
ALTER TABLE crm_contracts ALTER COLUMN currency SET DEFAULT 'BRL';
ALTER TABLE store_settings ALTER COLUMN currency SET DEFAULT 'BRL';
