'use client';

import ApiKeysTable from "@/components/Settings/ApiKeysTable";
import EnrichmentSettings from '@/components/Settings/EnrichmentSettings';
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import WorkspaceSettingsToggles from "@/components/Settings/WorkspaceSettingsToggles";
import CardSection from "@/components/Settings/CardSection";
import CopiableText from "@/components/utils/CopiableText";

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState();
  const [workspaceSettings, setWorkspaceSettings] = useState();

  useEffect(() => {
    SwishjamAPI.Config.retrieve().then(({ workspace, api_keys, settings }) => {
      setApiKeys(api_keys);
      setWorkspaceSettings({ workspace, ...settings });
    });
  }, []);

  const handleUserEnrichmentToggle = async checked => {
    setWorkspaceSettings({ ...workspaceSettings, should_enrich_user_profile_data: checked })
    SwishjamAPI.WorkspaceSettings.update({
      should_enrich_user_profile_data: checked,
      combine_marketing_and_product_data_sources: workspaceSettings.combine_marketing_and_product_data_sources,
      should_enrich_organization_profile_data: workspaceSettings.should_enrich_organization_profile_data,
      enrichment_provider: workspaceSettings.enrichment_provider,
    }).then(({ error }) => {
      if (error) {
        setWorkspaceSettings({ ...workspaceSettings, should_enrich_user_profile_data: !checked })
      } else {
        toast.success(`User profile enrichment ${checked ? 'enabled' : 'disabled'}`)
      }
    })
  }

  const handleOrganizationEnrichmentToggle = async checked => {
    setWorkspaceSettings({ ...workspaceSettings, should_enrich_organization_profile_data: checked })
    SwishjamAPI.WorkspaceSettings.update({
      should_enrich_organization_profile_data: checked,
      combine_marketing_and_product_data_sources: workspaceSettings.combine_marketing_and_product_data_sources,
      should_enrich_user_profile_data: workspaceSettings.should_enrich_user_profile_data,
      enrichment_provider: workspaceSettings.enrichment_provider,
    }).then(({ error }) => {
      if (error) {
        setWorkspaceSettings({ ...workspaceSettings, should_enrich_organization_profile_data: !checked })
      } else {
        toast.success(`Organization profile enrichment ${checked ? 'enabled' : 'disabled'}`)
      }
    })
  }

  const handleDoNotEnrichEmailDomainAdded = async domain => {
    SwishjamAPI.DoNotEnrichUserProfileRules.create({ emailDomain: domain }).then(({ rule, error }) => {
      if (error) {
        setWorkspaceSettings({
          ...workspaceSettings,
          do_not_enrich_user_profile_rules: workspaceSettings.do_not_enrich_user_profile_rules.filter(r => r.email_domain !== domain)
        })
      } else {
        setWorkspaceSettings({ ...workspaceSettings, do_not_enrich_user_profile_rules: [...workspaceSettings.do_not_enrich_user_profile_rules, rule] })
        toast.success(`Added ${domain} to bypass list.`)
      }
    })
  }

  const handleDoNotEnrichEmailDomainRemoved = async ruleId => {
    setWorkspaceSettings({
      ...workspaceSettings,
      do_not_enrich_user_profile_rules: workspaceSettings.do_not_enrich_user_profile_rules.filter(r => r.id !== ruleId)
    })
    SwishjamAPI.DoNotEnrichUserProfileRules.delete(ruleId).then(({ error }) => {
      if (error) {
        setWorkspaceSettings({
          ...workspaceSettings,
          do_not_enrich_user_profile_rules: [...workspaceSettings.do_not_enrich_user_profile_rules, ruleId]
        })
      } else {
        toast.success(`Removed enrichment bypass rule.`)
      }
    })
  }

  const handleEnrichmentProviderChange = async provider => {
    const previousProvider = workspaceSettings.enrichment_provider
    setWorkspaceSettings({ ...workspaceSettings, enrichment_provider: provider })
    SwishjamAPI.WorkspaceSettings.update({
      combine_marketing_and_product_data_sources: workspaceSettings.combine_marketing_and_product_data_sources,
      should_enrich_user_profile_data: workspaceSettings.should_enrich_user_profile_data,
      enrichment_provider: provider,
    }).then(({ error }) => {
      if (error) {
        setWorkspaceSettings({ ...workspaceSettings, enrichment_provider: previousProvider })
      } else {
        toast.success(`Updated enrichment provider to ${provider}`)
      }
    })
  }

  return (
    <>
      <div className='mt-8'>
        <WorkspaceSettingsToggles settings={workspaceSettings} />
      </div>

      <div className='mt-8'>
        <EnrichmentSettings
          doNotEnrichEmailDomains={workspaceSettings?.do_not_enrich_user_profile_rules}
          enrichmentProvider={workspaceSettings?.enrichment_provider}
          isUserEnrichmentEnabled={workspaceSettings?.should_enrich_user_profile_data}
          isOrganizationEnrichmentEnabled={workspaceSettings?.should_enrich_organization_profile_data}
          onDoNotEnrichEmailDomainAdded={handleDoNotEnrichEmailDomainAdded}
          onDoNotEnrichEmailDomainRemoved={handleDoNotEnrichEmailDomainRemoved}
          onEnrichmentProviderChanged={handleEnrichmentProviderChange}
          onUserEnrichmentToggle={handleUserEnrichmentToggle}
          onOrganizationEnrichmentToggle={handleOrganizationEnrichmentToggle}
        />
      </div>

      <div className='mt-8 space-x-4 space-y-4'>
        <ApiKeysTable apiKeys={apiKeys} />
      </div>

      <div className='mt-8'>
        <CardSection
          title='Miscellaneous'
          sections={[{ title: 'Workspace ID', body: <CopiableText value={workspaceSettings?.workspace?.id} className='text-sm text-gray-600' /> }]}
        />
      </div>
    </>
  )
}