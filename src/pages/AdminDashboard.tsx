import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/hooks/useLanguage';
import { Users, Settings, Plug, Smartphone } from 'lucide-react';
import StudentsPanel from '@/components/admin/StudentsPanel';
import SettingsPanel from '@/components/admin/SettingsPanel';
import IntegrationsPanel from '@/components/admin/IntegrationsPanel';
import AppsManagementPanel from '@/components/admin/AppsManagementPanel';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('students');

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Header */}
      <div className="bg-app-surface border-b border-app-border p-3 sm:p-4">
        <div className="container mx-auto">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-neon rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{t('admin.title')}</h1>
              <p className="text-xs sm:text-sm text-app-muted truncate">{t('admin.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 py-4 sm:px-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-app-surface border border-app-border h-auto">
            <TabsTrigger 
              value="students" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 sm:px-3"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('admin.students')}</span>
              <span className="sm:hidden ml-1">Alunos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="apps" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 sm:px-3"
            >
              <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('admin.apps')}</span>
              <span className="sm:hidden ml-1">Apps</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 sm:px-3"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('admin.settings')}</span>
              <span className="sm:hidden ml-1">Config</span>
            </TabsTrigger>
            <TabsTrigger 
              value="integrations" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 sm:px-3"
            >
              <Plug className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('admin.integrations')}</span>
              <span className="sm:hidden ml-1">Integr</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <StudentsPanel />
          </TabsContent>

          <TabsContent value="apps">
            <AppsManagementPanel />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;