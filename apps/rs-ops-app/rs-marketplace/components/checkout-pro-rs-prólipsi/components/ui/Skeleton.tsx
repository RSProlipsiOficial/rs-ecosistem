
import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`bg-rs-border/50 animate-pulse rounded-md ${className}`}
      {...props}
    />
  );
};
