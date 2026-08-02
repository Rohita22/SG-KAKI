import type { Category } from '@/content/types';

/** Per-category tint used across the Field Guide so cards instantly read their category. */
export const CATEGORY_STYLE: Record<
  Category,
  { bg: string; border: string; chip: string; ring: string }
> = {
  food: {
    bg: 'bg-[#FFF3D4]',
    border: 'border-[#F4D897]',
    chip: 'bg-[#F4D897]/60 text-[#8A6412]',
    ring: 'ring-[#F4D897]',
  },
  lingo: {
    bg: 'bg-[#EFE8FF]',
    border: 'border-[#D6C6FF]',
    chip: 'bg-[#D6C6FF]/60 text-[#5B3DA6]',
    ring: 'ring-[#D6C6FF]',
  },
  socialVibes: {
    bg: 'bg-[#DDF7F2]',
    border: 'border-[#B7EBE0]',
    chip: 'bg-[#B7EBE0]/60 text-[#0E7C67]',
    ring: 'ring-[#B7EBE0]',
  },
  gettingAround: {
    bg: 'bg-[#E8F2FF]',
    border: 'border-[#C4DFFF]',
    chip: 'bg-[#C4DFFF]/60 text-[#1D4ED8]',
    ring: 'ring-[#C4DFFF]',
  },
  workCulture: {
    bg: 'bg-[#FFE4E1]',
    border: 'border-[#FBC4C0]',
    chip: 'bg-[#FBC4C0]/60 text-[#B5423A]',
    ring: 'ring-[#FBC4C0]',
  },
};
