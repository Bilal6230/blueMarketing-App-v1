import type { ComponentProps } from 'react';

import { AppInput } from '@/components/controls/AppInput';

type SearchInputProps = Omit<ComponentProps<typeof AppInput>, 'leadingIcon'>;

export function SearchInput(props: SearchInputProps) {
  return (
    <AppInput
      {...props}
      leadingIcon="search-outline"
      placeholder={props.placeholder ?? 'Search'}
      returnKeyType="search"
    />
  );
}
