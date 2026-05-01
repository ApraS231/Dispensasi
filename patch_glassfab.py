import re

with open("mobile-app/src/components/GlassFAB.tsx", "r") as f:
    content = f.read()

content = content.replace("export default function GlassFAB({ onPress, icon }: { onPress: () => void; icon?: keyof typeof MaterialCommunityIcons.glyphMap }) {", "export default function GlassFAB({ onPress, icon, style }: { onPress: () => void; icon?: keyof typeof MaterialCommunityIcons.glyphMap; style?: any }) {")

content = content.replace("styles.container,", "styles.container,\n        style,")

with open("mobile-app/src/components/GlassFAB.tsx", "w") as f:
    f.write(content)
