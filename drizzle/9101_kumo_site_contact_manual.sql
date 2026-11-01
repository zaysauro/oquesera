-- Kumo One: public contact details per website, rendered by the site footer
-- and filled by the website templates. Idempotent.
ALTER TABLE site_branding ADD COLUMN IF NOT EXISTS contact_email varchar(255);
ALTER TABLE site_branding ADD COLUMN IF NOT EXISTS contact_phone varchar(50);
ALTER TABLE site_branding ADD COLUMN IF NOT EXISTS contact_whatsapp varchar(50);
ALTER TABLE site_branding ADD COLUMN IF NOT EXISTS contact_address text;
