import { useMemo, useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useCondoDocumentsQuery } from '@hooks/useCondoDocuments';
import { isAdmin, isAdminOrOwner } from '@shared/utils/roleAndStatusHelpers';
import { Button, Modal, Tabs } from '@shared/ui';
import type { TabItem } from '@shared/ui';
import { DocumentList, UploadDocumentForm } from '@components/condo-documents';
import type { CondoDocumentType } from '@shared/types/condo-documents.types';

type TabId = CondoDocumentType;

export function CondoDocuments() {
  const { user } = useAuth();
  const canSeeMinutes = isAdminOrOwner(user?.role ?? '');
  const canUpload = isAdmin(user?.role ?? '');

  const [activeTab, setActiveTab] = useState<TabId>('document');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const tabs: TabItem[] = useMemo(() => {
    const items: TabItem[] = [
      { id: 'document', label: 'Documentos generales', icon: '📄', color: 'blue' },
    ];
    if (canSeeMinutes) {
      items.push({ id: 'minute', label: 'Minutas', icon: '📝', color: 'green' });
    }
    return items;
  }, [canSeeMinutes]);

  const effectiveTab: TabId =
    activeTab === 'minute' && !canSeeMinutes ? 'document' : activeTab;

  const { data, isLoading, error } = useCondoDocumentsQuery(effectiveTab);

  return (
    <div className="container flex-1 mx-auto p-4 space-y-6">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <h1 className="text-2xl font-bold">Documentos del Condominio</h1>
        {canUpload && (
          <Button variant="success" onClick={() => setShowUploadModal(true)}>
            ⬆️ Subir documento
          </Button>
        )}
      </div>

      <Tabs
        tabs={tabs}
        activeTab={effectiveTab}
        onTabChange={(id) => setActiveTab(id as TabId)}
      />

      <DocumentList
        documents={data ?? []}
        type={effectiveTab}
        isLoading={isLoading}
        error={error?.message ?? null}
      />

      {canUpload && (
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="Subir documento del condominio"
          maxWidth="md"
        >
          <UploadDocumentForm
            defaultType={effectiveTab}
            onUploadSuccess={() => setShowUploadModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}
