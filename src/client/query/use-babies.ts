import { useQuery } from '@tanstack/react-query';
import { listBabies } from '../../infrastructure/repositories/baby-repository';

export function useBabies() {
  return useQuery({
    queryKey: ['babies'],
    queryFn: listBabies
  });
}
