import re

with open("mobile-app/app/(piket)/dashboard.tsx", "r") as f:
    content = f.read()

# Replace multiple FlatLists with ScrollView
# Let's import ScrollView
content = content.replace("View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, SafeAreaView", "View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, SafeAreaView, ScrollView")

# Re-structure the main return block
search_block = r"""        <TopAppBar
          showAvatar=\{true\}
          avatarLabel=\{user\?\.name\?\.charAt\(0\)\?\.toUpperCase\(\) \|\| 'P'\}
          showNotification=\{true\}
        />

            <View style=\{\[styles\.sectionHeader, \{ marginTop: SPACING\.xl \}\]\}>
              <Text style=\{styles\.sectionTitle\}>Log Hari Ini</Text>
            </View>

            <View style=\{\{ flexDirection: 'row', gap: 12, marginBottom: SPACING\.md \}\}>
              <View style=\{\[styles\.statCard, \{ backgroundColor: COLORS\.primaryContainer \}\]\}>
                <Text style=\{\[styles\.statValue, \{ color: COLORS\.textPrimary \}\]\}>\{dailyLogStats\.total\}</Text>
                <Text style=\{styles\.statLabel\}>Total Izin</Text>
              </View>
              <View style=\{\[styles\.statCard, \{ backgroundColor: COLORS\.secondaryContainer \}\]\}>
                <Text style=\{\[styles\.statValue, \{ color: COLORS\.textPrimary \}\]\}>\{dailyLogStats\.scanned\}</Text>
                <Text style=\{styles\.statLabel\}>Telah Keluar</Text>
              </View>
              <View style=\{\[styles\.statCard, \{ backgroundColor: COLORS\.tertiaryContainer \}\]\}>
                <Text style=\{\[styles\.statValue, \{ color: COLORS\.textPrimary \}\]\}>\{dailyLogStats\.total - dailyLogStats\.scanned\}</Text>
                <Text style=\{styles\.statLabel\}>Menunggu</Text>
              </View>
            </View>

            <FlatList
              data=\{dailyLogs\}
              keyExtractor=\{\(item\) => item\.id\}
              contentContainerStyle=\{\{ paddingBottom: 100 \}\}
              showsVerticalScrollIndicator=\{false\}
              renderItem=\{\(\{ item \}\) => <DailyLogCard item=\{item\} />\}
              ListEmptyComponent=\{<Text style=\{styles\.emptyText\}>Belum ada log hari ini\.</Text>\}
            />

        <View style=\{styles\.mainContent\}>
          \{\/\* Header Card \*\/\}
          <View style=\{styles\.headerContainer\}>
            <SoftCard style=\{styles\.headerCard\}>
              <View style=\{styles\.headerTop\}>
                <View>
                  <Text style=\{styles\.greeting\}>Status Piket Hari Ini</Text>
                  <Text style=\{styles\.dateText\}>\{todayDate\}</Text>
                </View>
                <TouchableOpacity onPress=\{handleLogout\} style=\{styles\.logoutBtn\}>
                  <Text style=\{styles\.logoutText\}>Keluar</Text>
                </TouchableOpacity>
              </View>

              <View style=\{styles\.toggleContainer\}>
                <View style=\{\{ flex: 1 \}\}>
                  <Text style=\{styles\.toggleLabel\}>Kehadiran</Text>
                  <Text style=\{\[styles\.toggleStatus, \{ color: isReady \? COLORS\.primary : COLORS\.textMuted \}\]\}>
                    \{isReady \? 'SEDANG BERTUGAS' : 'ISTIRAHAT'\}
                  </Text>
                </View>
                <MechanicalToggle
                  value=\{isReady\}
                  onValueChange=\{async \(val\) => \{
                    try \{
                      await api\.post\('\/piket\/status', \{ is_ready: val \}\);
                      setIsReady\(val\);
                    \} catch\(e\) \{\}
                  \}\}
                />
              </View>

              \{\/\* Scan Button \*\/\}
              \{isReady && \(
                <View style=\{styles\.scanActionRow\}>
                  <TouchableOpacity style=\{styles\.scanBtn\} onPress=\{\(\) => expoRouter\.push\('\/scan-qr'\)\}>
                    <MaterialCommunityIcons name="qrcode-scan" size=\{24\} color=\{COLORS\.onPrimary\} />
                    <Text style=\{styles\.scanBtnText\}>Pindai QR Siswa Keluar</Text>
                  </TouchableOpacity>
                </View>
              \)\}
            </SoftCard>
          </View>

          \{\/\* Content Area \*\/\}
          <View style=\{styles\.contentContainer\}>
            <View style=\{styles\.sectionHeader\}>
              <Text style=\{styles\.sectionTitle\}>Antrean Persetujuan</Text>
              <View style=\{styles\.badgeCount\}>
                <Text style=\{styles\.badgeCountText\}>\{pendingTickets\.length\}</Text>
              </View>
            </View>

            <FlatList
              data=\{pendingTickets\}
              keyExtractor=\{\(item\) => item\.id\}
              contentContainerStyle=\{styles\.listContent\}
              showsVerticalScrollIndicator=\{false\}
              renderItem=\{\(\{ item \}\) => \(
                <View style=\{styles\.ticketWrapper\}>
                  <View style=\{styles\.ticketHeaderRow\}>
                    <AvatarInitials name=\{item\.siswa\?\.name \|\| 'Siswa'\} size=\{40\} fontSize=\{16\} />
                    <View style=\{styles\.ticketMeta\}>
                      <Text style=\{styles\.ticketName\}>\{item\.siswa\?\.name \|\| 'Siswa'\}</Text>
                      <Text style=\{styles\.ticketClass\}>\{item\.kelas\?\.nama_kelas \|\| 'Kelas'\}</Text>
                    </View>
                  </View>

                  <TicketCard
                    item=\{item\}
                    onPress=\{\(\) => expoRouter\.push\(`/ticket/$\{item\.id\}`\)\}
                  />

                  <View style=\{styles\.actionRow\}>
                    <BouncyButton
                      title="Tolak"
                      variant="danger"
                      onPress=\{\(\) => handleReject\(item\.id\)\}
                      style=\{styles\.actionBtn\}
                    />
                    <BouncyButton
                      title="Setujui & Terbitkan QR"
                      onPress=\{\(\) => handleApprove\(item\.id\)\}
                      style=\{styles\.actionBtn\}
                    />
                  </View>
                </View>
              \)\}
              ListEmptyComponent=\{<Text style=\{styles\.emptyText\}>Tidak ada antrean persetujuan\.</Text>\}
            />
          </View>
        </View>

        <GlassFAB onPress=\{\(\) => expoRouter\.push\('\/scan-qr'\)\} icon="qrcode-scan" />"""

replace_block = """        <TopAppBar
          showAvatar={true}
          avatarLabel={user?.name?.charAt(0)?.toUpperCase() || 'P'}
          showNotification={true}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.mainContent}>
            {/* Header Card Status Piket */}
            <View style={styles.headerContainer}>
              <SoftCard style={styles.headerCard}>
                <View style={styles.headerTop}>
                  <View>
                    <Text style={styles.greeting}>Status Piket Hari Ini</Text>
                    <Text style={styles.dateText}>{todayDate}</Text>
                  </View>
                  <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Keluar</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.toggleContainer}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleLabel}>Kehadiran</Text>
                    <Text style={[styles.toggleStatus, { color: isReady ? COLORS.primary : COLORS.textMuted }]}>
                      {isReady ? 'SEDANG BERTUGAS' : 'ISTIRAHAT'}
                    </Text>
                  </View>
                  <MechanicalToggle
                    value={isReady}
                    onValueChange={async (val) => {
                      try {
                        await api.post('/piket/status', { is_ready: val });
                        setIsReady(val);
                      } catch(e) {}
                    }}
                  />
                </View>

                {/* Scan Button */}
                {isReady && (
                  <View style={styles.scanActionRow}>
                    <TouchableOpacity style={styles.scanBtn} onPress={() => expoRouter.push('/scan-qr')}>
                      <MaterialCommunityIcons name="qrcode-scan" size={24} color={COLORS.onPrimary} />
                      <Text style={styles.scanBtnText}>Pindai QR Siswa Keluar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </SoftCard>
            </View>

            {/* Antrean Persetujuan Area */}
            <View style={styles.contentContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Antrean Persetujuan</Text>
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{pendingTickets.length}</Text>
                </View>
              </View>

              {pendingTickets.length > 0 ? pendingTickets.map((item) => (
                <View key={item.id} style={styles.ticketWrapper}>
                  <View style={styles.ticketHeaderRow}>
                    <AvatarInitials name={item.siswa?.name || 'Siswa'} size={40} fontSize={16} />
                    <View style={styles.ticketMeta}>
                      <Text style={styles.ticketName}>{item.siswa?.name || 'Siswa'}</Text>
                      <Text style={styles.ticketClass}>{item.kelas?.nama_kelas || 'Kelas'}</Text>
                    </View>
                  </View>

                  <TicketCard
                    item={item}
                    onPress={() => expoRouter.push(`/ticket/${item.id}`)}
                  />

                  <View style={styles.actionRow}>
                    <BouncyButton
                      title="Tolak"
                      variant="danger"
                      onPress={() => handleReject(item.id)}
                      style={styles.actionBtn}
                    />
                    <BouncyButton
                      title="Setujui & Terbitkan QR"
                      onPress={() => handleApprove(item.id)}
                      style={styles.actionBtn}
                    />
                  </View>
                </View>
              )) : (
                <Text style={styles.emptyText}>Tidak ada antrean persetujuan.</Text>
              )}
            </View>

            {/* Log Hari Ini Area inside a Card Container */}
            <View style={styles.contentContainer}>
              <SoftCard style={{ marginTop: SPACING.xl, marginBottom: SPACING.md }}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Log Hari Ini</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, marginBottom: SPACING.md }}>
                  <View style={[styles.statCard, { backgroundColor: COLORS.primaryContainer }]}>
                    <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{dailyLogStats.total}</Text>
                    <Text style={styles.statLabel}>Total Izin</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: COLORS.secondaryContainer }]}>
                    <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{dailyLogStats.scanned}</Text>
                    <Text style={styles.statLabel}>Telah Keluar</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: COLORS.tertiaryContainer }]}>
                    <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{dailyLogStats.total - dailyLogStats.scanned}</Text>
                    <Text style={styles.statLabel}>Menunggu</Text>
                  </View>
                </View>

                {dailyLogs.length > 0 ? dailyLogs.map((item) => (
                  <DailyLogCard key={item.id} item={item} />
                )) : (
                  <Text style={styles.emptyText}>Belum ada log hari ini.</Text>
                )}
              </SoftCard>
            </View>

          </View>
        </ScrollView>

        <GlassFAB onPress={() => expoRouter.push('/scan-qr')} icon="qrcode-scan" style={{ bottom: 90 }} />"""

content = re.sub(search_block, replace_block, content, flags=re.DOTALL)

with open("mobile-app/app/(piket)/dashboard.tsx", "w") as f:
    f.write(content)
