const fs = require('fs');
const filePath = 'mobile-app/app/ticket/[id].tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add isExpired logic
const hookStart = content.indexOf('const userRole = user?.role;');
const isExpiredCode = `
  const isExpired = ticket?.expires_at
    ? new Date() > new Date(ticket.expires_at)
    : false;
`;
content = content.slice(0, hookStart) + isExpiredCode + '\n  ' + content.slice(hookStart);

// Replace inputContainer
const inputContainerStart = content.indexOf('<View style={styles.inputContainer}>');
const inputContainerEnd = content.indexOf('</KeyboardAvoidingView>');
const inputContainerBlock = content.slice(inputContainerStart, inputContainerEnd);

const newInputContainerBlock = `{isExpired ? (
            <View style={[styles.inputContainer, { backgroundColor: COLORS.error + '10', alignItems: 'center', paddingVertical: SPACING.lg }]}>
              <Text style={{ fontFamily: FONTS.headingSemi, color: COLORS.error, fontSize: 16 }}>Sesi Chat Telah Berakhir</Text>
              <Text style={{ fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 4 }}>Masa berlaku tiket 12 jam telah habis. Riwayat percakapan ini bersifat Read-Only.</Text>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Kirim pesan terkait tiket ini..."
                  placeholderTextColor={COLORS.textMuted}
                  value={newMsg}
                  onChangeText={setNewMsg}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.sendBtn, { right: 4, bottom: 4 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    sendMessage();
                  }}
                >
                  <MaterialCommunityIcons name="send" size={20} color={COLORS.bgWhite} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        `;

content = content.replace(inputContainerBlock, newInputContainerBlock);

fs.writeFileSync(filePath, content, 'utf8');
