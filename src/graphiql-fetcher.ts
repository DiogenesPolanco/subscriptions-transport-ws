import { SubscriptionClient } from './client';

const hasSubscriptionOperation = (graphQlParams: any) => {
  const query = graphQlParams.query;
  const operationName = graphQlParams.operationName;

  if (operationName && operationName !== '') {
    return query.includes(`subscription ${operationName}`);
  }

  return query.includes('subscription {') ||
    query.includes('subscription{');
};

export const graphQLFetcher = (subscriptionsClient: SubscriptionClient, fallbackFetcher: Function) => {
  let activeSubscriptionId: number | null = null;

  return (graphQLParams: any) => {
    if (subscriptionsClient && activeSubscriptionId !== null) {
      subscriptionsClient.unsubscribe(activeSubscriptionId);
    }

    if (subscriptionsClient && hasSubscriptionOperation(graphQLParams)) {
      return {
        subscribe: (observer: { error: Function, next: Function }) => {
          observer.next('Your subscription data will appear here after server publication!');

          activeSubscriptionId = subscriptionsClient.subscribe({
            query: graphQLParams.query,
            variables: graphQLParams.variables,
          }, function (error, result) {
            if (error) {
              observer.error(error);
            } else {
              observer.next(result);
            }
          });
        },
      };
    } else {
      return fallbackFetcher(graphQLParams);
    }
  };
};
