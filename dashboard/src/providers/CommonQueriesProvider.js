'use client';

import CommonQueriesContext from '@/contexts/CommonQueriesContext';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useEffect, useState } from 'react';

const QUERIES_MAP = {
  uniqueEventsAndCounts: SwishjamAPI.Events.listUnique.bind(SwishjamAPI.Events),
  uniqueUserProperties: SwishjamAPI.Users.uniqueProperties.bind(SwishjamAPI.Users),
  uniqueOrganizationProperties: SwishjamAPI.Organizations.uniqueProperties.bind(SwishjamAPI.Organizations),
}

const CommonQueriesProvider = ({ queriesToInclude = ['uniqueEventsAndCounts', 'uniqueUserProperties', 'uniqueOrganizationProperties'], children }) => {
  queriesToInclude.forEach(queryName => {
    if (!QUERIES_MAP[queryName]) {
      throw new Error(`No common query found for ${queryName} in CommonQueriesProvider`);
    }
  })

  const [queryResults, setQueryResults] = useState();

  useEffect(() => {
    const runQueries = async () => {
      const results = await Promise.all(queriesToInclude.map(queryName => QUERIES_MAP[queryName]()))
      setQueryResults(Object.fromEntries(results.map((result, index) => [queriesToInclude[index], result])))
    }
    runQueries();
  }, queriesToInclude)

  return (
    <CommonQueriesContext.Provider value={{ ...(queryResults || {}) }}>
      {children}
    </CommonQueriesContext.Provider>
  );
}

export { CommonQueriesProvider };
export default CommonQueriesProvider;