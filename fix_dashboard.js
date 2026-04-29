const fs = require('fs');
const filePath = 'mobile-app/app/(piket)/dashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add DailyLogCard import
const importsStart = content.indexOf('import SoftCard from');
content = content.slice(0, importsStart) + 'import DailyLogCard from \'../../src/components/DailyLogCard\';\n' + content.slice(importsStart);

// Add dailyLogs state
const hooksStart = content.indexOf('const [pendingTickets');
content = content.slice(0, hooksStart) + 'const [dailyLogs, setDailyLogs] = useState<any[]>([]);\n  const [dailyLogStats, setDailyLogStats] = useState<any>({ total: 0, scanned: 0 });\n  ' + content.slice(hooksStart);

// Update fetchData
const fetchDataRegex = /const fetchData = async \(\) => \{[\s\S]*?catch \(e\)/;
const newFetchData = `const fetchData = async () => {
    try {
      const [pendingRes, statusRes, logsRes] = await Promise.all([
        api.get('/dispensasi/pending'),
        api.get('/piket/status'),
        api.get('/piket/daily-log')
      ]);
      setPendingTickets(pendingRes.data);
      setIsReady(statusRes.data.is_ready);
      setDailyLogs(logsRes.data.data);
      setDailyLogStats({
        total: logsRes.data.total,
        scanned: logsRes.data.scanned_count
      });
    } catch (e)`;
content = content.replace(fetchDataRegex, newFetchData);

// Add section Log Hari Ini to JSX
const ticketWrapperStart = content.indexOf('ListEmptyComponent');
const flatListEnd = content.indexOf('/>', ticketWrapperStart) + 2;

const newJSX = `/>

            <View style={[styles.sectionHeader, { marginTop: SPACING.xl }]}>
              <Text style={styles.sectionTitle}>Log Hari Ini</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: SPACING.md }}>
              <SoftCard style={{ flex: 1, padding: SPACING.sm, alignItems: 'center' }}>
                <Text style={{ fontFamily: FONTS.heading, fontSize: 24, color: COLORS.primary }}>{dailyLogStats.total}</Text>
                <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: 12, color: COLORS.textSecondary }}>Total Izin</Text>
              </SoftCard>
              <SoftCard style={{ flex: 1, padding: SPACING.sm, alignItems: 'center' }}>
                <Text style={{ fontFamily: FONTS.heading, fontSize: 24, color: COLORS.success }}>{dailyLogStats.scanned}</Text>
                <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: 12, color: COLORS.textSecondary }}>Telah Keluar</Text>
              </SoftCard>
              <SoftCard style={{ flex: 1, padding: SPACING.sm, alignItems: 'center' }}>
                <Text style={{ fontFamily: FONTS.heading, fontSize: 24, color: COLORS.warning }}>{dailyLogStats.total - dailyLogStats.scanned}</Text>
                <Text style={{ fontFamily: FONTS.bodyMedium, fontSize: 12, color: COLORS.textSecondary }}>Menunggu</Text>
              </SoftCard>
            </View>

            <FlatList
              data={dailyLogs}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <DailyLogCard item={item} />}
              ListEmptyComponent={<Text style={styles.emptyText}>Belum ada log hari ini.</Text>}
            />`;

content = content.replace('/>', newJSX);

fs.writeFileSync(filePath, content, 'utf8');
