-- 1. Supprimer les duplicatas (garder la plus récente par user)
DELETE FROM subscriptions s1
USING subscriptions s2
WHERE s1.user_id = s2.user_id
  AND s1.platform = s2.platform
  AND s1.created_at < s2.created_at;

-- 2. Ajouter contrainte UNIQUE pour éviter les futurs duplicatas
ALTER TABLE subscriptions
ADD CONSTRAINT subscriptions_user_platform_unique 
UNIQUE (user_id, platform);
