import RetentionWidget from "@/components/Dashboards/Components/RetentionWidget";
import SwishjamAPI from "@/lib/api-client/swishjam-api";
import { useEffect, useState } from 'react';

export default function RetentionWidgetEngine(_options) {
  const [userRetentionData, setUserRetentionData] = useState();

  useEffect(() => {
    SwishjamAPI.RetentionCohorts.get().then(setUserRetentionData)
  }, [])

  return <RetentionWidget retentionCohorts={userRetentionData} isExpandable={false} includeCard={false} />
}