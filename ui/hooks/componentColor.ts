import { Colors } from '@/constants/Colors';
import {selectTheme} from "@/state/slices/theme";
import {useStoreSelector} from "@/state/store";

export default function componentColor(component: keyof typeof Colors.light & keyof typeof Colors.dark) {
  const theme = useStoreSelector(selectTheme)
  const selectedTheme = theme ?? 'dark';
  return Colors[selectedTheme][component];
}
