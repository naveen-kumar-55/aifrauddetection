import React from 'react';

const variants = {
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  danger: 'badge badge-danger',
  info: 'badge badge-info',
  neutral: 'badge badge-neutral',
};

export default function Badge({ variant = 'neutral', children, icon: Icon, className = '' }) {
  return (
    <span className={`${variants[variant] || variants.neutral} ${className}`}>
      {Icon && <Icon size={10} />}
      {children}
    </span>
  );
}
