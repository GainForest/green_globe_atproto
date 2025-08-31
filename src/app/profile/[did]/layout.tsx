import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Profile | GainForest',
  description: 'View user profile and projects on GainForest',
};

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
