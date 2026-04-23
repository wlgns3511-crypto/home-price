import type { Metadata } from 'next';
import { getDataVintageLabel, getMethodologyUrl, getReviewedAt, getReviewedBy } from '@/lib/seo';

export function buildDbPageRobots(index: boolean): NonNullable<Metadata["robots"]> {
  return {
    index,
    follow: true,
    googleBot: {
      index,
      follow: true,
      'max-image-preview': 'large',
    },
  };
}

export function buildTrustUpdatedLabel(): string {
  return `Reviewed ${getReviewedAt() ?? 'recently'} · data vintage ${getDataVintageLabel()}`;
}

export function getDbPageGate({
  alternativeLinkCount,
  topAnswer,
}: {
  alternativeLinkCount: number;
  topAnswer: string;
}) {
  const sentenceCount = topAnswer
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean).length;

  return {
    pass:
      sentenceCount >= 2 &&
      alternativeLinkCount >= 3 &&
      Boolean(getReviewedBy()) &&
      Boolean(getReviewedAt()) &&
      Boolean(getDataVintageLabel()) &&
      Boolean(getMethodologyUrl()),
  };
}
