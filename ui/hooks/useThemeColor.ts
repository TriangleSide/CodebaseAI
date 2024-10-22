import { Colors } from '@/constants/Colors';
import {selectTheme} from "@/state/slices/theme";
import {useSelector} from "react-redux";

export function componentColor(component: keyof typeof Colors.light & keyof typeof Colors.dark) {
  const theme = useSelector(selectTheme)
  const selectedTheme = theme ?? 'dark';
  return Colors[selectedTheme][component];
}
