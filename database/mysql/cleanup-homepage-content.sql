START TRANSACTION;

DELETE FROM hero_banners;
DELETE FROM catalogues;

UPDATE homepage_settings
SET setting_value = JSON_ARRAY()
WHERE setting_key = 'spotlight_product_ids';

COMMIT;
