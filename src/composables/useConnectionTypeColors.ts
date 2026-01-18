import { useTheme } from "vuetify";

export default function useConnectionTypeColors() {
  const vTheme = useTheme();
  const signalColor = "#fff";
  const messageBusColor = vTheme.current.value.colors.secondary;

  return {
    signalColor,
    messageBusColor,
  };
}
