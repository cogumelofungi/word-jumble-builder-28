-- Corrigir problema de search_path nas funções
ALTER FUNCTION get_published_app(text) SET search_path = 'public';

-- Atualizar outras funções para ter search_path seguro
ALTER FUNCTION generate_unique_slug(text) SET search_path = 'public';
ALTER FUNCTION setup_admin_user(text) SET search_path = 'public';
ALTER FUNCTION has_role(uuid, text) SET search_path = 'public';
ALTER FUNCTION log_admin_action(text, uuid, jsonb) SET search_path = 'public';
ALTER FUNCTION admin_assign_role(uuid, text) SET search_path = 'public';
ALTER FUNCTION admin_delete_app(uuid) SET search_path = 'public';
ALTER FUNCTION admin_delete_user_complete(uuid) SET search_path = 'public';
ALTER FUNCTION get_users_with_metadata() SET search_path = 'public';
ALTER FUNCTION handle_new_user() SET search_path = 'public';
ALTER FUNCTION delete_own_account() SET search_path = 'public';
ALTER FUNCTION update_updated_at_column() SET search_path = 'public';