const fs = require('fs');
const filePath = 'mobile-app/app/(siswa)/qr/[id].tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the start of QRCodeScreen function
const hookStart = content.indexOf('export default function QRCodeScreen() {');

// Find the end of hooks, just before the first helper function or return
const isExpiredCode = `
  const isExpired = ticket?.expires_at
    ? new Date() > new Date(ticket.expires_at)
    : false;
`;

// Insert the code
const formatTimeIndex = content.indexOf('const formatTime', hookStart);
content = content.slice(0, formatTimeIndex) + isExpiredCode + '\n  ' + content.slice(formatTimeIndex);

// Replace JSX
const qrCodeBlockStart = content.indexOf('{/* QR Code Area with Frame */}');
const infoSectionStart = content.indexOf('{/* Ticket Info */}');
const qrCodeBlock = content.slice(qrCodeBlockStart, infoSectionStart);

const newQrCodeBlock = `{/* QR Code Area with Frame */}
            {isExpired ? (
              <View style={[styles.qrContainer, { padding: 40, alignItems: 'center', justifyContent: 'center' }]}>
                <MaterialCommunityIcons name="clock-alert-outline" size={64} color={COLORS.error} />
                <Text style={{ fontFamily: FONTS.headingSemi, color: COLORS.error, marginTop: 10, fontSize: 18 }}>TICKET EXPIRED</Text>
              </View>
            ) : (
              <View style={styles.qrContainer}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />

                <View style={styles.qrBg}>
                  <QRCode
                    value={ticket.qr_token}
                    size={width * 0.55}
                    color={COLORS.bgWhite}
                    backgroundColor={COLORS.textPrimary}
                  />
                </View>
              </View>
            )}

            `;

content = content.replace(qrCodeBlock, newQrCodeBlock);

fs.writeFileSync(filePath, content, 'utf8');
