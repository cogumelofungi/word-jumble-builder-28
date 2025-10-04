import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformSettings } from "./usePlatformSettings";

type Language = "pt" | "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Header
    "app.title": "MigraBook",
    "language.select": "Idioma",
    "theme.light": "Claro",
    "theme.dark": "Escuro",
    "reset": "Reset",
    "publish": "Publicar App",

    // Progress
    "progress.upload": "Upload",
    "progress.customization": "Personalização", 
    "progress.publish": "Publicar",

    // Upload Section
    "upload.title": "Upload de Produtos",
    "upload.main": "Produto Principal",
    "upload.main.desc": "PDF ou ZIP do produto principal",
    "upload.bonus": "Bônus",
    "upload.bonus.desc": "Material adicional (PDF, ZIP)",
    "upload.send": "Enviar",
    "import.title": "Importar App Existente",
    "import.json": "Upload via JSON",
    "import.json.placeholder": "Cole o JSON do app...",
    "import.id": "Importar por ID",
    "import.id.placeholder": "ID do app...",
    "import.button": "Importar",

    // Phone Preview
    "preview.title": "Pré-visualização do App",

    // Customization
    "custom.title": "Personalização do App",
    "custom.name": "Nome do App",
    "custom.name.placeholder": "Digite o nome do seu app",
    "custom.color": "Cor do App",
    "custom.icon": "Ícone do App",
    "custom.icon.upload": "Enviar Ícone",
    "custom.cover": "Capa do App", 
    "custom.cover.upload": "Enviar Capa",
    "custom.link": "Link Personalizado",
    "custom.link.placeholder": "Sua URL aqui",
    "custom.link.help": "Se deixar em branco vai gerar uma URL automática",
    "custom.reset": "Resetar Personalização",

    // Phone mockup
    "phone.main.title": "PRODUTO PRINCIPAL",
    "phone.main.subtitle": "Baixe agora e comece a transformar seus resultados",
    "phone.main.description": "Disponível para download",
    "phone.bonus.title": "BÔNUS EXCLUSIVOS",
    "phone.view": "Visualizar",
    "phone.access": "Acessar",
    "phone.exclusive_bonus": "Bônus exclusivo",
    "phone.home": "Home",
    "phone.products": "Produtos",

    // Admin Panel
    "admin.title": "Painel Administrativo",
    "admin.subtitle": "Controle total da plataforma",
    "admin.students": "Alunos",
    "admin.settings": "Configurações", 
    "admin.integrations": "Integrações",
    "admin.apps": "Gerenciar Apps",
    "admin.logout": "Sair",
    "admin.students.title": "Gerenciamento de Alunos",
    "admin.students.subtitle": "Controle de acesso e monitoramento de usuários",
    "admin.students.active": "ativos",
    "admin.students.search": "Buscar por email...",
    "admin.students.all": "Todos",
    "admin.students.active.filter": "Ativos",
    "admin.students.inactive": "Inativos",
    "admin.students.email": "Email",
    "admin.students.phone": "Telefone",
    "admin.students.plan": "Plano",
    "admin.students.apps": "Apps Publicados",
    "admin.students.status": "Status",
    "admin.students.created": "Data de Cadastro",
    "admin.students.actions": "Ações",
    "admin.students.details": "Ver Detalhes",
    "admin.settings.title": "Configurações do Sistema",
    "admin.settings.subtitle": "Gerencie as configurações globais da plataforma",
    "admin.settings.save": "Salvar Configurações",
    "admin.settings.language": "Idioma Padrão do Sistema",
    "admin.settings.language.placeholder": "Selecione o idioma",
    "admin.settings.terms": "Termos de Uso",
    "admin.settings.terms.placeholder": "Digite os termos de uso da plataforma...",
    "admin.settings.cancellation": "Mensagem de Cancelamento",
    "admin.settings.cancellation.placeholder": "Mensagem exibida quando o acesso é cancelado...",
    "admin.settings.cancellation.help": "Esta mensagem será exibida nos apps de usuários com acesso desativado",

    // Admin Login
    "admin.login.title": "Painel Admin",
    "admin.login.subtitle": "Acesso exclusivo para administradores",
    "admin.login.email": "Email",
    "admin.login.password": "Senha",
    "admin.login.submit": "Entrar",
    "admin.login.loading": "Entrando...",

    // Integrations
    "integrations.title": "Integrações",
    "integrations.subtitle": "Configure integrações com serviços externos",
    "integrations.save": "Salvar Configurações",
    "integrations.saving": "Salvando...",
    "integrations.activecampaign.title": "ActiveCampaign",
    "integrations.activecampaign.subtitle": "Automação de email marketing",
    "integrations.activecampaign.api_url": "API URL",
    "integrations.activecampaign.api_url.placeholder": "https://sua-conta.api-us1.com",
    "integrations.activecampaign.api_key": "API Key",
    "integrations.activecampaign.api_key.placeholder": "sua-chave-da-api",
    "integrations.make.title": "Make",
    "integrations.make.subtitle": "Automação de processos",
    "integrations.make.webhook_url": "Webhook URL",
    "integrations.make.webhook_url.placeholder": "https://hook.integromat.com/...",

    // Toast Messages
    "toast.logout.error.title": "Erro no logout",
    "toast.logout.error.description": "Não foi possível fazer logout",
    "toast.logout.success.title": "Logout realizado",
    "toast.logout.success.description": "Você foi desconectado com sucesso",
    "toast.login.error.title": "Erro no login",
    "toast.login.error.description": "Erro inesperado. Tente novamente.",
    "toast.login.success.title": "Login realizado com sucesso",
    "toast.login.success.description": "Verificando permissões administrativas...",
    "toast.validation.title": "Dados inválidos",
    "toast.copy.success.title": "Copiado!",
    "toast.copy.success.description": "O link foi copiado para a área de transferência.",
    "toast.copy.error.title": "Erro",
    "toast.copy.error.description": "Não foi possível copiar o link.",
    "toast.save.success.title": "Configurações salvas",
    "toast.save.success.description": "As integrações foram configuradas com sucesso",
    "toast.error.title": "Erro",
    "toast.error.description": "Ocorreu um erro inesperado",

    // Customization - Tabs
    "custom.tabs.general": "Geral",
    "custom.tabs.labels": "Textos e Rótulos",

    // Customization - Form Labels
    "custom.description": "Descrição do App",
    "custom.description.placeholder": "Descrição que aparece no app...",
    "custom.domain": "Domínio Próprio",
    "custom.main.title": "Título do Produto Principal",
    "custom.main.description": "Descrição do Produto Principal",
    "custom.bonuses.title": "Título da Seção de Bônus",
    "custom.bonus.name": "Bônus",

    // Import Section
    "import.select.json": "Selecione o JSON do app",
    "import.select.file": "Selecionar arquivo JSON",
    "import.backup": "Backup",
    "import.tooltip": "Importe dados de um app previamente criado usando JSON ou ID do app. Disponível apenas nos planos Profissional e Empresarial.",
    "import.premium.required": "Importar app está disponível apenas nos planos Profissional e Empresarial.",

    // Upload Section  
    "upload.pdf.description": "Produto principal em PDF",
    "upload.bonus.description": "Produto adicional em PDF",
    "upload.uploading": "Enviando...",
    "upload.uploaded": "Enviado",
    "upload.allow.download": "Permitir download do PDF",

    // Publish Section
    "publish.ready": "Pronto para publicar?",
    "publish.subtitle": "Publique seu app e compartilhe com o mundo!",
    "publish.plan": "Plano",
    "publish.apps": "apps",
    "publish.publishing": "Publicando...",
    "publish.checking": "Verificando limite...",
    "publish.republish": "Publicar Novamente",
    "publish.button": "Publicar App",
    "publish.saving": "Salvando rascunho...",
    "publish.review.title": "Revisar App Antes de Publicar",
    "publish.review.subtitle": "Verifique todas as informações antes de publicar seu app.",
    "publish.info.title": "Informações do App",
    "publish.info.name": "Nome:",
    "publish.info.description": "Descrição:",
    "publish.info.color": "Cor:",
    "publish.info.link": "Link personalizado:",
    "publish.info.undefined": "Não definido",
    "publish.products.title": "Produtos Carregados",
    "publish.products.main": "Produto Principal:",
    "publish.products.bonus": "Bônus",
    "publish.products.loaded": "Carregado",
    "publish.products.notloaded": "Não carregado",
    "publish.products.optional": "Opcional",
    "publish.visual.title": "Recursos Visuais",
    "publish.visual.icon": "Ícone do App:",
    "publish.visual.cover": "Capa do App:",
    "publish.back": "Voltar e Editar",
    "publish.confirm": "Confirmar e Publicar",
    "publish.success.title": "App Publicado com Sucesso!",
    "publish.success.subtitle": "Seu app está agora disponível e pode ser instalado como PWA.",
    "publish.success.link": "Link do seu app:",
    "publish.success.steps": "🎉 Próximos passos:",
    "publish.success.share": "Compartilhe o link com seus clientes",
    "publish.success.pwa": "O app pode ser instalado como PWA",
    "publish.success.track": "Acompanhe downloads no painel",
    "publish.limit.title": "Limite de Apps Atingido",
    "publish.limit.subtitle": "Você atingiu o limite de",
    "publish.limit.description": "Para criar mais apps, você precisa fazer upgrade do seu plano.",
    "publish.limit.upgrade": "Fazer Upgrade",

    // Custom Domain Dialog
    "domain.title": "Domínio Personalizado",
    "domain.button": "Configurar domínio personalizado",
    "domain.description": "Configure seu próprio domínio para transmitir mais profissionalismo",
    "domain.step1.title": "Usar um domínio personalizado",
    "domain.step1.subtitle": "Transmita profissionalismo com um domínio personalizado",
    "domain.step1.own_domain": "Use seu próprio domínio",
    "domain.step1.connect": "Conecte seu domínio de terceiros",
    "domain.step1.dns_info": "Você precisa fazer login no seu provedor de domínio para atualizar seus registros de DNS.",
    "domain.step1.no_changes": "Não podemos fazer essas alterações por você, mas podemos te ajudar com um passo a passo.",
    "domain.step1.view_steps": "Ver os passos",
    "domain.step1.continue": "Continuar",
    "domain.step2.title": "Use seu próprio domínio",
    "domain.step2.subtitle": "Você tem um domínio de outro provedor? Conecte esse domínio.",
    "domain.step2.placeholder": "Ex.: example.com",
    "domain.step2.cloudflare_detected": "Cloudflare detectado!",
    "domain.step2.auto_connect": "Podemos conectar automaticamente seu domínio.",
    "domain.step3.title": "Conexão Automática",
    "domain.step3.cloudflare_message": "Parece que o domínio {domain} está registrado no provedor Cloudflare. Boas notícias! Com o Cloudflare, seu domínio pode ser conectado automaticamente.",
    "domain.step3.auto_login": "Fazer login e conectar automaticamente",
    "domain.step3.manual": "Ou conectar de forma manual",
    "domain.step4.title": "Acesse o site do seu provedor de domínio",
    "domain.step4.subtitle": "Na página de configurações de DNS, atualize seus registros seguindo estes passos.",
    "domain.step4.add_record": "Adicionar registro A",
    "domain.step4.host": "Nome/host:",
    "domain.step4.value": "Valor/Direciona a:",
    "domain.step4.record_added": "Registro adicionado",
    "domain.step4.subdomain": "Registro A para subdomínio",
    "domain.step4.txt_record": "Registro TXT para verificar titularidade",
    "domain.step4.txt_value": "Valor:",
    "domain.back": "Voltar",
    "domain.continue": "Continuar",

    // Common
    "common.loading": "Carregando...",
    "common.save": "Salvar",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",
    "common.close": "Fechar",
    "common.edit": "Editar",
    "common.delete": "Deletar",
    "common.view": "Visualizar",
    "common.download": "Baixar",
    "common.upload": "Enviar",
    "common.active": "Ativo",
    "common.inactive": "Inativo",
    "common.yes": "Sim",
    "common.no": "Não",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.all": "Todos",

    // Validation
    "validation.email.invalid": "Email inválido",
    "validation.password.min": "Senha deve ter pelo menos 6 caracteres",
    "validation.required": "Este campo é obrigatório",

    // Status Messages
    "status.checking_permissions": "Verificando permissões...",
    "status.loading_data": "Carregando dados...",
    "status.saving": "Salvando...",
    "status.uploading": "Enviando...",

    // Auth Form
    "auth.full_name": "Nome Completo",
    "auth.full_name.placeholder": "Seu nome completo",
    "auth.email": "Email",
    "auth.email.placeholder": "seu@email.com",
    "auth.phone": "Telefone",
    "auth.phone.placeholder": "Digite seu telefone",
    "auth.password": "Senha",
    "auth.password.placeholder": "••••••••",
    "auth.login.title": "Faça login na sua conta",
    "auth.login.subtitle": "Entre para acessar seus apps",
    "auth.signup.title": "Crie sua conta",
    "auth.signup.subtitle": "Comece a criar seus apps agora mesmo",
    "auth.login.button": "Entrar",
    "auth.signup.button": "Criar Conta",
    "auth.login.loading": "Entrando...",
    "auth.signup.loading": "Criando conta...",
    "auth.app.subtitle": "Crie e publique seus apps facilmente",
    "auth.terms.text": "Ao criar uma conta, você concorda com nossos",
    "auth.terms.link": "Termos de Uso",
    "auth.terms.and": "e",
    "auth.privacy.link": "Política de Privacidade",

    // Pricing Page
    "pricing.title": "Planos e Preços",
    "pricing.subtitle": "Compare os planos e escolha a melhor opção para você publicar seus apps.",
    "pricing.billing.monthly": "Mensal",
    "pricing.billing.annual": "Anual",
    "pricing.billing.save": "2 meses grátis",
    "pricing.popular": "Mais Popular",
    "pricing.plan.essencial": "Essencial",
    "pricing.plan.profissional": "Profissional",
    "pricing.plan.empresarial": "Empresarial",
    "pricing.plan.essencial.description": "Ideal para iniciantes",
    "pricing.plan.profissional.description": "Mais flexibilidade",
    "pricing.plan.empresarial.description": "Uso corporativo e avançado",
    "pricing.plan.essencial.apps": "1 aplicativo",
    "pricing.plan.profissional.apps": "5 aplicativos",
    "pricing.plan.empresarial.apps": "10 aplicativos",
    "pricing.plan.essencial.pdfs": "Até 3 PDFs por app",
    "pricing.plan.profissional.pdfs": "Até 5 PDFs por app",
    "pricing.plan.empresarial.pdfs": "Até 10 PDFs por app",
    "pricing.plan.essencial.badge": "7 dias grátis",
    "pricing.features.customization": "Personalização do app",
    "pricing.features.email_support": "Suporte por email",
    "pricing.features.whatsapp_support": "Suporte prioritário WhatsApp",
    "pricing.features.import_apps": "Importação de apps existentes",
    "pricing.features.custom_domain": "Domínio personalizado",
    "pricing.features.premium_templates": "Templates premium",
    "pricing.subscribe": "Assinar",
    "pricing.equivalent": "Equivale a",
    "pricing.per_month": "/mês",
    "pricing.per_year": "/ano",

    // Checkout Page
    "checkout.title": "Finalizar Assinatura",
    "checkout.subtitle": "Confirme os detalhes do seu plano escolhido",
    "checkout.plan.title": "Plano",
    "checkout.price.monthly": "/mês",
    "checkout.price.annual": "/ano", 
    "checkout.price.equivalent": "Equivale a",
    "checkout.publication": "Publicação:",
    "checkout.benefits.title": "Benefícios inclusos:",
    "checkout.total.monthly": "Total mensal:",
    "checkout.total.annual": "Total anual:",
    "checkout.subscribe.button": "Assinar com Cartão de Crédito",
    "checkout.processing": "Processando...",
    "checkout.back.button": "Voltar aos Planos",
    "checkout.success.title": "Plano ativado com sucesso!",
    "checkout.success.description": "Seu plano {planName} está ativo. Bem-vindo!",
    "checkout.error.title": "Erro ao ativar plano",
    "checkout.error.description": "Tente novamente ou entre em contato com o suporte.",

    // Payment Success Page
    "payment_success.title": "Pagamento Aprovado!",
    "payment_success.subtitle": "Sua assinatura foi ativada com sucesso",
    "payment_success.plan_title": "Plano {plan}",
    "payment_success.benefits_title": "Benefícios do seu plano:",
    "payment_success.next_billing": "Próxima cobrança",
    "payment_success.app_limit": "Limite de apps",
    "payment_success.apps": "aplicativos",
    "payment_success.billing_cycle": "Ciclo de cobrança:",
    "payment_success.monthly": "Mensal",
    "payment_success.yearly": "Anual",
    "payment_success.amount": "Valor:",
    "payment_success.processing_title": "Processando sua assinatura...",
    "payment_success.processing_subtitle": "Sua assinatura está sendo ativada. Os detalhes aparecerão aqui em alguns minutos.",
    "payment_success.access_app": "Acessar o MigraBook",
    "payment_success.view_plans": "Ver Outros Planos",
    "payment_success.email_confirmation": "Um email de confirmação foi enviado para {email}",
    "payment_success.manage_subscription": "Você pode gerenciar sua assinatura a qualquer momento no painel do usuário",

    // Inactive Account Page
    "inactive.title": "Conta Inativa",
    "inactive.subtitle": "Sua conta foi desativada",
    "inactive.default_message": "Sua conta foi desativada. Entre em contato com o suporte para mais informações.",
    "inactive.reactivate_button": "Assinar Plano para Reativar Conta",
    "inactive.logout_button": "Fazer Logout",
  },
  en: {
    // Header
    "app.title": "MigraBook",
    "language.select": "Language",
    "theme.light": "Light",
    "theme.dark": "Dark", 
    "reset": "Reset",
    "publish": "Publish App",

    // Progress
    "progress.upload": "Upload",
    "progress.customization": "Customization",
    "progress.publish": "Publish",

    // Upload Section
    "upload.title": "Product Upload",
    "upload.main": "Main Product",
    "upload.main.desc": "PDF or ZIP of main product",
    "upload.bonus": "Bonus",
    "upload.bonus.desc": "Additional material (PDF, ZIP)",
    "upload.send": "Send",
    "import.title": "Import Existing App",
    "import.json": "Upload via JSON",
    "import.json.placeholder": "Paste the app JSON...",
    "import.id": "Import by ID",
    "import.id.placeholder": "App ID...",
    "import.button": "Import",

    // Phone Preview
    "preview.title": "App Preview",

    // Customization
    "custom.title": "App Customization",
    "custom.name": "App Name",
    "custom.name.placeholder": "Enter your app name",
    "custom.color": "App Color",
    "custom.icon": "App Icon",
    "custom.icon.upload": "Upload Icon",
    "custom.cover": "App Cover",
    "custom.cover.upload": "Upload Cover",
    "custom.link": "Custom Link",
    "custom.link.placeholder": "Your URL here",
    "custom.link.help": "Leave blank for automatic URL generation",
    "custom.reset": "Reset Customization",

    // Phone mockup
    "phone.main.title": "MAIN PRODUCT",
    "phone.main.subtitle": "Download now and start transforming your results",
    "phone.main.description": "Available for download",
    "phone.bonus.title": "EXCLUSIVE BONUSES",
    "phone.view": "View",
    "phone.access": "Access",
    "phone.exclusive_bonus": "Exclusive bonus",
    "phone.home": "Home",
    "phone.products": "Products",

    // Admin Panel
    "admin.title": "Admin Panel",
    "admin.subtitle": "Complete platform control",
    "admin.students": "Students",
    "admin.settings": "Settings",
    "admin.integrations": "Integrations",
    "admin.apps": "Manage Apps",
    "admin.logout": "Logout",
    "admin.students.title": "Student Management",
    "admin.students.subtitle": "Access control and user monitoring",
    "admin.students.active": "active",
    "admin.students.search": "Search by email...",
    "admin.students.all": "All",
    "admin.students.active.filter": "Active",
    "admin.students.inactive": "Inactive",
    "admin.students.email": "Email",
    "admin.students.phone": "Phone",
    "admin.students.plan": "Plan",
    "admin.students.apps": "Published Apps",
    "admin.students.status": "Status",
    "admin.students.created": "Registration Date",
    "admin.students.actions": "Actions",
    "admin.students.details": "View Details",
    "admin.settings.title": "System Settings",
    "admin.settings.subtitle": "Manage global platform settings",
    "admin.settings.save": "Save Settings",
    "admin.settings.language": "Default System Language",
    "admin.settings.language.placeholder": "Select language",
    "admin.settings.terms": "Terms of Use",
    "admin.settings.terms.placeholder": "Enter platform terms of use...",
    "admin.settings.cancellation": "Cancellation Message",
    "admin.settings.cancellation.placeholder": "Message displayed when access is cancelled...",
    "admin.settings.cancellation.help": "This message will be displayed in apps of users with deactivated access",

    // Admin Login
    "admin.login.title": "Admin Panel",
    "admin.login.subtitle": "Exclusive access for administrators",
    "admin.login.email": "Email",
    "admin.login.password": "Password",
    "admin.login.submit": "Login",
    "admin.login.loading": "Logging in...",

    // Integrations
    "integrations.title": "Integrations",
    "integrations.subtitle": "Configure integrations with external services",
    "integrations.save": "Save Settings",
    "integrations.saving": "Saving...",
    "integrations.activecampaign.title": "ActiveCampaign",
    "integrations.activecampaign.subtitle": "Email marketing automation",
    "integrations.activecampaign.api_url": "API URL",
    "integrations.activecampaign.api_url.placeholder": "https://your-account.api-us1.com",
    "integrations.activecampaign.api_key": "API Key",
    "integrations.activecampaign.api_key.placeholder": "your-api-key",
    "integrations.make.title": "Make",
    "integrations.make.subtitle": "Process automation",
    "integrations.make.webhook_url": "Webhook URL",
    "integrations.make.webhook_url.placeholder": "https://hook.integromat.com/...",

    // Toast Messages
    "toast.logout.error.title": "Logout Error",
    "toast.logout.error.description": "Could not logout",
    "toast.logout.success.title": "Logged Out",
    "toast.logout.success.description": "You have been successfully logged out",
    "toast.login.error.title": "Login Error",
    "toast.login.error.description": "Unexpected error. Please try again.",
    "toast.login.success.title": "Login Successful",
    "toast.login.success.description": "Checking administrative permissions...",
    "toast.validation.title": "Invalid Data",
    "toast.copy.success.title": "Copied!",
    "toast.copy.success.description": "The link has been copied to clipboard.",
    "toast.copy.error.title": "Error",
    "toast.copy.error.description": "Could not copy the link.",
    "toast.save.success.title": "Settings Saved",
    "toast.save.success.description": "Integrations have been configured successfully",
    "toast.error.title": "Error",
    "toast.error.description": "An unexpected error occurred",

    // Customization - Tabs
    "custom.tabs.general": "General",
    "custom.tabs.labels": "Texts and Labels",

    // Customization - Form Labels
    "custom.description": "App Description",
    "custom.description.placeholder": "Description that appears in the app...",
    "custom.domain": "Custom Domain",
    "custom.main.title": "Main Product Title",
    "custom.main.description": "Main Product Description",
    "custom.bonuses.title": "Bonus Section Title",
    "custom.bonus.name": "Bonus",

    // Import Section
    "import.select.json": "Select app JSON",
    "import.select.file": "Select JSON file",
    "import.backup": "Backup",
    "import.tooltip": "Import data from a previously created app using JSON or app ID. Available only in Professional and Enterprise plans.",
    "import.premium.required": "App import is available only in Professional and Enterprise plans.",

    // Upload Section  
    "upload.pdf.description": "Main product in PDF",
    "upload.bonus.description": "Additional product in PDF",
    "upload.uploading": "Uploading...",
    "upload.uploaded": "Uploaded",
    "upload.allow.download": "Allow PDF download",

    // Publish Section
    "publish.ready": "Ready to publish?",
    "publish.subtitle": "Publish your app and share it with the world!",
    "publish.plan": "Plan",
    "publish.apps": "apps",
    "publish.publishing": "Publishing...",
    "publish.checking": "Checking limit...",
    "publish.republish": "Publish Again",
    "publish.button": "Publish App",
    "publish.saving": "Saving draft...",
    "publish.review.title": "Review App Before Publishing",
    "publish.review.subtitle": "Check all information before publishing your app.",
    "publish.info.title": "App Information",
    "publish.info.name": "Name:",
    "publish.info.description": "Description:",
    "publish.info.color": "Color:",
    "publish.info.link": "Custom link:",
    "publish.info.undefined": "Not defined",
    "publish.products.title": "Loaded Products",
    "publish.products.main": "Main Product:",
    "publish.products.bonus": "Bonus",
    "publish.products.loaded": "Loaded",
    "publish.products.notloaded": "Not loaded",
    "publish.products.optional": "Optional",
    "publish.visual.title": "Visual Assets",
    "publish.visual.icon": "App Icon:",
    "publish.visual.cover": "App Cover:",
    "publish.back": "Back and Edit",
    "publish.confirm": "Confirm and Publish",
    "publish.success.title": "App Successfully Published!",
    "publish.success.subtitle": "Your app is now available and can be installed as PWA.",
    "publish.success.link": "Your app link:",
    "publish.success.steps": "🎉 Next steps:",
    "publish.success.share": "Share the link with your clients",
    "publish.success.pwa": "The app can be installed as PWA",
    "publish.success.track": "Track downloads in the panel",
    "publish.limit.title": "App Limit Reached",
    "publish.limit.subtitle": "You have reached the limit of",
    "publish.limit.description": "To create more apps, you need to upgrade your plan.",
    "publish.limit.upgrade": "Upgrade",

    // Custom Domain Dialog
    "domain.title": "Custom Domain",
    "domain.button": "Configure custom domain",
    "domain.description": "Configure your own domain to convey more professionalism",
    "domain.step1.title": "Use a custom domain",
    "domain.step1.subtitle": "Convey professionalism with a custom domain",
    "domain.step1.own_domain": "Use your own domain",
    "domain.step1.connect": "Connect your third-party domain",
    "domain.step1.dns_info": "You need to log into your domain provider to update your DNS records.",
    "domain.step1.no_changes": "We cannot make these changes for you, but we can help you with a step-by-step guide.",
    "domain.step1.view_steps": "View the steps",
    "domain.step1.continue": "Continue",
    "domain.step2.title": "Use your own domain",
    "domain.step2.subtitle": "Do you have a domain from another provider? Connect that domain.",
    "domain.step2.placeholder": "Ex: example.com",
    "domain.step2.cloudflare_detected": "Cloudflare detected!",
    "domain.step2.auto_connect": "We can automatically connect your domain.",
    "domain.step3.title": "Automatic Connection",
    "domain.step3.cloudflare_message": "It looks like the domain {domain} is registered with the Cloudflare provider. Good news! With Cloudflare, your domain can be connected automatically.",
    "domain.step3.auto_login": "Log in and connect automatically",
    "domain.step3.manual": "Or connect manually",
    "domain.step4.title": "Access your domain provider's website",
    "domain.step4.subtitle": "On the DNS settings page, update your records following these steps.",
    "domain.step4.add_record": "Add A record",
    "domain.step4.host": "Name/host:",
    "domain.step4.value": "Value/Points to:",
    "domain.step4.record_added": "Record added",
    "domain.step4.subdomain": "A record for subdomain",
    "domain.step4.txt_record": "TXT record to verify ownership",
    "domain.step4.txt_value": "Value:",
    "domain.back": "Back",
    "domain.continue": "Continue",

    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.close": "Close",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.view": "View",
    "common.download": "Download",
    "common.upload": "Upload",
    "common.active": "Active",
    "common.inactive": "Inactive",
    "common.yes": "Yes",
    "common.no": "No",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.all": "All",

    // Validation
    "validation.email.invalid": "Invalid email",
    "validation.password.min": "Password must be at least 6 characters",
    "validation.required": "This field is required",

    // Status Messages
    "status.checking_permissions": "Checking permissions...",
    "status.loading_data": "Loading data...",
    "status.saving": "Saving...",
    "status.uploading": "Uploading...",

    // Auth Form
    "auth.full_name": "Full Name",
    "auth.full_name.placeholder": "Your full name",
    "auth.email": "Email",
    "auth.email.placeholder": "your@email.com",
    "auth.phone": "Phone",
    "auth.phone.placeholder": "Enter your phone",
    "auth.password": "Password",
    "auth.password.placeholder": "••••••••",
    "auth.login.title": "Sign in to your account",
    "auth.login.subtitle": "Enter to access your apps",
    "auth.signup.title": "Create your account",
    "auth.signup.subtitle": "Start creating your apps now",
    "auth.login.button": "Sign In",
    "auth.signup.button": "Create Account",
    "auth.login.loading": "Signing in...",
    "auth.signup.loading": "Creating account...",
    "auth.app.subtitle": "Create and publish your apps easily",
    "auth.terms.text": "By creating an account, you agree to our",
    "auth.terms.link": "Terms of Use",
    "auth.terms.and": "and",
    "auth.privacy.link": "Privacy Policy",

    // Pricing Page
    "pricing.title": "Plans & Pricing",
    "pricing.subtitle": "Compare plans and choose the best option for publishing your apps.",
    "pricing.billing.monthly": "Monthly",
    "pricing.billing.annual": "Annual",
    "pricing.billing.save": "2 months free",
    "pricing.popular": "Most Popular",
    "pricing.plan.essencial": "Essential",
    "pricing.plan.profissional": "Professional",
    "pricing.plan.empresarial": "Business",
    "pricing.plan.essencial.description": "Perfect for beginners",
    "pricing.plan.profissional.description": "More flexibility",
    "pricing.plan.empresarial.description": "Corporate and advanced use",
    "pricing.plan.essencial.apps": "1 application",
    "pricing.plan.profissional.apps": "5 applications",
    "pricing.plan.empresarial.apps": "10 applications",
    "pricing.plan.essencial.pdfs": "Up to 3 PDFs per app",
    "pricing.plan.profissional.pdfs": "Up to 5 PDFs per app",
    "pricing.plan.empresarial.pdfs": "Up to 10 PDFs per app",
    "pricing.plan.essencial.badge": "7 days free",
    "pricing.features.customization": "App customization",
    "pricing.features.email_support": "Email support",
    "pricing.features.whatsapp_support": "Priority WhatsApp support",
    "pricing.features.import_apps": "Import existing apps",
    "pricing.features.custom_domain": "Custom domain",
    "pricing.features.premium_templates": "Premium templates",
    "pricing.subscribe": "Subscribe",
    "pricing.equivalent": "Equivalent to",
    "pricing.per_month": "/month",
    "pricing.per_year": "/year",

    // Checkout Page
    "checkout.title": "Complete Subscription",
    "checkout.subtitle": "Confirm your chosen plan details",
    "checkout.plan.title": "Plan",
    "checkout.price.monthly": "/month",
    "checkout.price.annual": "/year",
    "checkout.price.equivalent": "Equivalent to",
    "checkout.publication": "Publication:",
    "checkout.benefits.title": "Included benefits:",
    "checkout.total.monthly": "Monthly total:",
    "checkout.total.annual": "Annual total:",
    "checkout.subscribe.button": "Subscribe with Credit Card",
    "checkout.processing": "Processing...",
    "checkout.back.button": "Back to Plans",
    "checkout.success.title": "Plan activated successfully!",
    "checkout.success.description": "Your {planName} plan is active. Welcome!",
    "checkout.error.title": "Error activating plan",
    "checkout.error.description": "Please try again or contact support.",

    // Payment Success Page
    "payment_success.title": "Payment Approved!",
    "payment_success.subtitle": "Your subscription has been activated successfully",
    "payment_success.plan_title": "Plan {plan}",
    "payment_success.benefits_title": "Your plan benefits:",
    "payment_success.next_billing": "Next billing",
    "payment_success.app_limit": "App limit",
    "payment_success.apps": "applications",
    "payment_success.billing_cycle": "Billing cycle:",
    "payment_success.monthly": "Monthly",
    "payment_success.yearly": "Annual",
    "payment_success.amount": "Amount:",
    "payment_success.processing_title": "Processing your subscription...",
    "payment_success.processing_subtitle": "Your subscription is being activated. Details will appear here in a few minutes.",
    "payment_success.access_app": "Access MigraBook",
    "payment_success.view_plans": "View Other Plans",
    "payment_success.email_confirmation": "A confirmation email was sent to {email}",
    "payment_success.manage_subscription": "You can manage your subscription anytime in the user panel",

    // Inactive Account Page
    "inactive.title": "Inactive Account",
    "inactive.subtitle": "Your account has been deactivated",
    "inactive.default_message": "Your account has been deactivated. Contact support for more information.",
    "inactive.reactivate_button": "Subscribe to Reactivate Account",
    "inactive.logout_button": "Sign Out",
  },
  es: {
    // Header
    "app.title": "MigraBook",
    "language.select": "Idioma",
    "theme.light": "Claro",
    "theme.dark": "Oscuro",
    "reset": "Resetear",
    "publish": "Publicar App",

    // Progress
    "progress.upload": "Upload",
    "progress.customization": "Personalización",
    "progress.publish": "Publicar",

    // Upload Section
    "upload.title": "Subida de Productos",
    "upload.main": "Producto Principal",
    "upload.main.desc": "PDF o ZIP del producto principal",
    "upload.bonus": "Bono",
    "upload.bonus.desc": "Material adicional (PDF, ZIP)",
    "upload.send": "Enviar",
    "import.title": "Importar App Existente",
    "import.json": "Subir via JSON",
    "import.json.placeholder": "Pega el JSON de la app...",
    "import.id": "Importar por ID",
    "import.id.placeholder": "ID de la app...",
    "import.button": "Importar",

    // Phone Preview
    "preview.title": "Vista Previa de la App",

    // Customization
    "custom.title": "Personalización de la App",
    "custom.name": "Nombre de la App",
    "custom.name.placeholder": "Ingresa el nombre de tu app",
    "custom.color": "Color de la App",
    "custom.icon": "Ícono de la App",
    "custom.icon.upload": "Subir Ícono",
    "custom.cover": "Portada de la App",
    "custom.cover.upload": "Subir Portada",
    "custom.link": "Enlace Personalizado",
    "custom.link.placeholder": "Tu URL aquí",
    "custom.link.help": "Dejar en blanco para generar URL automática",
    "custom.reset": "Resetear Personalización",

    // Phone mockup
    "phone.main.title": "PRODUCTO PRINCIPAL",
    "phone.main.subtitle": "Descarga ahora y comienza a transformar tus resultados",
    "phone.main.description": "Disponible para descarga",
    "phone.bonus.title": "BONOS EXCLUSIVOS",
    "phone.view": "Ver",
    "phone.access": "Acceder",
    "phone.exclusive_bonus": "Bono exclusivo",
    "phone.home": "Inicio",
    "phone.products": "Productos",

    // Admin Panel
    "admin.title": "Panel Administrativo",
    "admin.subtitle": "Control total de la plataforma",
    "admin.students": "Estudiantes",
    "admin.settings": "Configuraciones",
    "admin.integrations": "Integraciones",
    "admin.apps": "Gestionar Apps",
    "admin.logout": "Salir",
    "admin.students.title": "Gestión de Estudiantes",
    "admin.students.subtitle": "Control de acceso y monitoreo de usuarios",
    "admin.students.active": "activos",
    "admin.students.search": "Buscar por email...",
    "admin.students.all": "Todos",
    "admin.students.active.filter": "Activos",
    "admin.students.inactive": "Inactivos",
    "admin.students.email": "Email",
    "admin.students.phone": "Teléfono",
    "admin.students.plan": "Plan",
    "admin.students.apps": "Apps Publicadas",
    "admin.students.status": "Estado",
    "admin.students.created": "Fecha de Registro",
    "admin.students.actions": "Acciones",
    "admin.students.details": "Ver Detalles",
    "admin.settings.title": "Configuraciones del Sistema",
    "admin.settings.subtitle": "Gestionar configuraciones globales de la plataforma",
    "admin.settings.save": "Guardar Configuraciones",
    "admin.settings.language": "Idioma Predeterminado del Sistema",
    "admin.settings.language.placeholder": "Seleccionar idioma",
    "admin.settings.terms": "Términos de Uso",
    "admin.settings.terms.placeholder": "Ingrese los términos de uso de la plataforma...",
    "admin.settings.cancellation": "Mensaje de Cancelación",
    "admin.settings.cancellation.placeholder": "Mensaje mostrado cuando el acceso es cancelado...",
    "admin.settings.cancellation.help": "Este mensaje se mostrará en las apps de usuarios con acceso desactivado",

    // Admin Login
    "admin.login.title": "Panel Admin",
    "admin.login.subtitle": "Acceso exclusivo para administradores",
    "admin.login.email": "Email",
    "admin.login.password": "Contraseña",
    "admin.login.submit": "Entrar",
    "admin.login.loading": "Entrando...",

    // Integrations
    "integrations.title": "Integraciones",
    "integrations.subtitle": "Configurar integraciones con servicios externos",
    "integrations.save": "Guardar Configuraciones",
    "integrations.saving": "Guardando...",
    "integrations.activecampaign.title": "ActiveCampaign",
    "integrations.activecampaign.subtitle": "Automatización de email marketing",
    "integrations.activecampaign.api_url": "API URL",
    "integrations.activecampaign.api_url.placeholder": "https://tu-cuenta.api-us1.com",
    "integrations.activecampaign.api_key": "API Key",
    "integrations.activecampaign.api_key.placeholder": "tu-clave-api",
    "integrations.make.title": "Make",
    "integrations.make.subtitle": "Automatización de procesos",
    "integrations.make.webhook_url": "Webhook URL",
    "integrations.make.webhook_url.placeholder": "https://hook.integromat.com/...",

    // Toast Messages
    "toast.logout.error.title": "Error de Logout",
    "toast.logout.error.description": "No se pudo cerrar sesión",
    "toast.logout.success.title": "Sesión Cerrada",
    "toast.logout.success.description": "Has cerrado sesión exitosamente",
    "toast.login.error.title": "Error de Login",
    "toast.login.error.description": "Error inesperado. Inténtalo de nuevo.",
    "toast.login.success.title": "Login Exitoso",
    "toast.login.success.description": "Verificando permisos administrativos...",
    "toast.validation.title": "Datos Inválidos",
    "toast.copy.success.title": "¡Copiado!",
    "toast.copy.success.description": "El enlace ha sido copiado al portapapeles.",
    "toast.copy.error.title": "Error",
    "toast.copy.error.description": "No se pudo copiar el enlace.",
    "toast.save.success.title": "Configuraciones Guardadas",
    "toast.save.success.description": "Las integraciones han sido configuradas exitosamente",
    "toast.error.title": "Error",
    "toast.error.description": "Ocurrió un error inesperado",

    // Customization - Tabs
    "custom.tabs.general": "General",
    "custom.tabs.labels": "Textos y Etiquetas",

    // Customization - Form Labels
    "custom.description": "Descripción de la App",
    "custom.description.placeholder": "Descripción que aparece en la app...",
    "custom.domain": "Dominio Propio",
    "custom.main.title": "Título del Producto Principal",
    "custom.main.description": "Descripción del Producto Principal",
    "custom.bonuses.title": "Título de la Sección de Bonos",
    "custom.bonus.name": "Bono",

    // Import Section
    "import.select.json": "Seleccione el JSON de la app",
    "import.select.file": "Seleccionar archivo JSON",
    "import.backup": "Backup",
    "import.tooltip": "Importe datos de una app creada previamente usando JSON o ID de la app. Disponible solo en planes Profesional y Empresarial.",
    "import.premium.required": "Importar app está disponible solo en planes Profesional y Empresarial.",

    // Upload Section  
    "upload.pdf.description": "Producto principal en PDF",
    "upload.bonus.description": "Producto adicional en PDF",
    "upload.uploading": "Subiendo...",
    "upload.uploaded": "Subido",
    "upload.allow.download": "Permitir descarga del PDF",

    // Publish Section
    "publish.ready": "¿Listo para publicar?",
    "publish.subtitle": "¡Publica tu app y compártela con el mundo!",
    "publish.plan": "Plan",
    "publish.apps": "apps",
    "publish.publishing": "Publicando...",
    "publish.checking": "Verificando límite...",
    "publish.republish": "Publicar Nuevamente",
    "publish.button": "Publicar App",
    "publish.saving": "Guardando borrador...",
    "publish.review.title": "Revisar App Antes de Publicar",
    "publish.review.subtitle": "Verifica toda la información antes de publicar tu app.",
    "publish.info.title": "Información de la App",
    "publish.info.name": "Nombre:",
    "publish.info.description": "Descripción:",
    "publish.info.color": "Color:",
    "publish.info.link": "Enlace personalizado:",
    "publish.info.undefined": "No definido",
    "publish.products.title": "Productos Cargados",
    "publish.products.main": "Producto Principal:",
    "publish.products.bonus": "Bono",
    "publish.products.loaded": "Cargado",
    "publish.products.notloaded": "No cargado",
    "publish.products.optional": "Opcional",
    "publish.visual.title": "Recursos Visuales",
    "publish.visual.icon": "Ícono de la App:",
    "publish.visual.cover": "Portada de la App:",
    "publish.back": "Volver y Editar",
    "publish.confirm": "Confirmar y Publicar",
    "publish.success.title": "¡App Publicada con Éxito!",
    "publish.success.subtitle": "Tu app está ahora disponible y puede instalarse como PWA.",
    "publish.success.link": "Enlace de tu app:",
    "publish.success.steps": "🎉 Próximos pasos:",
    "publish.success.share": "Comparte el enlace con tus clientes",
    "publish.success.pwa": "La app puede instalarse como PWA",
    "publish.success.track": "Rastrea descargas en el panel",
    "publish.limit.title": "Límite de Apps Alcanzado",
    "publish.limit.subtitle": "Has alcanzado el límite de",
    "publish.limit.description": "Para crear más apps, necesitas actualizar tu plan.",
    "publish.limit.upgrade": "Actualizar Plan",

    // Custom Domain Dialog
    "domain.title": "Dominio Personalizado",
    "domain.button": "Configurar dominio personalizado",
    "domain.description": "Configure su propio dominio para transmitir más profesionalismo",
    "domain.step1.title": "Usar un dominio personalizado",
    "domain.step1.subtitle": "Transmita profesionalismo con un dominio personalizado",
    "domain.step1.own_domain": "Use su propio dominio",
    "domain.step1.connect": "Conecte su dominio de terceros",
    "domain.step1.dns_info": "Necesita iniciar sesión en su proveedor de dominio para actualizar sus registros DNS.",
    "domain.step1.no_changes": "No podemos hacer estos cambios por usted, pero podemos ayudarle con una guía paso a paso.",
    "domain.step1.view_steps": "Ver los pasos",
    "domain.step1.continue": "Continuar",
    "domain.step2.title": "Use su propio dominio",
    "domain.step2.subtitle": "¿Tiene un dominio de otro proveedor? Conecte ese dominio.",
    "domain.step2.placeholder": "Ej.: example.com",
    "domain.step2.cloudflare_detected": "¡Cloudflare detectado!",
    "domain.step2.auto_connect": "Podemos conectar automáticamente su dominio.",
    "domain.step3.title": "Conexión Automática",
    "domain.step3.cloudflare_message": "Parece que el dominio {domain} está registrado con el proveedor Cloudflare. ¡Buenas noticias! Con Cloudflare, su dominio puede conectarse automáticamente.",
    "domain.step3.auto_login": "Iniciar sesión y conectar automáticamente",
    "domain.step3.manual": "O conectar de forma manual",
    "domain.step4.title": "Acceda al sitio web de su proveedor de dominio",
    "domain.step4.subtitle": "En la página de configuraciones DNS, actualice sus registros siguiendo estos pasos.",
    "domain.step4.add_record": "Agregar registro A",
    "domain.step4.host": "Nombre/host:",
    "domain.step4.value": "Valor/Apunta a:",
    "domain.step4.record_added": "Registro agregado",
    "domain.step4.subdomain": "Registro A para subdominio",
    "domain.step4.txt_record": "Registro TXT para verificar propiedad",
    "domain.step4.txt_value": "Valor:",
    "domain.back": "Volver",
    "domain.continue": "Continuar",

    // Common
    "common.loading": "Cargando...",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",
    "common.close": "Cerrar",
    "common.edit": "Editar",
    "common.delete": "Eliminar",
    "common.view": "Ver",
    "common.download": "Descargar",
    "common.upload": "Subir",
    "common.active": "Activo",
    "common.inactive": "Inactivo",
    "common.yes": "Sí",
    "common.no": "No",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.all": "Todos",

    // Validation
    "validation.email.invalid": "Email inválido",
    "validation.password.min": "La contraseña debe tener al menos 6 caracteres",
    "validation.required": "Este campo es obligatorio",

    // Status Messages
    "status.checking_permissions": "Verificando permisos...",
    "status.loading_data": "Cargando datos...",
    "status.saving": "Guardando...",
    "status.uploading": "Subiendo...",

    // Auth Form
    "auth.full_name": "Nombre Completo",
    "auth.full_name.placeholder": "Tu nombre completo",
    "auth.email": "Email",
    "auth.email.placeholder": "tu@email.com",
    "auth.phone": "Teléfono",
    "auth.phone.placeholder": "Ingresa tu teléfono",
    "auth.password": "Contraseña",
    "auth.password.placeholder": "••••••••",
    "auth.login.title": "Inicia sesión en tu cuenta",
    "auth.login.subtitle": "Entra para acceder a tus apps",
    "auth.signup.title": "Crea tu cuenta",
    "auth.signup.subtitle": "Comienza a crear tus apps ahora mismo",
    "auth.login.button": "Iniciar Sesión",
    "auth.signup.button": "Crear Cuenta",
    "auth.login.loading": "Iniciando sesión...",
    "auth.signup.loading": "Creando cuenta...",
    "auth.app.subtitle": "Crea y publica tus apps fácilmente",
    "auth.terms.text": "Al crear una cuenta, aceptas nuestros",
    "auth.terms.link": "Términos de Uso",
    "auth.terms.and": "y",
    "auth.privacy.link": "Política de Privacidad",

    // Pricing Page
    "pricing.title": "Planes y Precios",
    "pricing.subtitle": "Compara los planes y elige la mejor opción para publicar tus apps.",
    "pricing.billing.monthly": "Mensual",
    "pricing.billing.annual": "Anual",
    "pricing.billing.save": "2 meses gratis",
    "pricing.popular": "Más Popular",
    "pricing.plan.essencial": "Esencial",
    "pricing.plan.profissional": "Profesional",
    "pricing.plan.empresarial": "Empresarial",
    "pricing.plan.essencial.description": "Ideal para principiantes",
    "pricing.plan.profissional.description": "Más flexibilidad",
    "pricing.plan.empresarial.description": "Uso corporativo y avanzado",
    "pricing.plan.essencial.apps": "1 aplicación",
    "pricing.plan.profissional.apps": "5 aplicaciones",
    "pricing.plan.empresarial.apps": "10 aplicaciones",
    "pricing.plan.essencial.pdfs": "Hasta 3 PDFs por app",
    "pricing.plan.profissional.pdfs": "Hasta 5 PDFs por app",
    "pricing.plan.empresarial.pdfs": "Hasta 10 PDFs por app",
    "pricing.plan.essencial.badge": "7 días gratis",
    "pricing.features.customization": "Personalización del app",
    "pricing.features.email_support": "Soporte por email",
    "pricing.features.whatsapp_support": "Soporte prioritario WhatsApp",
    "pricing.features.import_apps": "Importación de apps existentes",
    "pricing.features.custom_domain": "Dominio personalizado",
    "pricing.features.premium_templates": "Plantillas premium",
    "pricing.subscribe": "Suscribirse",
    "pricing.equivalent": "Equivale a",
    "pricing.per_month": "/mes",
    "pricing.per_year": "/año",

    // Checkout Page
    "checkout.title": "Finalizar Suscripción",
    "checkout.subtitle": "Confirma los detalles de tu plan elegido",
    "checkout.plan.title": "Plan",
    "checkout.price.monthly": "/mes",
    "checkout.price.annual": "/año",
    "checkout.price.equivalent": "Equivale a",
    "checkout.publication": "Publicación:",
    "checkout.benefits.title": "Beneficios incluidos:",
    "checkout.total.monthly": "Total mensual:",
    "checkout.total.annual": "Total anual:",
    "checkout.subscribe.button": "Suscribirse con Tarjeta de Crédito",
    "checkout.processing": "Procesando...",
    "checkout.back.button": "Volver a los Planes",
    "checkout.success.title": "¡Plan activado con éxito!",
    "checkout.success.description": "Tu plan {planName} está activo. ¡Bienvenido!",
    "checkout.error.title": "Error al activar plan",
    "checkout.error.description": "Inténtalo de nuevo o contacta soporte.",

    // Payment Success Page
    "payment_success.title": "¡Pago Aprobado!",
    "payment_success.subtitle": "Tu suscripción ha sido activada exitosamente",
    "payment_success.plan_title": "Plan {plan}",
    "payment_success.benefits_title": "Beneficios de tu plan:",
    "payment_success.next_billing": "Próximo cobro",
    "payment_success.app_limit": "Límite de apps",
    "payment_success.apps": "aplicaciones",
    "payment_success.billing_cycle": "Ciclo de facturación:",
    "payment_success.monthly": "Mensual",
    "payment_success.yearly": "Anual",
    "payment_success.amount": "Monto:",
    "payment_success.processing_title": "Procesando tu suscripción...",
    "payment_success.processing_subtitle": "Tu suscripción está siendo activada. Los detalles aparecerán aquí en unos minutos.",
    "payment_success.access_app": "Acceder al MigraBook",
    "payment_success.view_plans": "Ver Otros Planes",
    "payment_success.email_confirmation": "Se envió un email de confirmación a {email}",
    "payment_success.manage_subscription": "Puedes gestionar tu suscripción en cualquier momento desde el panel de usuario",

    // Inactive Account Page
    "inactive.title": "Cuenta Inactiva",
    "inactive.subtitle": "Tu cuenta ha sido desactivada",
    "inactive.default_message": "Tu cuenta ha sido desactivada. Contacta soporte para más información.",
    "inactive.reactivate_button": "Suscribirse para Reactivar Cuenta",
    "inactive.logout_button": "Cerrar Sesión",
  }
};

// Country to language mapping
const COUNTRY_LANGUAGE_MAP: Record<string, Language> = {
  'BR': 'pt', // Brazil
  'US': 'en', // United States
  'CA': 'en', // Canada
  'GB': 'en', // United Kingdom
  'AU': 'en', // Australia
  'AR': 'es', // Argentina
  'BO': 'es', // Bolivia
  'CL': 'es', // Chile
  'CO': 'es', // Colombia
  'CR': 'es', // Costa Rica
  'CU': 'es', // Cuba
  'DO': 'es', // Dominican Republic
  'EC': 'es', // Ecuador
  'SV': 'es', // El Salvador
  'GT': 'es', // Guatemala
  'HN': 'es', // Honduras
  'MX': 'es', // Mexico
  'NI': 'es', // Nicaragua
  'PA': 'es', // Panama
  'PY': 'es', // Paraguay
  'PE': 'es', // Peru
  'PR': 'es', // Puerto Rico
  'UY': 'es', // Uruguay
  'VE': 'es', // Venezuela
};

// Detect language from browser locale
const getBrowserLanguage = (): Language | null => {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('pt')) return 'pt';
  if (lang.startsWith('es')) return 'es';
  if (lang.startsWith('en')) return 'en';
  return null;
};

// Get country code from IP geolocation
const getCountryFromIP = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      timeout: 5000,
    } as any);
    if (response.ok) {
      const data = await response.json();
      return data.country_code;
    }
  } catch (error) {
    console.warn('Could not detect country from IP:', error);
  }
  return null;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export { LanguageContext };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { defaultLanguage, isLoading } = usePlatformSettings();
  const [language, setLanguage] = useState<Language>("pt");
  const [hasSetLanguage, setHasSetLanguage] = useState(false);

  // Auto-detect language on mount
  useEffect(() => {
    if (isLoading || hasSetLanguage) return;
    const autoDetectLanguage = async () => {
      const userOverride = localStorage.getItem('app_language_override') === 'true';
      const savedLanguage = localStorage.getItem('app_language') as Language | null;

      // 1) Respect user's manual choice if present
      if (userOverride && savedLanguage && ['pt','en','es'].includes(savedLanguage)) {
        setLanguage(savedLanguage);
        setHasSetLanguage(true);
        return;
      }

      // 2) Admin default (only if user didn't override)
      if (!userOverride && defaultLanguage && ['pt','en','es'].includes(defaultLanguage)) {
        setLanguage(defaultLanguage as Language);
        localStorage.setItem('app_language', defaultLanguage);
        setHasSetLanguage(true);
        return;
      }

      // 3) Legacy saved language (no override flag)
      if (savedLanguage && ['pt','en','es'].includes(savedLanguage)) {
        setLanguage(savedLanguage);
        setHasSetLanguage(true);
        return;
      }

      // 4) Try browser language
      const browserLang = getBrowserLanguage();
      if (browserLang) {
        setLanguage(browserLang);
        localStorage.setItem('app_language', browserLang);
        setHasSetLanguage(true);
        return;
      }

      // 5) Try IP geolocation
      const country = await getCountryFromIP();
      if (country && COUNTRY_LANGUAGE_MAP[country]) {
        const detectedLang = COUNTRY_LANGUAGE_MAP[country];
        setLanguage(detectedLang);
        localStorage.setItem('app_language', detectedLang);
        setHasSetLanguage(true);
        return;
      }

      // 6) Fallback to admin default from DB, else pt
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('value')
          .eq('key', 'default_language')
          .single();

        if (!error && data?.value && ['pt','en','es'].includes(data.value)) {
          setLanguage(data.value as Language);
          localStorage.setItem('app_language', data.value);
        } else {
          setLanguage('pt');
          localStorage.setItem('app_language', 'pt');
        }
      } catch (error) {
        console.error('Error fetching default language:', error);
        setLanguage('pt');
        localStorage.setItem('app_language', 'pt');
      }

      setHasSetLanguage(true);
    };

    autoDetectLanguage();
  }, [defaultLanguage, isLoading, hasSetLanguage]);

  // Update language when admin default changes (unless user manually overrode)
  useEffect(() => {
    if (isLoading) return;
    const userOverride = localStorage.getItem('app_language_override') === 'true';
    if (!userOverride && defaultLanguage && defaultLanguage !== language && ['pt','en','es'].includes(defaultLanguage)) {
      setLanguage(defaultLanguage as Language);
      localStorage.setItem('app_language', defaultLanguage);
    }
  }, [defaultLanguage, language, isLoading]);

  // Wrapper for setLanguage to persist to localStorage
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
    localStorage.setItem('app_language_override', 'true');
    setHasSetLanguage(true);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};