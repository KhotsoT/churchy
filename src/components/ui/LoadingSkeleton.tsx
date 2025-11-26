import React from 'react';
import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'table-row';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

export default function LoadingSkeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
}: LoadingSkeletonProps) {
  const getDefaultDimensions = () => {
    switch (variant) {
      case 'circular':
        return { width: 40, height: 40 };
      case 'rectangular':
        return { width: '100%', height: 120 };
      case 'card':
        return { width: '100%', height: 100 };
      case 'table-row':
        return { width: '100%', height: 48 };
      default:
        return { width: '100%', height: 20 };
    }
  };

  const defaultDims = getDefaultDimensions();
  const style = {
    width: width ?? defaultDims.width,
    height: height ?? defaultDims.height,
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`skeleton skeleton-${variant} ${className}`}
      style={style}
    />
  ));

  return <>{skeletons}</>;
}

// Pre-built skeleton patterns
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="skeleton-cards">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-card-header">
            <LoadingSkeleton variant="circular" width={48} height={48} />
            <div className="skeleton-card-title">
              <LoadingSkeleton variant="text" width="60%" height={16} />
              <LoadingSkeleton variant="text" width="40%" height={14} />
            </div>
          </div>
          <LoadingSkeleton variant="text" width="100%" height={14} />
          <LoadingSkeleton variant="text" width="80%" height={14} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        <LoadingSkeleton variant="text" width="15%" height={14} />
        <LoadingSkeleton variant="text" width="25%" height={14} />
        <LoadingSkeleton variant="text" width="20%" height={14} />
        <LoadingSkeleton variant="text" width="15%" height={14} />
        <LoadingSkeleton variant="text" width="15%" height={14} />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton-table-row">
          <LoadingSkeleton variant="text" width="15%" height={14} />
          <LoadingSkeleton variant="text" width="25%" height={14} />
          <LoadingSkeleton variant="text" width="20%" height={14} />
          <LoadingSkeleton variant="text" width="15%" height={14} />
          <LoadingSkeleton variant="text" width="15%" height={14} />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="skeleton-stats">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="skeleton-stat-card">
          <LoadingSkeleton variant="circular" width={48} height={48} />
          <div className="skeleton-stat-content">
            <LoadingSkeleton variant="text" width={60} height={28} />
            <LoadingSkeleton variant="text" width={80} height={14} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="skeleton-form">
      <LoadingSkeleton variant="text" width="30%" height={24} />
      <LoadingSkeleton variant="rectangular" width="100%" height={44} />
      <LoadingSkeleton variant="rectangular" width="100%" height={44} />
      <LoadingSkeleton variant="rectangular" width="100%" height={44} />
      <LoadingSkeleton variant="rectangular" width="100%" height={100} />
      <div className="skeleton-form-actions">
        <LoadingSkeleton variant="rectangular" width={100} height={40} />
        <LoadingSkeleton variant="rectangular" width={120} height={40} />
      </div>
    </div>
  );
}

