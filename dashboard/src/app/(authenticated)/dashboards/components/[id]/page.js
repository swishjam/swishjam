'use client'

import PageWithHeader from "@/components/utils/PageWithHeader"
import { useState } from "react";
import SwishjamAPI from "@/lib/api-client/swishjam-api";

export default function NewDashboardComponentPage({ params }) {
  const { id: dashbaordComponentId } = params;
  return (
    <PageWithHeader title='Dashboard Component'>
      {dashbaordComponentId}
    </PageWithHeader>
  )
}