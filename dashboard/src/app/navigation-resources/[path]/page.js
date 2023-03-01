'use client';
import AuthenticatedView from '@/components/AuthenticatedView';
import { BarList, Card, Title, Flex, Text, Bold } from '@tremor/react';
import { useEffect, useState } from "react";
import { msToSeconds } from "@/lib/utils";
import { GetResourcesForUrlPath } from "@/lib/api";

export default function NavigationResource({ params }) {
  const { path: encodedPath } = params;
  const decodedPath = decodeURIComponent(encodedPath);

  const [resources, setResources] = useState();

  useEffect(() => {
    GetResourcesForUrlPath({ urlPath: encodedPath, siteId: 'sj-syv3hiuj0p51nks5' }).then(res => setResources(res.records));
  }, []);

  return (
    <>
      <AuthenticatedView>
        <div className="my-6 mx-6">
          <Card>
            <Title>Slowest resources on "{decodedPath}"</Title>
            <Flex marginTop="mt-4">
              <Text><Bold>Slowest resources</Bold></Text>
              <Text><Bold>Average duration</Bold></Text>
            </Flex>
            {resources === undefined ? 
              <Text>Loading...</Text> :
              <BarList data={resources} valueFormatter={value => `${msToSeconds(value)} s`} marginTop='mt-4' color='blue' />
            }
          </Card>
        </div>
      </AuthenticatedView>
    </>
  );
}