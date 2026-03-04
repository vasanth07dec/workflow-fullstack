/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { Flex, Spin } from "antd";

export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: ReactNode = <Flex className="h-screen "><Spin size="large" /></Flex>
) {
  const LazyComponent = lazy(importFunc);

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}