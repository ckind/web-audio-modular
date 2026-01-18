import { useTheme } from "vuetify";

export default function useConnectionTypeColors() {
  const vTheme = useTheme();
  const signalColor = vTheme.current.value.colors.secondary;
  const messageBusColor = "#fff";

  return {
    signalColor,
    messageBusColor,
  };
}
